'use strict';

const Inventory = require('../models/Inventory');
const Supplier = require('../models/Supplier');

/**
 * POST /inventory
 * Create inventory item. Validates supplier existence, qty, price.
 */
const createInventory = async (req, res) => {
  try {
    const { supplier, productName, category, quantity, price } = req.body;

    // Validate foreign key existence
    const supplierExists = await Supplier.findById(supplier);
    if (!supplierExists) {
      return res.status(404).json({ message: 'Supplier not found.' });
    }

    const inventory = new Inventory({ supplier, productName, category, quantity, price });
    
    // validation rules (min price, qty) will automatically throw during save via mongoose schema
    const savedInventory = await inventory.save();
    
    console.log(`[API] Created new inventory: ${savedInventory.productName}`);
    res.status(201).json(savedInventory);
  } catch (error) {
    console.error('Create Inventory Error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * GET /inventory
 * Fetch all inventory items, populate supplier details
 */
const getAllInventory = async (req, res) => {
  try {
    const results = await Inventory.find().populate('supplier', 'name city').lean();
    res.json(results);
  } catch (error) {
    console.error('Get All Inventory Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * GET /inventory/summary
 * Aggregation pipeline: group by supplier, compute total inventory value
 */
const getInventorySummary = async (req, res) => {
  try {
    const summary = await Inventory.aggregate([
      {
        $group: {
          _id: '$supplier', // group by the supplier field (which is an ObjectId)
          totalItems: { $sum: 1 },
          totalValue: {
            $sum: { $multiply: ['$quantity', '$price'] }
          }
        }
      },
      {
        // Join with Supplier collection to get full details instead of just the ObjectId
        $lookup: {
          from: 'suppliers',          // usually Mongoose lowercase pluralizes: 'Supplier' -> 'suppliers'
          localField: '_id',
          foreignField: '_id',
          as: 'supplierDetails'
        }
      },
      {
        // Unwind the array that $lookup generates
        $unwind: '$supplierDetails'
      },
      {
        // Format the output
        $project: {
          _id: 0,
          supplierId: '$_id',
          supplierName: '$supplierDetails.name',
          city: '$supplierDetails.city',
          totalItems: 1,
          totalValue: 1
        }
      },
      {
        // Sort by totalValue descending
        $sort: { totalValue: -1 }
      }
    ]);

    res.json(summary);
  } catch (error) {
    console.error('Get Inventory Summary Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * GET /search
 * Advanced filtering with MongoDB $regex, $lte, $gte
 */
const searchInventory = async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice } = req.query;

    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
      return res.status(400).json({ message: 'Invalid price range' });
    }

    const filter = {};

    if (q && q.trim() !== '') {
      filter.productName = { $regex: q.trim(), $options: 'i' };
    }

    if (category && category.trim() !== '') {
      filter.category = { $regex: `^${category.trim()}$`, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Populate supplier in search results as well!
    const results = await Inventory.find(filter).populate('supplier', 'name city').lean();
    res.json(results);
    
  } catch (error) {
    console.error('Search API Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  createInventory,
  getAllInventory,
  getInventorySummary,
  searchInventory
};
