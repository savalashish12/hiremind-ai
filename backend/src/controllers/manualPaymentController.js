const crypto = require("crypto");
const prisma = require("../config/prisma");
const payee = require("../config/manualPayment");
const logActivity = require("../utils/activityLogger");
const { pushToUser } = require("../utils/sseManager");

const PLAN_PRICES = {
  PRO: { monthly: 99, yearly: 990 },
  PREMIUM: { monthly: 299, yearly: 2990 },
};

function resolveAmount(planName, billingCycle) {
  const plan = PLAN_PRICES[String(planName || "").toUpperCase()];
  if (!plan) return null;
  if (billingCycle === "yearly") return plan.yearly;
  if (billingCycle === "monthly") return plan.monthly;
  return null;
}

function upiPayString(upiId, amount, orderId) {
  const params = new URLSearchParams({
    pa: upiId,
    pn: payee.payeeName,
    am: String(amount),
    cu: "INR",
    tn: `${payee.merchantLabel} ${orderId}`.slice(0, 80),
    tr: String(orderId).slice(0, 35),
  });
  return `upi://pay?${params.toString()}`;
}

// GET /api/payment/manual/payee — owner QR + UPI details for checkout UI
exports.getPayeeConfig = async (req, res) => {
  try {
    const { amount, orderId } = req.query;
    const primaryUpi = payee.upiIds[0] || "";
    return res.status(200).json({
      success: true,
      payeeName: payee.payeeName,
      merchant: payee.merchantLabel,
      upiIds: payee.upiIds,
      primaryUpi,
      qrImageUrl: payee.qrImageUrl,
      qrBackendUrl: payee.qrBackendUrl,
      supportEmail: payee.supportEmail,
      // Auto-generated UPI intent string (works with any UPI app scanner)
      upiString:
        amount && orderId && primaryUpi
          ? upiPayString(primaryUpi, amount, orderId)
          : upiPayString(primaryUpi, amount || 99, orderId || "HIREMIND-DEMO"),
    });
  } catch (error) {
    console.error("getPayeeConfig error:", error);
    return res.status(500).json({ success: false, message: "Failed to load payee details" });
  }
};

// POST /api/payment/manual/create { planName, billingCycle }
exports.createManualOrder = async (req, res) => {
  try {
    const { planName, billingCycle } = req.body;
    const amount = resolveAmount(planName, billingCycle);
    if (!planName || !billingCycle) {
      return res.status(400).json({ success: false, message: "Plan name and billing cycle are required" });
    }
    if (amount === null) {
      return res.status(400).json({ success: false, message: "Invalid plan selected" });
    }
    const orderId = `order_manual_${crypto.randomBytes(8).toString("hex")}`;
    const primaryUpi = payee.upiIds[0] || "";
    return res.status(200).json({
      success: true,
      orderId,
      amount,
      currency: "INR",
      planName: String(planName).toUpperCase(),
      billingCycle,
      payeeName: payee.payeeName,
      merchant: payee.merchantLabel,
      upiIds: payee.upiIds,
      qrImageUrl: payee.qrImageUrl,
      upiString: upiPayString(primaryUpi, amount, orderId),
    });
  } catch (error) {
    console.error("createManualOrder error:", error);
    return res.status(500).json({ success: false, message: "Failed to create payment order" });
  }
};

// POST /api/payment/manual/submit { orderId, planName, billingCycle, amount, payerUpi, utr }
exports.submitManualPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId, planName, billingCycle, amount, payerUpi, utr } = req.body;

    if (!orderId || !planName || !billingCycle || !amount || !payerUpi || !utr) {
      return res.status(400).json({
        success: false,
        message: "Pay via the QR/UPI shown, then submit your UPI ID and 12-digit UTR / Ref No.",
      });
    }

    const cleanUtr = String(utr).replace(/\s+/g, "").toUpperCase();
    if (!payee.utrPattern.test(cleanUtr)) {
      return res.status(400).json({
        success: false,
        message: "Invalid UTR / Ref No. Enter the 12-digit UTR from your UPI app (GPay/PhonePe/Paytm history).",
      });
    }
    if (!String(payerUpi).includes("@")) {
      return res.status(400).json({ success: false, message: "Invalid payer UPI ID (e.g. yourname@okhdfc)." });
    }

    const expected = resolveAmount(planName, billingCycle);
    if (expected === null || Number(amount) !== expected) {
      return res.status(400).json({ success: false, message: "Plan amount mismatch. Please restart checkout." });
    }

    // Prevent duplicate UTR reuse across users
    const existing = await prisma.payment.findUnique({ where: { transactionId: cleanUtr } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "This UTR has already been submitted. Check your UPI history or contact support.",
      });
    }

    const payment = await prisma.payment.create({
      data: {
        userId,
        transactionId: cleanUtr,
        paymentMethod: "MANUAL_UPI",
        amount: parseFloat(amount),
        status: "PENDING",
        planName: String(planName).toUpperCase(),
        billingCycle,
        orderId,
        payerUpi: String(payerUpi).trim(),
      },
    });

    await prisma.notification.create({
      data: {
        userId,
        title: "Payment submitted for verification ⏳",
        message: `We received UTR ${cleanUtr} for ₹${amount} (${String(planName).toUpperCase()} / ${billingCycle}). Admin will verify and activate your plan shortly.`,
      },
    });
    pushToUser(userId, { type: "notification", title: "Payment submitted for verification ⏳", message: `UTR ${cleanUtr} received. Admin will verify shortly.` });

    logActivity({ userId, action: "PAYMENT_SUBMITTED", entity: "Payment", entityId: payment.id, details: `UTR ${cleanUtr} for ₹${amount} (${String(planName).toUpperCase()}/${billingCycle})`, req });

    return res.status(201).json({
      success: true,
      message: "Payment submitted. Status: PENDING verification.",
      paymentId: payment.id,
      transactionId: payment.transactionId,
      status: payment.status,
    });
  } catch (error) {
    console.error("submitManualPayment error:", error);
    return res.status(500).json({ success: false, message: "Failed to submit payment" });
  }
};

