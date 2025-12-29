const mongoose = require("mongoose");
const BaseUser = require("./BaseUser");

const vendorSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: true,
  },
  businessType: {
    type: String,
    enum: ["hotel", "event"],
    required: true,
  },

  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    pincode: {
      type: String,
      required: true,
      match: [/^\d{5,6}$/, "Invalid pincode"],
    },
  },

  gstNumber: {
    type: String,
    required: true,
  },

  servicesOffered: {
    type: [String],
    required: true,
  },

  documents: {
    type: [String],
    required: true,
  },

  statusOfVendor: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },

  ratings: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },

  commissionRate: {
    type: Number,
    default: 10,
    min: 0,
    max: 100,
  },
});

module.exports = BaseUser.discriminator("vendor", vendorSchema);
