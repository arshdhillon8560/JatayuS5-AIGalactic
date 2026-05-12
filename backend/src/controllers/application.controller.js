const db = require("../config/db");
const generateId = require("../utils/generateId");
const axios = require("axios");
const s3 = require("../config/s3");

const uploadToS3 = async (file) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `documents/${Date.now()}_${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype
  };

  const result = await s3.upload(params).promise();

  return {
    url: result.Location,
    key: params.Key
  };
};


exports.createApplication = async (req, res) => {
  try {
    const { loan_amount, loan_tenure, loan_purpose } = req.body;

    if (!loan_amount || !loan_tenure || !loan_purpose) {
      return res.status(400).json({
        message: "All loan fields required",
      });
    }

    const application_id = generateId();

    await db.query(
      `INSERT INTO applications
      (application_id,user_id,loan_amount,loan_tenure,loan_purpose,status)
      VALUES($1,$2,$3,$4,$5,'CREATED')`,
      [application_id, req.user.id, loan_amount, loan_tenure, loan_purpose]
    );

    res.json({
      message: "Application created",
      application_id,
    });
  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};


exports.saveProfile = async (req, res) => {
  try {
    const d = req.body;

    await db.query(
      `INSERT INTO applicant_profiles
      (application_id,name,age,date_of_birth,gender,marital_status,
       pan_number,aadhaar_number,address,city,state,pincode)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        d.application_id,
        d.name,
        d.age,
        d.date_of_birth,
        d.gender,
        d.marital_status,
        d.pan_number,
        d.aadhaar_number,
        d.address,
        d.city,
        d.state,
        d.pincode,
      ]
    );

    res.json({ message: "Profile saved" });
  } catch (err) {
    console.error("PROFILE ERROR:", err);
    res.status(500).json(err);
  }
};


exports.saveEmployment = async (req, res) => {
  try {
    const d = req.body;

    await db.query(
      `INSERT INTO employment_details
      (application_id,employment_type,employer_name,industry,
       job_title,years_in_current_job,total_work_experience,
       monthly_income,salary_mode)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        d.application_id,
        d.employment_type,
        d.employer_name,
        d.industry,
        d.job_title,
        d.years_in_current_job,
        d.total_work_experience,
        d.monthly_income,
        d.salary_mode,
      ]
    );

    res.json({ message: "Employment saved" });
  } catch (err) {
    console.error("EMPLOYMENT ERROR:", err);
    res.status(500).json(err);
  }
};


exports.saveFinancial = async (req, res) => {
  try {
    const d = req.body;

    await db.query(
      `INSERT INTO financial_details
      (application_id,existing_loans,existing_emi,
       credit_card_limit,credit_card_balance,
       bank_name,bank_account_type,bank_account_number,
       average_monthly_balance)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        d.application_id,
        d.existing_loans,
        d.existing_emi,
        d.credit_card_limit,
        d.credit_card_balance,
        d.bank_name,
        d.bank_account_type,
        d.bank_account_number,
        d.average_monthly_balance,
      ]
    );

    res.json({ message: "Financial saved" });
  } catch (err) {
    console.error("FINANCIAL ERROR:", err);
    res.status(500).json(err);
  }
};


exports.uploadDocuments = async (req, res) => {
  try {
    const { application_id, collateral_type } = req.body;
    const files = req.files;

  
    const bank = await uploadToS3(files.bank_statement[0]);
    const salary = await uploadToS3(files.salary_slip[0]);
    const itr = await uploadToS3(files.itr_document[0]);

    let collateral = null;
    if (files.collateral_document) {
      collateral = await uploadToS3(files.collateral_document[0]);
    }

    await db.query(
      `INSERT INTO documents(
        application_id,
        bank_statement_url,
        salary_slip_url,
        itr_document_url,
        collateral_url,
        collateral_type
      )
      VALUES($1,$2,$3,$4,$5,$6)`,
      [
        application_id,
        bank.key,   
        salary.key,
        itr.key,
        collateral?.key || null,
        collateral_type || (collateral ? "property" : null)
      ]
    );

    res.json({
      message: "Uploaded to S3",
      keys: {
        bank: bank.key,
        salary: salary.key,
        itr: itr.key,
        collateral: collateral?.key || null

      }
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};


exports.trackApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `
      SELECT 
        a.application_id,
        a.status,
        a.kyc_status,
        a.reason,
        a.risk_band,

        ar.credit_pd_score,
        ar.fraud_probability,
        ar.collateral_value,
        ar.collateral_risk,
        ar.final_decision

      FROM applications a

      LEFT JOIN LATERAL (
        SELECT *
        FROM agent_results
        WHERE application_id = a.application_id
        ORDER BY created_at DESC
        LIMIT 1
      ) ar ON true

      WHERE a.application_id = $1
      `,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Not found" });
    }

    const app = result.rows[0];

    res.json({
      ...app,
      agent_scores: {
        pd: app.credit_pd_score,
        fraud: app.fraud_probability,
        collateral_value: app.collateral_value,
        collateral_risk: app.collateral_risk,
      },
    });
  } catch (err) {
    console.error("TRACK ERROR:", err);
    res.status(500).json(err);
  }
};


