const express = require('express');
const router = express.Router();
const { getCustomers, getCustomer, toggleUserStatus } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, getCustomers);
router.get('/:id', protect, adminOnly, getCustomer);
router.patch('/:id/toggle', protect, adminOnly, toggleUserStatus);

module.exports = router;
