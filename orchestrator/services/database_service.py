from database.db import get_connection


def update_application_status(
    app_id,
    decision,
    reason,
    risk_band=None
):

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE applications
        SET
            status=%s,
            final_decision=%s,
            reason=%s,
            risk_band=%s,
            updated_at=NOW()
        WHERE application_id=%s
    """, (
        decision,
        decision,
        reason,
        risk_band,
        app_id
    ))

    conn.commit()
    conn.close()