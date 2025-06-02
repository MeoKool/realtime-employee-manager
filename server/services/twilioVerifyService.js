// server/services/twilioVerifyService.js
require("dotenv").config();
const Twilio = require("twilio");

const client = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const verifyServiceSid = process.env.TWILIO_VERIFY_SID;

async function sendVerificationCode(toPhone) {
  return await client.verify
    .services(verifyServiceSid)
    .verifications.create({ to: toPhone, channel: "sms" });
}

async function checkVerificationCode(toPhone, code) {
  const verificationCheck = await client.verify
    .services(verifyServiceSid)
    .verificationChecks.create({
      to: toPhone,
      code: code,
    });
  return verificationCheck;
}

module.exports = {
  sendVerificationCode,
  checkVerificationCode,
};
