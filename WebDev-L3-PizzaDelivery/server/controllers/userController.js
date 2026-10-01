const User = require('../models/User');
const Order = require('../models/Order');

// @desc  Get all customers (admin)
// @route GET /api/users
const getCustomers = async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const filter = { role: 'customer' };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  const skip = (Number(page) - 1) * Number(limit);
  const total = await User.countDocuments(filter);
  const users = await User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
  res.json({ success: true, total, users });
};

// @desc  Get single customer
// @route GET /api/users/:id
const getCustomer = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  const orders = await Order.find({ customer: user._id }).sort({ createdAt: -1 }).limit(10);
  res.json({ success: true, user, orders });
};

// @desc  Toggle user active status (admin)
// @route PATCH /api/users/:id/toggle
const toggleUserStatus = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot modify admin accounts.' });
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}!`, user });
};

module.exports = { getCustomers, getCustomer, toggleUserStatus };
