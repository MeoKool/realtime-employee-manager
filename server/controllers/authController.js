const {
  sendVerificationCode,
  checkVerificationCode,
} = require("../services/twilioVerifyService");

// POST /auth/create-access-code
// Body: { phoneNumber }
async function createNewAccessCode(req, res, next) {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ error: "Missing phoneNumber" });
    }

    // Gọi Verify API để gửi SMS
    const verification = await sendVerificationCode(phoneNumber);
    // verification.status sẽ là "pending" nếu gửi thành công

    return res.status(200).json({
      success: true,
      message: `Verification sent to ${phoneNumber}`,
      sid: verification.sid,
    });
  } catch (err) {
    next(err);
  }
}

// POST /auth/validate-access-code
// Body: { phoneNumber, accessCode }
async function validateAccessCode(req, res, next) {
  try {
    const { phoneNumber, accessCode } = req.body;
    if (!phoneNumber || !accessCode) {
      return res
        .status(400)
        .json({ success: false, message: "Missing phoneNumber or accessCode" });
    }

    const verificationCheck = await checkVerificationCode(
      phoneNumber,
      accessCode
    );

    if (verificationCheck.status === "approved") {
      return res.status(200).json({ success: true, message: "Code valid." });
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired code." });
    }
  } catch (err) {
    console.error("Error checking verification code:", err);

    return res
      .status(500)
      .json({ success: false, message: "Server error checking code." });
  }
}

module.exports = {
  createNewAccessCode,
  validateAccessCode,
};
