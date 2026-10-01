const crypto = require('crypto');
const Order = require('../models/Order');

// Check if Razorpay keys are configured
const isRazorpayConfigured = () => {
  return process.env.RAZORPAY_KEY_ID && 
         process.env.RAZORPAY_KEY_SECRET && 
         process.env.RAZORPAY_KEY_ID !== 'rzp_test_your_key_id' &&
         process.env.RAZORPAY_KEY_SECRET !== 'your_razorpay_key_secret';
};

// @desc  Create Razorpay order
// @route POST /api/payment/create-order
const createPaymentOrder = async (req, res) => {
  const { amount, currency = 'INR', receipt } = req.body;

  if (!amount || amount < 1) {
    return res.status(400).json({ success: false, message: 'Valid amount required.' });
  }

  // Development mock mode when Razorpay not configured
  if (!isRazorpayConfigured()) {
    const mockOrderId = `mock_order_${Date.now()}`;
    return res.json({
      success: true,
      mode: 'mock',
      order: {
        id: mockOrderId,
        amount: amount * 100,
        currency,
        receipt,
      },
      key: 'rzp_test_mock',
      message: 'DEVELOPMENT MODE: Using mock payment. Configure RAZORPAY_KEY_ID to use real payments.',
    });
  }

  try {
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    });

    res.json({
      success: true,
      mode: 'live',
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Razorpay error:', error);
    res.status(500).json({ success: false, message: 'Payment gateway error. Please try again.' });
  }
};

// @desc  Verify Razorpay payment
// @route POST /api/payment/verify
const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ success: false, message: 'Order ID required.' });
  }

  // Mock payment verification for development
  if (!isRazorpayConfigured() || razorpay_order_id?.startsWith('mock_order_')) {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    order.paymentStatus = 'PAID';
    order.razorpay = {
      orderId: razorpay_order_id || 'mock_order',
      paymentId: razorpay_payment_id || 'mock_payment',
      signature: razorpay_signature || 'mock_signature',
    };
    order.statusHistory.push({ status: order.status, note: 'Payment verified (mock mode).' });
    await order.save();

    return res.json({ success: true, message: 'Payment verified (development mode)!', order });
  }

  // Real Razorpay signature verification
  try {
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    order.paymentStatus = 'PAID';
    order.razorpay = { orderId: razorpay_order_id, paymentId: razorpay_payment_id, signature: razorpay_signature };
    order.statusHistory.push({ status: order.status, note: 'Payment verified successfully.' });
    await order.save();

    res.json({ success: true, message: 'Payment verified successfully!', order });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: 'Payment verification failed.' });
  }
};

module.exports = { createPaymentOrder, verifyPayment };
