require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("../src/models/adminSchema");
const bcrypt = require("bcryptjs");
const connectDB = require("../src/config/db");

async function createAdmin() {
  try {
    // First, connect to MongoDB
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: "admin@gmail.com" });

    if (existingAdmin) {
      console.log("⚠️  Admin already exists");
      await mongoose.connection.close();
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("1234", 10);

    // Create admin
    const admin = new Admin({
      name: "Admin",
      email: "admin@gmail.com",
      password: hashedPassword,
      permissions: ["all"],
    });

    await admin.save();
    console.log("✅ Admin created successfully");
    console.log("📧 Email: admin@gmail.com");
    console.log("🔑 Password: 1234");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Call the function
createAdmin();
