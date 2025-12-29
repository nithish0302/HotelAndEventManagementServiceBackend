const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // ✅ Check header exists and starts with Bearer
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authorization header missing or invalid" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      // ✅ Correct way to detect expired token
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      }
      return res.status(403).json({ message: "Invalid token" });
    }

    // ✅ Attach decoded data to request
    req.userId = decoded.id;
    req.email = decoded.email;
    req.role = decoded.role;

    next();
  });
};

module.exports = verifyJwt;
