const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
  patientID: { type: String, required: true, index: true },
  services: [{
    department: String,
    description: String,
    cost: Number,
    details: mongoose.Schema.Types.Mixed,
    recordedBy: {
      staffID: String,
      name: String,
      role: String,
      department: String
    },
    createdAt: { type: Date, default: Date.now }
  }],
  totalAmount: { type: Number, default: 0 },
  paymentMethod: { type: String, enum: ["SHA", "M-Pesa"], default: "SHA" },
  status: { type: String, enum: ["Pending", "Paid"], default: "Pending" }
}, { timestamps: true });

module.exports = mongoose.model('Billing', billingSchema);
