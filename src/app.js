const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

app.use("/api/v1/user", authRoutes);

app.get("/api", (req, res) => {
  res.status(200).json({ message: "hi" });
});

module.exports = app;
