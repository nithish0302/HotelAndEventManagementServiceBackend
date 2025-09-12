const express = require("express");
const app = express();
const morgan = require("morgan");
const Admin = require("./src/models/adminSchema"); // Admin discriminator
const bcrypt = require("bcryptjs");
const user = require("./src/routes/authRoutes");
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/v1/user", user);

app.get("/api", (req, res) => {
  res.status(200).json({ message: "hi" });
});

async function createAdmin() {
  try {
    // Check if admin already exists by email
    const existingAdmin = await Admin.findOne({ email: "admin@gmail.com" });
    if (existingAdmin) {
      console.log("Admin already exists");
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("1234", 10);

    // Create admin
    const admin = new Admin({
      name: "Admin",
      email: "admin@gmail.com",
      password: hashedPassword,
      permissions: ["all"], // full access
    });

    await admin.save();
    console.log("Admin created successfully");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

createAdmin();

module.exports = app;
