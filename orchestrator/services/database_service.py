from database.db import get_connection

def update_application_status(app_id, status, reason):

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE applications
        SET status=%s,
            final_decision=%s,
            reason=%s,
            updated_at=NOW()
        WHERE application_id=%s
    """, (status, status, reason, app_id))

    conn.commit()
    conn.close()