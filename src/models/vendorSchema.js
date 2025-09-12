const mongoose = require("mongoose");
const User = require("./userSchema");

const vendorSchema = new mongoose.Schema({
  businessName: { type: String, required: [true, "Business name is required"] },
  businessType: { type: String, enum: ["hotel", "event"], required: true },

  // Override address from User schema
  address: {
    street: { type: String, required: [true, "Street is required"] },
    city: { type: String, required: [true, "City is required"] },
    state: { type: String, required: [true, "State is required"] },
    country: { type: String, required: [true, "Country is required"] },
    pincode: {
      type: String,
      required: [true, "Pincode is required"],
      match: [/^\d{5,6}$/, "Invalid pincode format"],
    },
  },

  businessAddress: {
    type: String,
    required: [true, "Business address is required"],
  },
  gstNumber: { type: String, required: [true, "GST number is required"] },

  servicesOffered: {
    type: [String],
    required: [true, "Services offered are required"],
    validate: (v) => Array.isArray(v) && v.length > 0,
  },
  documents: {
    type: [String],
    required: [true, "Documents are required"],
    validate: (v) => Array.isArray(v) && v.length > 0,
  },
  statusOfVendor: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  listings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Listing" }],
  ratings: { type: Number, default: 0, min: 0, max: 5 },
  commissionRate: { type: Number, default: 10, min: 0, max: 100 },
  paymentDetails: {
    upiId: { type: String, required: [true, "UPI ID is required"] },
    bankAccount: {
      type: String,
      required: [true, "Bank account number is required"],
    },
    ifscCode: { type: String, required: [true, "IFSC code is required"] },
    accountHolderName: {
      type: String,
      required: [true, "Account holder name is required"],
    },
  },
});

const Vendor = User.discriminator("vendor", vendorSchema);

module.exports = Vendor;
