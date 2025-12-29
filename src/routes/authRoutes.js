const express = require("express");

const router = express.Router();
const { createUser, login } = require("../controllers/authController");

router.post("/createuser", createUser);
router.post("/login", login);

module.exports = router;
