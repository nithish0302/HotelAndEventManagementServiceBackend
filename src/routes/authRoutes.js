const express = require("express");

const router = express.Router();
const { createUser, login, logout } = require("../controllers/authController");

router.post("/createuser", createUser);
router.post("/login", login);
router.post("/logout", logout);

module.exports = router;
