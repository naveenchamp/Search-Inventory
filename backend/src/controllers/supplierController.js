'use strict';

const Supplier = require('../models/Supplier');

/**
 * POST /supplier
 * Body: { name: String, city: String }
 */
const createSupplier = async (req, res) => {
  try {
    const { name, city } = req.body;

    if (!name || !city) {
      return res.status(400).json({ message: 'Missing required fields: name, city' });
    }

    const supplier = new Supplier({ name, city });
    const savedSupplier = await supplier.save();

    console.log(`[API] Created new supplier: ${savedSupplier.name}`);
    res.status(201).json(savedSupplier);

  } catch (error) {
    console.error('Create Supplier Error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

module.exports = { createSupplier };
