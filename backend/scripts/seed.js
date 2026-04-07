'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const Supplier = require('../src/models/Supplier');
const Inventory = require('../src/models/Inventory');

const runSeed = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI is not defined in .env.');

    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB for seeding...');

    // Clear existing collections safely
    await Supplier.deleteMany({});
    await Inventory.deleteMany({});
    console.log('🗑️ Cleared existing data.');

    // Prepare supplier templates
    const rawSuppliers = [
      { name: 'ABC Traders', city: 'Phoenix' },
      { name: 'Tech Supplies Inc.', city: 'San Jose' },
      { name: 'Office Depot', city: 'Houston' }
    ];

    const insertedSuppliers = await Supplier.insertMany(rawSuppliers);
    console.log(`✅ Seeded ${insertedSuppliers.length} suppliers.`);

    // Helper map for finding _id easily
    const supplierMap = {
      'ABC Traders': insertedSuppliers[0]._id,
      'Tech Supplies Inc.': insertedSuppliers[1]._id,
      'Office Depot': insertedSuppliers[2]._id
    };

    // Use a subset of the previous array, but replace string supplier with ObjectID and add quantity/price logic
    const inventoryItems = [
      { productName: 'Ergonomic Office Chair', category: 'Furniture', price: 150, quantity: 20, supplier: supplierMap['ABC Traders'] },
      { productName: 'Standing Desk', category: 'Furniture', price: 300, quantity: 15, supplier: supplierMap['ABC Traders'] },
      { productName: 'Wireless Mouse', category: 'Electronics', price: 25, quantity: 150, supplier: supplierMap['Tech Supplies Inc.'] },
      { productName: 'Mechanical Keyboard', category: 'Electronics', price: 85, quantity: 40, supplier: supplierMap['Tech Supplies Inc.'] },
      { productName: 'Whiteboard Monitors', category: 'Office Accessories', price: 120, quantity: 10, supplier: supplierMap['Office Depot'] },
      { productName: 'A4 Printing Paper', category: 'Stationery', price: 5.5, quantity: 1000, supplier: supplierMap['Office Depot'] }
    ];

    const insertedInventory = await Inventory.insertMany(inventoryItems);
    console.log(`✅ Seeded ${insertedInventory.length} inventory items.`);

    console.log('🎉 Seeding successfully completed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

runSeed();
