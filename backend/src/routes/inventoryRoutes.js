'use strict';

const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// POST /inventory (Create item)
router.post('/', inventoryController.createInventory);

// GET /inventory (Get all items populated)
router.get('/', inventoryController.getAllInventory);

// GET /inventory/summary (Aggregation)
router.get('/summary', inventoryController.getInventorySummary);

// Note: /search is registered separately in app.js or we can move it here. Let's export it.
// The spec says GET /search is its own top-level route usually, 
// but we exported searchInventory from the inventory controller.

module.exports = router;
