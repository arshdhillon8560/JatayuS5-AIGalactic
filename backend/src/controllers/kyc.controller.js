const db = require("../config/db");

const {
  verifyPAN,
  sendAadhaarOTP,
  verifyAadhaarOTP,
} = require("../services/kycService");

const {
  sendToOrchestrator,
} = require("../services/orchestrator.service");


// ======================================
// PAN VERIFY
// ======================================

exports.verifyPANController =
  async (req, res) => {

    try {

      const {
        application_id,
        pan,
        name,
        dob
      } = req.body;


      // -------------------------------
      // VALIDATION
      // -------------------------------

      if (
        !application_id ||
        !pan ||
        !name ||
        !dob
      ) {

        return res.status(400).json({
          message:
            "All PAN details required",
        });
      }


      // -------------------------------
      // VERIFY PAN
      // -------------------------------

      const response =
        await verifyPAN(
          pan,
          name,
          dob
        );


      console.log(
        "PAN RESPONSE:",
        JSON.stringify(
          response,
          null,
          2
        )
      );


      // -------------------------------
      // STATUS CHECK
      // -------------------------------

      const panStatus =
        response?.data?.status ||
        response?.status;


      console.log(
        "PAN STATUS:",
        panStatus
      );


      if (
        panStatus
          ?.toUpperCase() !==
        "VALID"
      ) {

        await db.query(
          `
          UPDATE applications
          SET
            status='REJECTED',
            kyc_status='FAILED',
            reason='PAN verification failed'
          WHERE application_id=$1
          `,
          [application_id]
        );

        return res.json({

          message:
            "PAN verification failed",

          application_status:
            "REJECTED",
        });
      }


      // -------------------------------
      // UPDATE STATUS
      // -------------------------------

      await db.query(
        `
        UPDATE applications
        SET kyc_status='PAN_VERIFIED'
        WHERE application_id=$1
        `,
        [application_id]
      );


      return res.json({

        message:
          "PAN verified successfully",

        pan_verified: true,
      });

    } catch (err) {

      console.error(
        "PAN ERROR:",
        err
      );

      res.status(500).json({

        message:
          "PAN service error, try again",
      });
    }
  };


// ======================================
// SEND AADHAAR OTP
// ======================================

exports.sendAadhaarOTPController =
  async (req, res) => {

    try {

      const { aadhaar } =
        req.body;

      if (!aadhaar) {

        return res.status(400).json({
          message:
            "Aadhaar required",
        });
      }


      const response =
        await sendAadhaarOTP(
          aadhaar
        );


      console.log(
        "AADHAAR OTP RESPONSE:",
        JSON.stringify(
          response,
          null,
          2
        )
      );


      return res.json(response);

    } catch (err) {

      console.error(
        "AADHAAR OTP ERROR:",
        err
      );

      res.status(500).json({

        message:
          "Failed to send OTP",
      });
    }
  };


// ======================================
// VERIFY AADHAAR OTP
// ======================================

exports.verifyAadhaarOTPController =
  async (req, res) => {

    try {

      const {
        application_id,
        reference_id,
        otp
      } = req.body;


      // -------------------------------
      // VALIDATION
      // -------------------------------

      if (
        !application_id ||
        !reference_id ||
        !otp
      ) {

        return res.status(400).json({

          message:
            "Missing Aadhaar verification data",
        });
      }


      // -------------------------------
      // CHECK PAN VERIFIED
      // -------------------------------

      const kycCheck =
        await db.query(
          `
          SELECT kyc_status
          FROM applications
          WHERE application_id=$1
          `,
          [application_id]
        );


      console.log(
        "CURRENT KYC STATUS:",
        kycCheck.rows[0]
          ?.kyc_status
      );


      if (
        kycCheck.rows[0]
          ?.kyc_status !==
        "PAN_VERIFIED"
      ) {

        return res.status(400).json({

          message:
            "Complete PAN verification first",
        });
      }


      // -------------------------------
      // VERIFY OTP
      // -------------------------------

      const result =
        await verifyAadhaarOTP(
          String(reference_id),
          String(otp)
        );


      console.log(
        "AADHAAR VERIFY RESPONSE:",
        JSON.stringify(
          result,
          null,
          2
        )
      );


      // -------------------------------
      // STATUS CHECK
      // -------------------------------

      const aadhaarStatus =
        result?.data?.status ||
        result?.status;


      console.log(
        "AADHAAR STATUS:",
        aadhaarStatus
      );


      if (
        aadhaarStatus
          ?.toUpperCase() !==
        "VALID"
      ) {

        await db.query(
          `
          UPDATE applications
          SET
            status='REJECTED',
            kyc_status='FAILED',
            reason='KYC verification failed'
          WHERE application_id=$1
          `,
          [application_id]
        );

        return res.json({

          message:
            "KYC failed",

          application_status:
            "REJECTED",
        });
      }


      // -------------------------------
      // UPDATE STATUS
      // -------------------------------

      await db.query(
        `
        UPDATE applications
        SET
          kyc_status='VERIFIED',
          status='PROCESSING'
        WHERE application_id=$1
        `,
        [application_id]
      );


      // -------------------------------
      // SEND TO ORCHESTRATOR
      // -------------------------------

      const orchestratorResult =
        await sendToOrchestrator(
          application_id
        );


      return res.json({

        message:
          "KYC successful",

        aadhaar_verified: true,

        orchestrator_result:
          orchestratorResult
      });

    } catch (error) {

      console.error(
        "AADHAAR VERIFY ERROR:",
        error
      );


      await db.query(
        `
        UPDATE applications
        SET kyc_status='PENDING'
        WHERE application_id=$1
        `,
        [req.body.application_id]
      );


      res.status(500).json({

        message:
          "KYC service error, try again",
      });
    }
  };