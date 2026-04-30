from database.db import get_connection

def save_agent_result(app_id, pd, fraud, emp, collateral, decision, reason):

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO agent_results
        (application_id, credit_pd_score, fraud_probability,
         employment_verified, collateral_value, final_decision, decision_reason)
        VALUES (%s,%s,%s,%s,%s,%s,%s)
    """, (app_id, pd, fraud, emp, collateral, decision, reason))

    conn.commit()
    conn.close()