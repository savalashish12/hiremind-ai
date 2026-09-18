const crypto = require('crypto');
const prisma = require('../config/prisma');
const PDFDocument = require('pdfkit');
const { pushToUser } = require('../utils/sseManager');

// 1. Create Fake Order ID
exports.createFakeOrder = async (req, res) => {
  try {
    const { planName, billingCycle } = req.body;

    if (!planName || !billingCycle) {
      return res.status(400).json({ success: false, message: 'Plan name and billing cycle are required' });
    }

    // Determine amount
    // Pro Plan: ₹99/mo or ₹990/yr. Premium Plan: ₹299/mo or ₹2990/yr
    let amount = 0;
    if (planName.toUpperCase() === 'PRO') {
      amount = billingCycle === 'yearly' ? 990 : 99;
    } else if (planName.toUpperCase() === 'PREMIUM') {
      amount = billingCycle === 'yearly' ? 2990 : 299;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid plan selected' });
    }

    const orderId = `order_fake_${crypto.randomBytes(8).toString('hex')}`;

    return res.status(200).json({
      success: true,
      orderId,
      amount,
      currency: 'INR',
      planName: planName.toUpperCase(),
      billingCycle,
    });
  } catch (error) {
    console.error('Error creating fake order:', error);
    return res.status(500).json({ success: false, message: 'Failed to create payment order' });
  }
};

// 2. Process Fake Payment with 10% failure simulation
exports.processFakePayment = async (req, res) => {
  try {
    const { orderId, planName, billingCycle, amount, paymentMethod } = req.body;
    const userId = req.user.id;

    if (!orderId || !planName || !billingCycle || !amount || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'Missing payment processing parameters' });
    }

    // Simulate random payment failure (10% chance)
    const isFailed = Math.random() < 0.10;

    if (isFailed) {
      const transactionId = `txn_fail_${crypto.randomBytes(10).toString('hex')}`;
      
      // Store failed payment
      const payment = await prisma.payment.create({
        data: {
          userId,
          transactionId,
          paymentMethod,
          amount: parseFloat(amount),
          status: 'FAILED',
        },
      });

      // Notify user of failure
      await prisma.notification.create({
        data: {
          userId,
          title: 'Subscription Payment Failed',
          message: `Your payment of ₹${amount} for the ${planName} Plan has failed. Reason: Issuer bank declined.`,
        },
      });
      pushToUser(userId, { type: 'notification', title: 'Subscription Payment Failed', message: `Payment of ₹${amount} failed.` });

      return res.status(200).json({
        success: false,
        errorCode: 'ERR_CARD_DECLINED',
        message: 'Transaction declined by issuer bank. Please check credentials or use another method.',
        transactionId,
        paymentId: payment.id,
      });
    }

    // Success flow
    const transactionId = `txn_${crypto.randomBytes(12).toString('hex')}`;
    const expiryDate = new Date();
    if (billingCycle === 'yearly') {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    } else {
      expiryDate.setDate(expiryDate.getDate() + 30);
    }

    // Create payment entry
    const payment = await prisma.payment.create({
      data: {
        userId,
        transactionId,
        paymentMethod,
        amount: parseFloat(amount),
        status: 'SUCCESS',
      },
    });

    // Create or update subscription entry
    await prisma.subscription.upsert({
      where: { userId },
      update: {
        planName: planName.toUpperCase(),
        startDate: new Date(),
        expiryDate,
        status: 'ACTIVE',
      },
      create: {
        userId,
        planName: planName.toUpperCase(),
        startDate: new Date(),
        expiryDate,
        status: 'ACTIVE',
      },
    });

    // Sync on User cache fields
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: planName.toUpperCase(),
        subscriptionEndsAt: expiryDate,
      },
    });

    // Send positive platform notification
    await prisma.notification.create({
      data: {
        userId,
        title: 'Subscription Activated! 🎉',
        message: `Success! You are now subscribed to the ${planName} Plan until ${expiryDate.toLocaleDateString()}.`,
      },
    });
    pushToUser(userId, { type: 'notification', title: 'Subscription Activated! 🎉', message: `You are now on the ${planName} Plan.` });

    return res.status(200).json({
      success: true,
      transactionId,
      paymentId: payment.id,
      orderId,
      amount,
      planName: planName.toUpperCase(),
      date: new Date(),
    });
  } catch (error) {
    console.error('Error processing fake payment:', error);
    return res.status(500).json({ success: false, message: 'Internal server error processing transaction' });
  }
};

// 3. User Payment History
exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ success: true, payments });
  } catch (error) {
    console.error('Error retrieving payment history:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch payment history' });
  }
};

// 4. Admin Payment Stats
exports.getAdminPaymentStats = async (req, res) => {
  try {
    // 1. Total Revenue from successful payments
    const successfulPayments = await prisma.payment.findMany({
      where: { status: 'SUCCESS' },
    });
    const totalRevenue = successfulPayments.reduce((acc, pay) => acc + pay.amount, 0);

    // 2. Active Subscriptions count
    const activeSubCount = await prisma.subscription.count({
      where: {
        status: 'ACTIVE',
        expiryDate: { gte: new Date() },
      },
    });

    // 3. Recent Transactions
    const recentTransactions = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // 4. Plan Distribution
    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        expiryDate: { gte: new Date() },
      },
    });
    const distribution = { PRO: 0, PREMIUM: 0 };
    activeSubscriptions.forEach((sub) => {
      const plan = sub.planName.toUpperCase();
      if (distribution[plan] !== undefined) {
        distribution[plan]++;
      }
    });

    // 5. Generate last 7 days revenue for chart representation
    const revenueByDay = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const dayRevenue = successfulPayments
        .filter((pay) => pay.createdAt >= dayStart && pay.createdAt <= dayEnd)
        .reduce((sum, pay) => sum + pay.amount, 0);

      revenueByDay.push({
        date: dayStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        revenue: dayRevenue,
      });
    }

    return res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        activeSubscriptions: activeSubCount,
        recentTransactions,
        planDistribution: distribution,
        revenueChart: revenueByDay,
      },
    });
  } catch (error) {
    console.error('Error generating admin stats:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch admin stats' });
  }
};

