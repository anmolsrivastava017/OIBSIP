const Order = require('../models/Order');
const Pizza = require('../models/Pizza');
const User = require('../models/User');

// @desc  Create order
// @route POST /api/orders
const createOrder = async (req, res) => {
  const { items, deliveryAddress, paymentMethod, couponCode } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Order must have at least one item.' });
  }
  if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.postalCode) {
    return res.status(400).json({ success: false, message: 'Complete delivery address required.' });
  }
  if (!['COD', 'RAZORPAY'].includes(paymentMethod)) {
    return res.status(400).json({ success: false, message: 'Invalid payment method.' });
  }

  // Validate items and calculate pricing
  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const pizza = await Pizza.findById(item.pizzaId);
    if (!pizza) {
      return res.status(404).json({ success: false, message: `Pizza not found: ${item.pizzaId}` });
    }
    if (!pizza.isAvailable || pizza.stock < item.quantity) {
      return res.status(400).json({ success: false, message: `${pizza.name} is unavailable or out of stock.` });
    }

    const sizeObj = pizza.sizes.find((s) => s.name === item.size);
    if (!sizeObj) {
      return res.status(400).json({ success: false, message: `Invalid size "${item.size}" for ${pizza.name}` });
    }

    const itemPrice = sizeObj.discountPrice || sizeObj.price;
    const addOnTotal = (item.addOns || []).reduce((sum, ao) => sum + (ao.price || 0), 0);
    const itemSubtotal = (itemPrice + addOnTotal) * item.quantity;

    orderItems.push({
      pizza: pizza._id,
      name: pizza.name,
      image: pizza.image,
      size: item.size,
      price: itemPrice + addOnTotal,
      quantity: item.quantity,
      addOns: item.addOns || [],
      subtotal: itemSubtotal,
    });

    subtotal += itemSubtotal;
  }

  const deliveryFee = subtotal >= 500 ? 0 : 40;
  const tax = Math.round(subtotal * 0.05);
  const discount = 0; // coupon logic can be extended
  const total = subtotal + deliveryFee + tax - discount;

  const enrichedDeliveryAddress = {
    ...deliveryAddress,
    name: deliveryAddress.name || req.user.name || 'Customer',
    email: deliveryAddress.email || req.user.email || 'customer@pizzahub.com',
    phone: deliveryAddress.phone || req.user.phone || '9999999999',
  };

  const order = await Order.create({
    customer: req.user._id,
    items: orderItems,
    deliveryAddress: enrichedDeliveryAddress,
    paymentMethod,
    couponCode: couponCode || '',
    pricing: { subtotal, deliveryFee, discount, tax, total },
    paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
    statusHistory: [{ status: 'PLACED', note: 'Order placed successfully.' }],
    estimatedDelivery: new Date(Date.now() + 45 * 60 * 1000), // 45 min
  });

  // Decrease stock
  for (const item of items) {
    await Pizza.findByIdAndUpdate(item.pizzaId, {
      $inc: { stock: -item.quantity },
    });
    // Set unavailable if stock drops to 0
    const updated = await Pizza.findById(item.pizzaId);
    if (updated && updated.stock <= 0) {
      updated.isAvailable = false;
      updated.stock = 0;
      await updated.save();
    }
  }

  // Update customer stats
  await User.findByIdAndUpdate(req.user._id, {
    $inc: { totalOrders: 1, totalSpent: total },
  });

  const populated = await Order.findById(order._id)
    .populate('customer', 'name email phone')
    .populate('items.pizza', 'name image');

  // Emit socket event to admin
  const io = req.app.get('io');
  if (io) io.to('admin-room').emit('new-order', populated);

  res.status(201).json({ success: true, message: 'Order placed!', order: populated });
};

// @desc  Get customer orders
// @route GET /api/orders/my
const getMyOrders = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const total = await Order.countDocuments({ customer: req.user._id });
  const orders = await Order.find({ customer: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate('items.pizza', 'name image');

  res.json({ success: true, total, orders });
};

// @desc  Get single order
// @route GET /api/orders/:id
const getOrder = async (req, res) => {
  const filter = { _id: req.params.id };
  if (req.user.role !== 'admin') filter.customer = req.user._id;

  const order = await Order.findOne(filter)
    .populate('customer', 'name email phone')
    .populate('items.pizza', 'name image');

  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
  res.json({ success: true, order });
};

// @desc  Update order status (admin)
// @route PATCH /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  const { status, note } = req.body;
  const validStatuses = ['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status.' });
  }

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

  order.status = status;
  order.statusHistory.push({ status, note: note || '' });
  if (status === 'DELIVERED') {
    order.deliveredAt = new Date();
    if (order.paymentMethod === 'COD') order.paymentStatus = 'PAID';
  }
  if (status === 'CANCELLED') order.cancelledAt = new Date();

  await order.save();
  const populated = await Order.findById(order._id)
    .populate('customer', 'name email phone')
    .populate('items.pizza', 'name image');

  // Real-time socket update
  const io = req.app.get('io');
  if (io) {
    io.to(`order-${order._id}`).emit('order-status-update', {
      orderId: order._id,
      status: order.status,
      statusHistory: order.statusHistory,
    });
    io.to('admin-room').emit('order-updated', populated);
  }

  res.json({ success: true, message: `Order status updated to ${status}!`, order: populated });
};

// @desc  Get all orders (admin)
// @route GET /api/orders
const getAllOrders = async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const filter = {};
  if (status && status !== 'ALL') filter.status = status;
  if (search) filter.orderNumber = { $regex: search, $options: 'i' };

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate('customer', 'name email phone')
    .populate('items.pizza', 'name image');

  res.json({ success: true, total, orders });
};

// @desc  Admin dashboard stats
// @route GET /api/orders/stats
const getStats = async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const totalRevenue = await Order.aggregate([
    { $match: { paymentStatus: 'PAID' } },
    { $group: { _id: null, total: { $sum: '$pricing.total' } } },
  ]);
  const totalCustomers = await User.countDocuments({ role: 'customer' });
  const statusCounts = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  // Revenue last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const dailyRevenue = await Order.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo }, paymentStatus: 'PAID' } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$pricing.total' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('customer', 'name email');

  const Pizza = require('../models/Pizza');
  const lowStock = await Pizza.find({ stock: { $lte: 10 } }).limit(5);

  res.json({
    success: true,
    stats: {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalCustomers,
      statusCounts,
      dailyRevenue,
      recentOrders,
      lowStock,
    },
  });
};

module.exports = { createOrder, getMyOrders, getOrder, updateOrderStatus, getAllOrders, getStats };
