const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true,
  })
);
app.use("/api/v1", authRoutes);

app.get("/api", (req, res) => {
  res.status(200).json({ message: "hi" });
});

module.exports = app;