exports.getUserApplications = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT application_id,status,created_at
       FROM applications
       WHERE user_id=$1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err);
  }
};

// ── GROK AI RISK ANALYSIS ─────────────────────────────────────────────────
exports.analyzeRisk = async (req, res) => {
  try {
    const d = req.body;
 
    // Build a structured prompt for Grok
    const prompt = `
You are a senior loan risk analyst. Analyze the following loan application data and return a risk assessment.
 
Loan Details:
- Amount: ₹${d.loan_amount} | Tenure: ${d.loan_tenure} months | Purpose: ${d.loan_purpose}
 
Applicant Profile:
- Age: ${d.age} | Employment: ${d.employment_type} | Employer: ${d.employer_name}
- Industry: ${d.industry} | Job Title: ${d.job_title}
- Years in Current Job: ${d.years_in_current_job} | Total Experience: ${d.total_work_experience} years
- KYC Status: ${d.kyc_status} | Employment Verified: ${d.employment_verified}
 
Financial Profile:
- Monthly Income: ₹${d.monthly_income}
- Existing Loans: ${d.existing_loans} | Existing EMI: ₹${d.existing_emi}
- Credit Card Limit: ₹${d.credit_card_limit} | Credit Card Balance: ₹${d.credit_card_balance}
- Avg Monthly Bank Balance: ₹${d.average_monthly_balance}
 
Risk Scores:
- Credit PD Score: ${d.credit_pd_score} (probability of default, 0–1)
- Fraud Probability: ${d.fraud_probability} (0–1)
 
Collateral:
- Type: ${d.collateral_type} | Value: ₹${d.collateral_value}
 
Based on this data, respond ONLY with a valid JSON object in this exact format, no markdown, no explanation:
{
  "recommendation": "APPROVE" | "REJECT" | "REVIEW",
  "confidence": <number between 0 and 1>,
  "risk_level": "LOW" | "MEDIUM" | "HIGH",
  "reasons": ["<reason 1>", "<reason 2>", "<reason 3>"]
}
`.trim();
 
    const grokResponse = await axios.post(
      "https://api.x.ai/v1/chat/completions",
      {
        model: "grok-3-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a precise loan risk assessment engine. Always respond with valid JSON only. No markdown, no extra text.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2, // low temp for consistent structured output
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROK_API_KEY}`,
        },
      }
    );
 
    const rawContent = grokResponse.data.choices[0].message.content.trim();
 
    // Strip markdown fences if model wraps response anyway
    const cleaned = rawContent
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
 
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("GROK JSON PARSE ERROR — raw content:", rawContent);
      return res.status(502).json({
        error: "Grok returned malformed JSON. Please try again.",
      });
    }
 
    // Validate required fields
    const { recommendation, confidence, risk_level, reasons } = parsed;
 
    if (!recommendation || confidence == null || !risk_level || !Array.isArray(reasons)) {
      return res.status(502).json({
        error: "Grok response missing required fields.",
      });
    }
 
    return res.json({ recommendation, confidence, risk_level, reasons });
  } catch (err) {
    // Surface Grok API errors clearly
    if (err.response) {
      console.error("GROK API ERROR:", err.response.status, err.response.data);
      return res.status(502).json({
        error: `Grok API error: ${err.response.status} — ${JSON.stringify(err.response.data)}`,
      });
    }
 
    console.error("ANALYZE RISK ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
 