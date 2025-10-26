const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyJwt = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Authorization header missing or invalid" });
  }
  console.log(authHeader);
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decode) => {
    if (err) {
      if (err === "TokenExpiredError") {
        return res.status(401).json({ message: "Token Expired" });
      } else {
        return res.status(403).json({ message: "Invalid Token" });
      }
    }
    req.email = decode.email;
    req.userId = decode.id;
    req.role = decode.role;

    next();
  });
};

module.exports = verifyJwt;
