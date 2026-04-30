const axios = require("axios");

const API_KEY = process.env.SANDBOX_API_KEY;
const API_SECRET = process.env.SANDBOX_API_SECRET;

const BASE_URL = "https://api.sandbox.co.in";

let accessToken = null;
let tokenExpiry = null;


const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});


async function generateToken() {
  try {
    const response = await api.post(
      "/authenticate",
      {},
      {
        headers: {
          "x-api-key": API_KEY,
          "x-api-secret": API_SECRET,
          "x-api-version": "1.0",
          "Content-Type": "application/json",
        },
      }
    );

    accessToken = response.data.data.access_token;

    
    tokenExpiry = Date.now() + 50 * 60 * 1000;

    console.log("KYC Token Generated");

    return accessToken;

  } catch (err) {
    console.error("TOKEN ERROR:", err.response?.data || err.message);
    throw new Error("Failed to generate KYC token");
  }
}


async function ensureToken() {
  if (!accessToken || Date.now() > tokenExpiry) {
    await generateToken();
  }
}


async function verifyPAN(pan, name, dob) {
  try {
    await ensureToken();

    const response = await api.post(
      "/kyc/pan/verify",
      {
        "@entity": "in.co.sandbox.kyc.pan_verification.request",
        pan,
        name_as_per_pan: name,
        date_of_birth: dob,
        consent: "Y",
        reason: "Loan Approval KYC",
      },
      {
        headers: {
          "x-api-key": API_KEY,
          Authorization: accessToken,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;

  } catch (err) {
    console.error("PAN ERROR:", err.response?.data || err.message);

    return {
      success: false,
      error: "PAN verification failed",
    };
  }
}


async function sendAadhaarOTP(aadhaar) {
  try {
    await ensureToken();

    const response = await api.post(
      "/kyc/aadhaar/okyc/otp",
      {
        "@entity": "in.co.sandbox.kyc.aadhaar.okyc.otp.request",
        aadhaar_number: aadhaar,
        consent: "Y",
        reason: "Loan Approval KYC",
      },
      {
        headers: {
          Authorization: accessToken,
          "x-api-key": API_KEY,
          "x-api-version": "1.0",
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;

  } catch (err) {
    console.error("AADHAAR OTP ERROR:", err.response?.data || err.message);

    return {
      success: false,
      error: "Failed to send OTP",
    };
  }
}


async function verifyAadhaarOTP(reference_id, otp) {
  try {
    await ensureToken();

    const response = await api.post(
      "/kyc/aadhaar/okyc/otp/verify",
      {
        "@entity": "in.co.sandbox.kyc.aadhaar.okyc.request",
        reference_id: String(reference_id),
        otp: String(otp),
      },
      {
        headers: {
          Authorization: accessToken,
          "x-api-key": API_KEY,
          "x-api-version": "1.0",
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;

  } catch (err) {
    console.error("OTP VERIFY ERROR:", err.response?.data || err.message);

    return {
      success: false,
      error: "OTP verification failed",
    };
  }
}

module.exports = {
  verifyPAN,
  sendAadhaarOTP,
  verifyAadhaarOTP,
};