// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const {
  createNewAccessCode,
  validateAccessCode,
} = require("../controllers/authController");

// Owner: đăng nhập bằng điện thoại
router.post("/create-access-code", createNewAccessCode);
router.post("/validate-access-code", validateAccessCode);

module.exports = router;