// GET /api/payment/manual/history — own payments incl. PENDING (plus legacy rows)
exports.getMyPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ success: true, payments });
  } catch (error) {
    console.error("getMyPayments error:", error);
    // Prisma client may be stale if `prisma generate` hasn't run after schema change
    if (String(error.message || "").includes("Unknown argument") || String(error.message || "").includes("planName")) {
      return res.status(500).json({
        success: false,
        message: "Database schema out of date. Run: cd backend && npx prisma db push && npx prisma generate",
      });
    }
    return res.status(500).json({ success: false, message: "Failed to fetch payment history" });
  }
};

// GET /api/payment/manual/admin/pending — ADMIN
exports.getPendingPayments = async (req, res) => {
  try {
    const pending = await prisma.payment.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { fullName: true, email: true, role: true } } },
    });
    return res.status(200).json({ success: true, payments: pending });
  } catch (error) {
    console.error("getPendingPayments error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch pending payments" });
  }
};

async function activateSubscription(userId, planName, billingCycle) {
  const expiryDate = new Date();
  if (billingCycle === "yearly") expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  else expiryDate.setDate(expiryDate.getDate() + 30);

  await prisma.subscription.upsert({
    where: { userId },
    update: { planName: String(planName).toUpperCase(), startDate: new Date(), expiryDate, status: "ACTIVE" },
    create: { userId, planName: String(planName).toUpperCase(), startDate: new Date(), expiryDate, status: "ACTIVE" },
  });
  await prisma.user.update({
    where: { id: userId },
    data: { subscriptionTier: String(planName).toUpperCase(), subscriptionEndsAt: expiryDate },
  });
  return expiryDate;
}

// POST /api/payment/manual/admin/:id/approve — ADMIN
exports.approvePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body || {};
    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
    if (payment.status !== "PENDING") {
      return res.status(400).json({ success: false, message: `Payment is already ${payment.status}` });
    }
    if (!payment.planName || !payment.billingCycle) {
      return res.status(400).json({ success: false, message: "Legacy payment row has no plan info; cannot approve." });
    }

    const expiryDate = await activateSubscription(payment.userId, payment.planName, payment.billingCycle);
    await prisma.payment.update({
      where: { id },
      data: { status: "SUCCESS", adminNote: note || null, reviewedAt: new Date(), reviewedBy: req.user.id },
    });
    await prisma.notification.create({
      data: {
        userId: payment.userId,
        title: "Subscription Activated! 🎉",
        message: `Your UPI payment (UTR ${payment.transactionId}) is verified. ${payment.planName} plan active till ${expiryDate.toLocaleDateString()}.`,
      },
    });
    pushToUser(payment.userId, { type: "notification", title: "Subscription Activated! 🎉", message: `UTR ${payment.transactionId} verified. ${payment.planName} plan active.` });
    logActivity({ userId: req.user.id, action: "PAYMENT_APPROVED", entity: "Payment", entityId: id, details: `UTR ${payment.transactionId} (₹${payment.amount}) approved`, req });
    return res.status(200).json({ success: true, message: "Payment approved and subscription activated" });
  } catch (error) {
    console.error("approvePayment error:", error);
    return res.status(500).json({ success: false, message: "Failed to approve payment" });
  }
};

// POST /api/payment/manual/admin/:id/reject — ADMIN
exports.rejectPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};
    if (!reason || String(reason).trim().length < 3) {
      return res.status(400).json({ success: false, message: "Rejection reason is required" });
    }
    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
    if (payment.status !== "PENDING") {
      return res.status(400).json({ success: false, message: `Payment is already ${payment.status}` });
    }
    await prisma.payment.update({
      where: { id },
      data: { status: "REJECTED", adminNote: String(reason), reviewedAt: new Date(), reviewedBy: req.user.id },
    });
    await prisma.notification.create({
      data: {
        userId: payment.userId,
        title: "Payment verification failed",
        message: `UTR ${payment.transactionId} could not be verified. Reason: ${reason}. Please re-check and resubmit${payee.supportEmail ? ` or contact ${payee.supportEmail}` : ""}.`,
      },
    });
    pushToUser(payment.userId, { type: "notification", title: "Payment verification failed", message: `UTR ${payment.transactionId} rejected: ${reason}.` });
    logActivity({ userId: req.user.id, action: "PAYMENT_REJECTED", entity: "Payment", entityId: id, details: `UTR ${payment.transactionId} rejected: ${reason}`, req });
    return res.status(200).json({ success: true, message: "Payment rejected" });
  } catch (error) {
    console.error("rejectPayment error:", error);
    return res.status(500).json({ success: false, message: "Failed to reject payment" });
  }
};
