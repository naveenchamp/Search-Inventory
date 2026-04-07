const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  category: {
    type: String
  },
  quantity: {
    type: Number,
    required: true,
    min: [0, 'Quantity cannot be negative']
  },
  price: {
    type: Number,
    required: true,
    min: [0.01, 'Price must be greater than 0'] // enforcing > 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
