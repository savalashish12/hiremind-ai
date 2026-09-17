const Razorpay = require('razorpay');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
  });
};

exports.createOrder = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Candidate plan: ₹999 (99900 paise), Recruiter plan: ₹4999 (499900 paise)
    const amount = user.role === 'RECRUITER' ? 499900 : 99900;
    
    const razorpay = getRazorpayInstance();
    const options = {
      amount,
      currency: 'INR',
      receipt: `receipt_${user.id}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Save order ID to user
    await prisma.user.update({
      where: { id: user.id },
      data: { razorpayOrderId: order.id }
    });

    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      role: user.role
    });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return res.status(500).json({ success: false, message: 'Failed to create payment order' });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing signature parameters' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Signature matches, upgrade user
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        subscriptionTier: 'PREMIUM',
        subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 Days
      }
    });

    // Create system notification for user upgrade
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        title: 'Subscription Upgraded!',
        message: 'Congratulations! Your account has been upgraded to Premium Tier.'
      }
    });

    // Redact password
    delete updatedUser.password;

    return res.status(200).json({
      success: true,
      message: 'Payment verified and upgraded to Premium!',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    return res.status(500).json({ success: false, message: 'Internal server error verifying signature' });
  }
};

exports.handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

    const shasum = crypto.createHmac('sha256', webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest !== signature) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    // Webhook is authentic. Handle order payment captured event
    const event = req.body;
    if (event.event === 'order.paid' || event.event === 'payment.captured') {
      const paymentEntity = event.payload.payment.entity;
      const orderId = paymentEntity.order_id;

      if (orderId) {
        // Upgrade the matching user record
        const user = await prisma.user.findFirst({
          where: { razorpayOrderId: orderId }
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionTier: 'PREMIUM',
              subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
          });

          await prisma.notification.create({
            data: {
              userId: user.id,
              title: 'Subscription Upgraded (Webhook)',
              message: 'Your payment was cleared successfully by our gateway.'
            }
          });
        }
      }
    }

    return res.status(200).json({ status: 'ok' });

  } catch (error) {
    console.error('Razorpay Webhook Error:', error);
    return res.status(500).json({ success: false, message: 'Webhook processing error' });
  }
};
