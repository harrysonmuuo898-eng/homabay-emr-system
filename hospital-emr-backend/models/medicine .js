const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  drugID: { type: String, unique: true },
  name: String,
  description: String,
  price: Number,
  stock: Number
});

module.exports = mongoose.model('Medicine', medicineSchema);
