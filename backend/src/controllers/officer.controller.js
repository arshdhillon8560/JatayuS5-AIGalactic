const db = require("../config/db");

const S3_BASE_URL = process.env.AWS_S3_BASE_URL;


const makeFileUrl = (key) => {

  if (!key) return null;

  if (key.startsWith("http")) {
    return key;
  }

  return `${S3_BASE_URL}/${key}`;
};



exports.getEscalatedApplications = async (req, res) => {

  try {

    const result = await db.query(
      `
      SELECT 
         application_id,
         user_id,
         loan_amount,
         loan_tenure,
         loan_purpose,
         risk_band,
         created_at
      FROM applications 
      WHERE status = 'ESCALATED'
      ORDER BY created_at DESC
      `
    );

    res.json({
      count: result.rows.length,
      applications: result.rows
    });

  } catch (err) {

    console.error("ESCALATED ERROR:", err);

    res.status(500).json({
      error: err.message
    });
  }
};


exports.getApplicationDetails = async (req, res) => {

  try {

    const { id } = req.params;

    const result = await db.query(
      `
      SELECT

        -- APPLICATION
        a.*,

        -- PROFILE
        ap.*,

        -- EMPLOYMENT
        e.*,

        -- FINANCIAL
        f.*,

        -- DOCUMENTS
        d.*,

        -- AGENT RESULTS
        ar.*

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

    const data = result.rows[0];

    data.bank_statement_url = makeFileUrl(data.bank_statement_url);

    data.salary_slip_url = makeFileUrl(data.salary_slip_url);

    data.itr_document_url = makeFileUrl(data.itr_document_url);

    data.collateral_url = makeFileUrl(data.collateral_url);

    res.json(data);

  } catch (err) {

    console.error("DETAIL ERROR:", err);

    res.status(500).json({
      error: err.message
    });
  }
};



exports.updateDecision = async (req, res) => {

  try {

    const {
      application_id,
      decision,
      reason
    } = req.body;

    if (!application_id || !decision) {

      return res.status(400).json({
        message: "application_id and decision are required"
      });
    }

    if (!["APPROVED", "REJECTED"].includes(decision)) {

      return res.status(400).json({
        message: "Decision must be APPROVED or REJECTED"
      });
    }


    await db.query(
      `
      UPDATE applications
      SET
        status = $1,
        final_decision = $1,
        reason = $2,
        updated_at = NOW()
      WHERE application_id = $3
      `,
      [
        decision,
        reason || null,
        application_id
      ]
    );

    const existing = await db.query(
      `
      SELECT id
      FROM agent_results
      WHERE application_id = $1
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [application_id]
    );

    if (existing.rows.length > 0) {

      await db.query(
        `
        UPDATE agent_results
        SET
          final_decision = $1,
          decision_reason = $2
        WHERE id = $3
        `,
        [
          decision,
          reason || "Manual decision by officer",
          existing.rows[0].id
        ]
      );

    } else {

      await db.query(
        `
        INSERT INTO agent_results
        (
          application_id,
          final_decision,
          decision_reason
        )
        VALUES ($1,$2,$3)
        `,
        [
          application_id,
          decision,
          reason || "Manual decision by officer"
        ]
      );
    }

    res.json({
      message: "Decision updated successfully",
      application_id,
      status: decision,
      reason: reason || null
    });

  } catch (err) {

    console.error("DECISION ERROR:", err);

    res.status(500).json({
      error: err.message
    });
  }
};


// ── GROK AI RISK ANALYSIS ─────────────────────────────────────────────────
exports.analyzeRisk = async (req, res) => {
  try {
    const d = req.body;
 
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
            content: "You are a precise loan risk assessment engine. Always respond with valid JSON only. No markdown, no extra text.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROK_API_KEY}`,
        },
      }
    );
 
    const rawContent = grokResponse.data.choices[0].message.content.trim();
 
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
      return res.status(502).json({ error: "Grok returned malformed JSON. Please try again." });
    }
 
    const { recommendation, confidence, risk_level, reasons } = parsed;
 
    if (!recommendation || confidence == null || !risk_level || !Array.isArray(reasons)) {
      return res.status(502).json({ error: "Grok response missing required fields." });
    }
 
    return res.json({ recommendation, confidence, risk_level, reasons });
  } catch (err) {
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