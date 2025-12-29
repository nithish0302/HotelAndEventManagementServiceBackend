const mongoose = require("mongoose");
const BaseUser = require("./BaseUser");

const adminSchema = new mongoose.Schema({
  permissions: {
    type: [String],
    default: [],
  },
});

module.exports = BaseUser.discriminator("admin", adminSchema);
