const express = require('express');
const router = express.Router();
const { getPizzas, getPizza, createPizza, updatePizza, deletePizza, toggleAvailability, updateStock } = require('../controllers/pizzaController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getPizzas);
router.get('/:id', getPizza);
router.post('/', protect, adminOnly, createPizza);
router.put('/:id', protect, adminOnly, updatePizza);
router.delete('/:id', protect, adminOnly, deletePizza);
router.patch('/:id/availability', protect, adminOnly, toggleAvailability);
router.patch('/:id/stock', protect, adminOnly, updateStock);

module.exports = router;
