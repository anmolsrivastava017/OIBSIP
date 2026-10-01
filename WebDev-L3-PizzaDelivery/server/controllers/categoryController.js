const Category = require('../models/Category');

const getCategories = async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
  res.json({ success: true, categories });
};

const getAllCategories = async (req, res) => {
  const categories = await Category.find().sort({ sortOrder: 1, name: 1 });
  res.json({ success: true, categories });
};

const createCategory = async (req, res) => {
  const { name, description, image, sortOrder } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Category name required.' });
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const category = await Category.create({ name, slug, description, image, sortOrder });
  res.status(201).json({ success: true, message: 'Category created!', category });
};

const updateCategory = async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
  res.json({ success: true, message: 'Category updated!', category });
};

const deleteCategory = async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
  res.json({ success: true, message: 'Category deleted!' });
};

module.exports = { getCategories, getAllCategories, createCategory, updateCategory, deleteCategory };
