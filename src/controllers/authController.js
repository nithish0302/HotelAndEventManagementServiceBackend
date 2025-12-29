const BaseUser = require("../models/BaseUser");
const User = require("../models/User");
const Vendor = require("../models/Vendor");
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

    // ✅ Check if user already exists (BASE MODEL)
    const existingUser = await BaseUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    let newUser;

    if (role === "vendor") {
      newUser = await Vendor.create({
        name,
        email,
        password, // 👈 plain text (schema hashes it)
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
      newUser = await User.create({
        name,
        email,
        password, // 👈 plain text
        profileImage,
        address,
      });
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        profileImage: newUser.profileImage,
        address: newUser.address,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      },
    });
  } catch (error) {
    console.error("Create user error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // 🔥 ALWAYS USE BASE USER FOR LOGIN
    const user = await BaseUser.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(403).json({ message: "Invalid credentials" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ message: "Account is not active" });
    }

    const accessToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.ACCESS_TOKEN,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN, {
      expiresIn: "7d",
    });

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = { createUser, login };
