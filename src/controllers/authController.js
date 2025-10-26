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

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(404).json({ message: "Email and Password are needed" });
    }
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(409).json({ message: "User not found" });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(403).json({ message: "Invalid credentials" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ message: "Account is not active" });
    }

    const accessToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.ACCESS_TOKEN,
      {
        expiresIn: "15m",
      }
    );

    const refreshToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.REFRESH_TOKEN,
      {
        expiresIn: "7d",
      }
    );
    user.refreshToken = refreshToken;
    await user.save();
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: isProduction ? true : false,
      sameSite: isProduction ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login Successfull",
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
    console.error(`Server error occured ${error}`);
    return res.status(500).json({ message: `Server Error`, error: error });
  }
};

module.exports = { createUser, login };
