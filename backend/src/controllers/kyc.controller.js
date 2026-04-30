const db = require("../config/db");

const {
  verifyPAN,
  sendAadhaarOTP,
  verifyAadhaarOTP,
} = require("../services/kycService");


const { sendToOrchestrator } = require("../services/orchestrator.service");

exports.verifyPANController = async (req, res) => {
  try {
    const { application_id, pan, name, dob } = req.body;

    if (!application_id || !pan || !name || !dob) {
      return res.status(400).json({
        message: "All PAN details required",
      });
    }

    const response = await verifyPAN(pan, name, dob);

    if (response.data?.status !== "valid") {
      await db.query(
        `UPDATE applications 
         SET status='REJECTED',
             kyc_status='FAILED',
             reason='PAN verification failed'
         WHERE application_id=$1`,
        [application_id]
      );

      return res.json({
        message: "PAN verification failed",
        application_status: "REJECTED",
      });
    }

    await db.query(
      `UPDATE applications 
       SET kyc_status='PAN_VERIFIED'
       WHERE application_id=$1`,
      [application_id]
    );

    res.json({
      message: "PAN verified successfully",
    });

  } catch (err) {
    console.error("PAN ERROR:", err);
    res.status(500).json({
      message: "PAN service error, try again",
    });
  }
};


exports.sendAadhaarOTPController = async (req, res) => {
  try {
    const { aadhaar } = req.body;

    if (!aadhaar) {
      return res.status(400).json({
        message: "Aadhaar required",
      });
    }

    const response = await sendAadhaarOTP(aadhaar);

    res.json(response);

  } catch (err) {
    console.error("AADHAAR OTP ERROR:", err);
    res.status(500).json({
      message: "Failed to send OTP",
    });
  }
};


exports.verifyAadhaarOTPController = async (req, res) => {
  try {
    const { application_id, reference_id, otp } = req.body;

    if (!application_id || !reference_id || !otp) {
      return res.status(400).json({
        message: "Missing Aadhaar verification data",
      });
    }

    const kycCheck = await db.query(
      `SELECT kyc_status FROM applications WHERE application_id=$1`,
      [application_id]
    );

    if (kycCheck.rows[0].kyc_status !== "PAN_VERIFIED") {
      return res.status(400).json({
        message: "Complete PAN verification first",
      });
    }

    const result = await verifyAadhaarOTP(
      String(reference_id),
      String(otp)
    );

    if (result.data?.status !== "VALID") {
      await db.query(
        `UPDATE applications 
         SET status='REJECTED',
             kyc_status='FAILED',
             reason='KYC verification failed'
         WHERE application_id=$1`,
        [application_id]
      );

      return res.json({
        message: "KYC failed",
        application_status: "REJECTED",
      });
    }

  
    await db.query(
      `UPDATE applications 
       SET kyc_status='VERIFIED',
           status='PROCESSING'
       WHERE application_id=$1`,
      [application_id]
    );

    
    const orchestratorResult = await sendToOrchestrator(application_id);

    return res.json({
      message: "KYC successful",
      orchestrator_result: orchestratorResult
    });

  } catch (error) {
    console.error("AADHAAR VERIFY ERROR:", error);

    await db.query(
      `UPDATE applications 
       SET kyc_status='PENDING'
       WHERE application_id=$1`,
      [req.body.application_id]
    );

    res.status(500).json({
      message: "KYC service error, try again",
    });
  }
};