// 5. Download Professional PDF Invoice
exports.downloadInvoice = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: true,
      },
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice_${payment.transactionId}.pdf`);

    doc.pipe(res);

    // Style colors
    const primaryColor = '#2563EB'; // Blue
    const darkColor = '#1F2937';
    const lightText = '#4B5563';
    const gridBorder = '#E5E7EB';

    // 1. Title & Header
    doc.fillColor(primaryColor).fontSize(20).font('Helvetica-Bold').text('HireMind AI', 50, 50);
    doc.fillColor(darkColor).fontSize(10).font('Helvetica').text('AI Recruitment Platform', 50, 75);
    doc.text('support@hiremind.ai', 50, 88);

    doc.fillColor(primaryColor).fontSize(22).font('Helvetica-Bold').text('INVOICE', 400, 50, { align: 'right' });
    doc.fillColor(darkColor).fontSize(9).font('Helvetica-Bold').text(`Invoice #: HM-${payment.id.slice(0, 8).toUpperCase()}`, 400, 75, { align: 'right' });
    doc.font('Helvetica').text(`Date: ${payment.createdAt.toLocaleDateString()}`, 400, 88, { align: 'right' });

    // Draw Line separator
    doc.strokeColor(gridBorder).lineWidth(1).moveTo(50, 115).lineTo(545, 115).stroke();

    // 2. Billing details
    doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold').text('Billed To:', 50, 135);
    doc.fillColor(darkColor).fontSize(10).font('Helvetica-Bold').text(payment.user.fullName, 50, 150);
    doc.font('Helvetica').text(payment.user.email, 50, 163);
    doc.text(`Role: ${payment.user.role}`, 50, 176);

    doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold').text('Payment Method Details:', 350, 135);
    doc.fillColor(darkColor).fontSize(10).font('Helvetica').text(`Gateway: Fake Payment Portal`, 350, 150);
    doc.text(`Method: ${payment.paymentMethod}`, 350, 163);
    doc.font('Helvetica-Bold').text(`Txn ID: ${payment.transactionId}`, 350, 176);

    // Separator line
    doc.strokeColor(gridBorder).moveTo(50, 205).lineTo(545, 205).stroke();

    // 3. Invoice items grid
    let tableY = 230;
    doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('Description', 50, tableY);
    doc.text('Qty', 350, tableY, { width: 50, align: 'center' });
    doc.text('Price (INR)', 400, tableY, { width: 65, align: 'right' });
    doc.text('Total (INR)', 480, tableY, { width: 65, align: 'right' });

    // Draw line
    doc.strokeColor(gridBorder).lineWidth(1).moveTo(50, tableY + 15).lineTo(545, tableY + 15).stroke();

    // Item row
    tableY = 260;
    const isYearly = payment.amount === 990 || payment.amount === 2990;
    const planLabel = isYearly ? 'Pro/Premium Plan Subscription - Annual' : 'Pro/Premium Plan Subscription - Monthly';
    
    // Compute TAX
    const amount = payment.amount;
    const basePrice = amount / 1.18;
    const gstRate = '18% GST (9% CGST, 9% SGST)';
    const totalTax = amount - basePrice;

    doc.fillColor(darkColor).fontSize(9).font('Helvetica').text(planLabel, 50, tableY, { width: 280 });
    doc.text('1', 350, tableY, { width: 50, align: 'center' });
    doc.text(`₹${basePrice.toFixed(2)}`, 400, tableY, { width: 65, align: 'right' });
    doc.text(`₹${basePrice.toFixed(2)}`, 480, tableY, { width: 65, align: 'right' });

    // Separator line
    doc.strokeColor(gridBorder).moveTo(50, tableY + 25).lineTo(545, tableY + 25).stroke();

    // Summary calculation
    const summaryY = tableY + 50;
    doc.fontSize(9).font('Helvetica').text('Subtotal:', 380, summaryY, { align: 'right' });
    doc.text(`₹${basePrice.toFixed(2)}`, 480, summaryY, { align: 'right' });

    doc.text('CGST (9%):', 380, summaryY + 15, { align: 'right' });
    doc.text(`₹${(totalTax / 2).toFixed(2)}`, 480, summaryY + 15, { align: 'right' });

    doc.text('SGST (9%):', 380, summaryY + 30, { align: 'right' });
    doc.text(`₹${(totalTax / 2).toFixed(2)}`, 480, summaryY + 30, { align: 'right' });

    doc.fontSize(11).font('Helvetica-Bold').text('Total (Inclusive of Taxes):', 300, summaryY + 50, { align: 'right' });
    doc.text(`₹${amount.toFixed(2)}`, 480, summaryY + 50, { align: 'right' });

    // Footer note
    doc.fillColor(lightText).fontSize(8).font('Helvetica-Oblique').text('This is a simulated invoice created for academic & platform demonstration purposes. No actual currency transaction took place.', 50, 480, { align: 'center', width: 495 });

    doc.end();
  } catch (error) {
    console.error('Error generating PDF invoice:', error);
    return res.status(500).json({ success: false, message: 'Failed to build invoice' });
  }
};
