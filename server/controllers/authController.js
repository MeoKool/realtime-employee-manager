const { db } = require("../services/firebase");
const {
  sendVerificationCode,
  checkVerificationCode,
} = require("../services/twilioVerifyService");

const { sendMail } = require("../services/emailService");
const EMAIL_CODES_COLLECTION =
  process.env.EMAIL_CODES_COLLECTION || "email_codes";

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

function generateSixDigitCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /auth/login-email
// Body: { email }
async function loginEmail(req, res, next) {
  try {
    console.log("Login email request body:", req.body);

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Missing email" });
    }

    const code = generateSixDigitCode();
    // Lưu vào Firestore: collection 'email_codes', document ID = email
    await db
      .collection(EMAIL_CODES_COLLECTION)
      .doc(email)
      .set({ code, createdAt: Date.now() });

    const html = `
      <p>Chào bạn,</p>
      <p>Mã xác thực đăng nhập của bạn là: <strong>${code}</strong></p>
      <p>Mã sẽ hết hạn sau 5 phút.</p>
    `;
    await sendMail(email, "Mã xác thực đăng nhập", html);

    return res
      .status(200)
      .json({ success: true, message: "Code sent via Email" });
  } catch (err) {
    next(err);
  }
}

// POST /auth/validate-email-code
// Body: { email, accessCode }
async function validateEmailCode(req, res, next) {
  try {
    const { email, accessCode } = req.body;
    if (!email || !accessCode) {
      return res.status(400).json({ error: "Missing params" });
    }

    const docRef = db.collection(EMAIL_CODES_COLLECTION).doc(email);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res
        .status(400)
        .json({ success: false, message: "No code found or code expired" });
    }

    const data = docSnap.data();

    const FIVE_MINUTES_IN_MS = 5 * 60 * 1000;
    if (Date.now() - data.createdAt > FIVE_MINUTES_IN_MS) {
      await docRef.delete();
      return res
        .status(401)
        .json({ success: false, message: "Access code expired" });
    }

    if (data.code !== accessCode) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid access code" });
    }

    // Nếu mã hợp lệ và chưa hết hạn, xóa mã
    await docRef.delete();

    return res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createNewAccessCode,
  validateAccessCode,
  loginEmail,
  validateEmailCode,
};
