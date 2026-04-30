const express = require("express");
const router = express.Router();

const kycController = require("../controllers/kyc.controller");
const authMiddleware = require("../middleware/auth.middleware");



// PAN verification
router.post("/verify-pan", authMiddleware, kycController.verifyPANController);

// Send Aadhaar OTP
router.post("/aadhaar/send-otp", authMiddleware, kycController.sendAadhaarOTPController);

// Verify Aadhaar OTP
router.post("/aadhaar/verify-otp", authMiddleware, kycController.verifyAadhaarOTPController);

module.exports = router;