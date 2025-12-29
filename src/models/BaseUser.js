const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const baseUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: 2,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Invalid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
    },
    refreshToken: String,
  },
  {
    discriminatorKey: "role", // 👈 KEEP THIS
    timestamps: true,
  }
);

// 🔐 Hash password
baseUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🔑 Compare password
baseUserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", baseUserSchema);
