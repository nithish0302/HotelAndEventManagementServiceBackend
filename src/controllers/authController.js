const User = require("../models/userSchema");
const Vendor = require("../models/vendorSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      profileImage,
      address,
      businessName,
      businessType,
      businessAddress,
      gstNumber,
      servicesOffered,
      documents,
      paymentDetails,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser;

    if (role === "vendor") {
      // Create vendor using Vendor discriminator
      newUser = await Vendor.create({
        name,
        email,
        password: hashedPassword,
        profileImage,
        address,
        businessName,
        businessType,
        businessAddress,
        gstNumber,
        servicesOffered,
        documents,
        paymentDetails,
      });
    } else if (role === "user") {
      // Create normal user
      newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        profileImage,
        address,
      });
    } else if (role === "admin") {
      return res
        .status(403)
        .json({ message: "Admin cannot be created via API" });
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    return res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Error creating user:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

module.exports = { createUser };
