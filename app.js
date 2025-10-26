const express = require("express");
const app = express();
const morgan = require("morgan");
const Admin = require("./src/models/adminSchema"); // Admin discriminator
const bcrypt = require("bcryptjs");
const user = require("./src/routes/authRoutes");
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

app.use("/api/v1/user", user);

app.get("/api", (req, res) => {
  res.status(200).json({ message: "hi" });
});

module.exports = app;
