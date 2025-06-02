// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const {
  createNewAccessCode,
  validateAccessCode,
  loginEmail,
  validateEmailCode,
} = require("../controllers/authController");

// Owner: đăng nhập bằng điện thoại
router.post("/create-access-code", createNewAccessCode);
router.post("/validate-access-code", validateAccessCode);

// Employee: đăng nhập bằng email
router.post("/login-email", loginEmail);
router.post("/validate-email-code", validateEmailCode);

module.exports = router;
