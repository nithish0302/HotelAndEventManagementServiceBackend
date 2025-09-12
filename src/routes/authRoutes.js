const express = require("express");

const router = express.Router();
const { createUser, login } = require("../controllers/authController");
const { route } = require("../../app");

router.post("/createuser", createUser);
// route.post("/login", login);

module.exports = router;
