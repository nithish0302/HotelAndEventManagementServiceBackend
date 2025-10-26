const User = require("../../models/userSchema");

const refreshToken = async (req, res) => {
  try {
    const cookies = req.cookie;
    if (!cookies?.jwt) {
      return res.stauts(401).json({ message: "Token Not found" });
    }

    const refreshToken = cookies.jwt;
    const user = await User.findOne({ refreshToken });

    if (!user) {
      return res.stauts(403).json({ message: "Invalid Refresh Token" });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err, decode) => {
      if (err || user.email != decode.email) {
        return res.status(403).json({ message: "Invalid refresh token" });
      }

      const accessToken = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.ACCESS_TOKEN,
        { expiresIn: "15m" }
      );

      return res.status(200).json({ accessToken });
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
