const db = require("../config/db");
const generateId = require("../utils/generateId");
const s3 = require("../config/s3");
const axios = require("axios");

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
      VALUES($1,$2,$3,$4,$5,'PENDING')`,
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
        ar.employment_verified,
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
      return res.status(404).json({
        message: "Not found"
      });
    }

    const app = result.rows[0];

    res.json({
      ...app,

      agent_scores: {
        pd: app.credit_pd_score,
        fraud: app.fraud_probability,

        employment_verified:
          app.employment_verified,

        collateral_value:
          app.collateral_value,

        collateral_risk:
          app.collateral_risk,
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


exports.getApplicationAIAnalysis = async (req, res) => {

  try {

    const { id } = req.params;

    const result = await db.query(
      `
      SELECT

        -- APPLICATION
        a.application_id,
        a.loan_amount,
        a.loan_tenure,
        a.loan_purpose,
        a.status,
        a.final_decision,
        a.reason,
        a.risk_band,
        a.kyc_status,

        -- PROFILE
        ap.age,

        -- EMPLOYMENT
        e.employment_type,
        e.employer_name,
        e.industry,
        e.job_title,
        e.years_in_current_job,
        e.total_work_experience,
        e.monthly_income,

        -- FINANCIAL
        f.existing_loans,
        f.existing_emi,
        f.credit_card_limit,
        f.credit_card_balance,
        f.average_monthly_balance,

        -- DOCUMENTS
        d.collateral_type,

        -- AGENT RESULTS
        ar.credit_pd_score,
        ar.fraud_probability,
        ar.employment_verified,
        ar.collateral_value

      FROM applications a

      LEFT JOIN applicant_profiles ap
        ON ap.application_id = a.application_id

      LEFT JOIN employment_details e
        ON e.application_id = a.application_id

      LEFT JOIN financial_details f
        ON f.application_id = a.application_id

      LEFT JOIN documents d
        ON d.application_id = a.application_id

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

      return res.status(404).json({
        message: "Application not found"
      });
    }

    const d = result.rows[0];



    const prompt = `
You are an AI loan advisor helping an applicant understand their loan application result.

Analyze the following loan application and explain clearly in simple language.

Loan Details:
- Loan Amount: ₹${d.loan_amount}
- Loan Tenure: ${d.loan_tenure} months
- Purpose: ${d.loan_purpose}

Applicant:
- Age: ${d.age}
- Employment Type: ${d.employment_type}
- Employer: ${d.employer_name}
- Industry: ${d.industry}
- Job Title: ${d.job_title}
- Years in Current Job: ${d.years_in_current_job}
- Total Experience: ${d.total_work_experience}
- Monthly Income: ₹${d.monthly_income}

Financial Details:
- Existing Loans: ${d.existing_loans}
- Existing EMI: ₹${d.existing_emi}
- Credit Card Limit: ₹${d.credit_card_limit}
- Credit Card Balance: ₹${d.credit_card_balance}
- Average Monthly Balance: ₹${d.average_monthly_balance}

AI Risk Scores:
- Credit PD Score: ${d.credit_pd_score}
- Fraud Probability: ${d.fraud_probability}

Collateral:
- Type: ${d.collateral_type}
- Value: ₹${d.collateral_value}

Final Decision:
- ${d.final_decision}

Explain:
1. Why this decision happened
2. Main strengths
3. Main risks
4. What user can improve

Return ONLY JSON:

{
  "summary": "",
  "strengths": [],
  "risks": [],
  "improvements": []
}
`.trim();


    const groqResponse = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",

        response_format: {
          type: "json_object"
        },

        messages: [
          {
            role: "system",
            content:
              "You are a loan analysis AI. Always return valid JSON only."
          },
          {
            role: "user",
            content: prompt
          }
        ],

        temperature: 0.3
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROK_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );


    const raw =
      groqResponse.data.choices[0].message.content.trim();

    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);




    return res.json({
      application_id: d.application_id,
      final_decision: d.final_decision,
      risk_band: d.risk_band,
      ai_analysis: parsed
    });

  } catch (err) {

    console.error("AI ANALYSIS ERROR:", err);

    return res.status(500).json({
      error: err.message
    });
  }
};