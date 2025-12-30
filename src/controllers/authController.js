const BaseUser = require("../models/BaseUser");
const User = require("../models/User");
const Vendor = require("../models/Vendor");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Name, email, password and role are required",
      });
    }

    if (!["user", "vendor"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existingUser = await BaseUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 3️⃣ Create BASE USER ONLY
    const newUser = await BaseUser.create({
      name,
      email,
      password,
      role,
    });

    const accessToken = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
      },
      process.env.ACCESS_TOKEN,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: newUser._id },
      process.env.REFRESH_TOKEN,
      { expiresIn: "7d" }
    );

    newUser.refreshToken = refreshToken;
    await newUser.save();

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "User created successfully",
      accessToken,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        profileCompleted: newUser.profileCompleted,
        createdAt: newUser.createdAt,
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

    // 1️⃣ Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // 2️⃣ Find user (BaseUser model)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3️⃣ Compare password (FROM SCHEMA METHOD)
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(403).json({ message: "Invalid credentials" });
    }

    // 4️⃣ Check account status
    if (user.status !== "active") {
      return res.status(403).json({ message: "Account is not active" });
    }

    // 5️⃣ Generate tokens
    const accessToken = jwt.sign(
      {
        id: user._id,
        role: user.role, // discriminator value
      },
      process.env.ACCESS_TOKEN,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN, {
      expiresIn: "7d",
    });

    // 6️⃣ Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // 7️⃣ Set refresh token cookie
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 8️⃣ Send response
    return res.status(200).json({
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileCompleted: user.profileCompleted,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

const logout = async (req, res) => {
  try {
    const cookies = req.cookies;

    if (!cookies?.jwt) {
      return res.sendStatus(204); // No content
    }

    const refreshToken = cookies.jwt;
    const user = await BaseUser.findOne({ refreshToken });

    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Logout failed" });
  }
};

module.exports = { createUser, login, logout };
