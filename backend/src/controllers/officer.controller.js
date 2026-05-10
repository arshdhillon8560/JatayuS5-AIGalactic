const db = require("../config/db");


exports.getEscalatedApplications = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
         application_id,
         user_id,
         loan_amount,
         loan_tenure,
         loan_purpose,
         risk_band,
         created_at
       FROM applications 
       WHERE status = 'ESCALATED'
       ORDER BY created_at DESC`
    );

    res.json({
      count: result.rows.length,
      applications: result.rows
    });

  } catch (err) {
    console.error("ESCALATED ERROR:", err);
    res.status(500).json({ error: err.message });
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

    res.json(result.rows[0]);

  } catch (err) {

    console.error("DETAIL ERROR:", err);

    res.status(500).json({
      error: err.message
    });
  }
};


exports.updateDecision = async (req, res) => {
  try {

    const { application_id, decision, reason } = req.body;

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
