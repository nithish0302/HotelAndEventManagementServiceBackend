const BaseUser = require("../../models/BaseUser");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const refreshToken = async (req, res) => {
  try {
    const cookies = req.cookies;

    if (!cookies?.jwt) {
      return res.status(401).json({ message: "Refresh token not found" });
    }

    const refreshToken = cookies.jwt;

    const user = await BaseUser.findOne({ refreshToken });
    if (!user) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err, decoded) => {
      if (err || user._id.toString() !== decoded.id) {
        return res.status(403).json({ message: "Invalid refresh token" });
      }

      const accessToken = jwt.sign(
        {
          id: user._id,
          email: user.email,
          role: user.role,
        },
        process.env.ACCESS_TOKEN,
        { expiresIn: "15m" }
      );

      return res.status(200).json({ accessToken });
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = refreshToken;
