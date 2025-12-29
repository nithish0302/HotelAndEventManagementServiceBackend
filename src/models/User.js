const mongoose = require("mongoose");
const BaseUser = require("./BaseUser");

const userSchema = new mongoose.Schema({
  profileImage: { type: String },

  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    pincode: {
      type: String,
      match: [/^\d{6}$/, "Invalid pincode"],
    },
  },
});

module.exports = BaseUser.discriminator("user", userSchema);
