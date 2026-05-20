const db = require("../config/db");

const {
  verifyPAN,
  sendAadhaarOTP,
  verifyAadhaarOTP,
} = require("../services/kycService");

const {
  validateKYC
} = require("../services/kycMatchService");

const {
  sendToOrchestrator
} = require("../services/orchestrator.service");



// PAN VERIFY


exports.verifyPANController = async (req, res) => {

  try {

    const {
      application_id,
      pan,
      name,
      dob
    } = req.body;

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

    const response =
      await verifyPAN(
        pan,
        name,
        dob
      );


  
    // PAN FAILED
  

    if (
      response.data?.status !== "valid"
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


   
    // PAN VERIFIED
   

    await db.query(
      `
      UPDATE applications
      SET kyc_status='PAN_VERIFIED'
      WHERE application_id=$1
      `,
      [application_id]
    );

    res.json({
      message:
        "PAN verified successfully",
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



// SEND AADHAAR OTP


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

      res.json(response);

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



// VERIFY AADHAAR OTP


exports.verifyAadhaarOTPController =
  async (req, res) => {

    try {

      const {
        application_id,
        reference_id,
        otp
      } = req.body;


      
      // VALIDATION
    

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


    
      // CHECK PAN VERIFIED
      

      const kycCheck =
        await db.query(
          `
          SELECT kyc_status
          FROM applications
          WHERE application_id=$1
          `,
          [application_id]
        );

      if (
        kycCheck.rows[0]
          .kyc_status !==
        "PAN_VERIFIED"
      ) {

        return res.status(400).json({
          message:
            "Complete PAN verification first",
        });
      }


     
      // VERIFY OTP
   

      const result =
        await verifyAadhaarOTP(
          String(reference_id),
          String(otp)
        );


      console.log(
        "AADHAAR:",
        result.data
      );


   
      // INVALID AADHAAR
     

      if (
        result.data?.status !==
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


    
      // FETCH PROFILE
      

      const profileResult = await db.query(
  `
  SELECT 
    name,
    TO_CHAR(date_of_birth, 'YYYY-MM-DD') AS date_of_birth
  FROM applicant_profiles
  WHERE application_id = $1
  `,
  [application_id]
);

      const profile =
        profileResult.rows[0];

      console.log(
        "PROFILE:",
        profile
      );


 
      // VALIDATE KYC
      

      const matchResult =
        validateKYC(
          profile,
          result.data
        );


    
      // KYC MISMATCH
    

      if (!matchResult.valid) {

        await db.query(
          `
          UPDATE applications
          SET
            status='REJECTED',
            kyc_status='FAILED',
            reason=$1
          WHERE application_id=$2
          `,
          [
            `KYC mismatch: ${matchResult.failures.join(", ")}`,
            application_id
          ]
        );

        return res.status(400).json({

          message:
            "KYC profile mismatch",

          mismatches:
            matchResult.failures,

          application_status:
            "REJECTED"
        });
      }


    
      // KYC SUCCESS
     

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


      // SEND TO ORCHESTRATOR
    

      const orchestratorResult =
        await sendToOrchestrator(
          application_id
        );


      return res.json({

        message:
          "KYC successful",

        aadhaar_verified: true,

        profile_match: true,

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