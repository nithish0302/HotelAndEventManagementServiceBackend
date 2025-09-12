const mongoose = require("mongoose");
const User = require("./userSchema");

const adminSchema = new mongoose.Schema({
  permissions: [String],
});

const Admin = User.discriminator("admin", adminSchema);

module.exports = Admin;
