const Pizza = require('../models/Pizza');
const Category = require('../models/Category');

// @desc   Get all pizzas (with filters, search, sort, pagination)
// @route  GET /api/pizzas
const getPizzas = async (req, res) => {
  const { category, isVeg, search, sort, page = 1, limit = 20, featured, bestseller } = req.query;

  const filter = {};
  if (category) filter.category = category;
  if (isVeg !== undefined && isVeg !== '') filter.isVeg = isVeg === 'true';
  if (featured === 'true') filter.isFeatured = true;
  if (bestseller === 'true') filter.isBestseller = true;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
    ];
  }

  const sortMap = {
    'price-asc': { basePrice: 1 },
    'price-desc': { basePrice: -1 },
    newest: { createdAt: -1 },
    popular: { 'ratings.average': -1 },
    name: { name: 1 },
  };
  const sortOption = sortMap[sort] || { createdAt: -1 };

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Pizza.countDocuments(filter);
  const pizzas = await Pizza.find(filter)
    .populate('category', 'name slug')
    .sort(sortOption)
    .skip(skip)
    .limit(Number(limit));

  res.json({
    success: true,
    count: pizzas.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: Number(page),
    pizzas,
  });
};

// @desc   Get single pizza
// @route  GET /api/pizzas/:id
const getPizza = async (req, res) => {
  const pizza = await Pizza.findOne({
    $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { slug: req.params.id }],
  }).populate('category', 'name slug');

  if (!pizza) {
    return res.status(404).json({ success: false, message: 'Pizza not found.' });
  }
  res.json({ success: true, pizza });
};

// @desc   Create pizza (admin)
// @route  POST /api/pizzas
const createPizza = async (req, res) => {
  const { name, description, category, isVeg, isSpicy, isBestseller, isFeatured, ingredients, sizes, basePrice, image, stock, addOns, tags, preparationTime } = req.body;

  // Generate slug from name
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();

  const pizza = await Pizza.create({
    name, slug, description, category, isVeg, isSpicy, isBestseller, isFeatured,
    ingredients, sizes, basePrice, image, stock, addOns, tags, preparationTime,
  });

  const populated = await Pizza.findById(pizza._id).populate('category', 'name slug');
  res.status(201).json({ success: true, message: 'Pizza created!', pizza: populated });
};

// @desc   Update pizza (admin)
// @route  PUT /api/pizzas/:id
const updatePizza = async (req, res) => {
  const pizza = await Pizza.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('category', 'name slug');
  if (!pizza) return res.status(404).json({ success: false, message: 'Pizza not found.' });
  res.json({ success: true, message: 'Pizza updated!', pizza });
};

// @desc   Delete pizza (admin)
// @route  DELETE /api/pizzas/:id
const deletePizza = async (req, res) => {
  const pizza = await Pizza.findByIdAndDelete(req.params.id);
  if (!pizza) return res.status(404).json({ success: false, message: 'Pizza not found.' });
  res.json({ success: true, message: 'Pizza deleted!' });
};

// @desc   Toggle availability
// @route  PATCH /api/pizzas/:id/availability
const toggleAvailability = async (req, res) => {
  const pizza = await Pizza.findById(req.params.id);
  if (!pizza) return res.status(404).json({ success: false, message: 'Pizza not found.' });
  pizza.isAvailable = !pizza.isAvailable;
  await pizza.save();
  res.json({ success: true, message: `Pizza ${pizza.isAvailable ? 'enabled' : 'disabled'}!`, pizza });
};

// @desc   Update stock (admin)
// @route  PATCH /api/pizzas/:id/stock
const updateStock = async (req, res) => {
  const { stock } = req.body;
  if (stock === undefined || stock < 0) {
    return res.status(400).json({ success: false, message: 'Valid stock quantity required.' });
  }
  const pizza = await Pizza.findByIdAndUpdate(req.params.id, { stock, isAvailable: stock > 0 }, { new: true });
  if (!pizza) return res.status(404).json({ success: false, message: 'Pizza not found.' });
  res.json({ success: true, message: 'Stock updated!', pizza });
};

module.exports = { getPizzas, getPizza, createPizza, updatePizza, deletePizza, toggleAvailability, updateStock };
