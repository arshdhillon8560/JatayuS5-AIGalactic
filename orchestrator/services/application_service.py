from database.db import get_connection


def get_application_data(application_id):

    conn = get_connection()
    cur = conn.cursor()

    
    cur.execute("""
        SELECT loan_amount, loan_tenure
        FROM applications
        WHERE application_id = %s
    """, (application_id,))
    app = cur.fetchone()

    
    cur.execute("""
        SELECT name, age, pan_number, aadhaar_number
        FROM applicant_profiles
        WHERE application_id = %s
    """, (application_id,))
    profile = cur.fetchone()

    
    cur.execute("""
        SELECT years_in_current_job, monthly_income
        FROM employment_details
        WHERE application_id = %s
    """, (application_id,))
    emp = cur.fetchone()

   
    cur.execute("""
        SELECT existing_loans, existing_emi, credit_card_limit,
               credit_card_balance, bank_account_number
        FROM financial_details
        WHERE application_id = %s
    """, (application_id,))
    fin = cur.fetchone()

    
    cur.execute("""
        SELECT bank_statement_url, salary_slip_url,
               itr_document_url, collateral_url
        FROM documents
        WHERE application_id = %s
    """, (application_id,))
    docs = cur.fetchone()

    conn.close()

    return {
        "application": {
            "loan_amount": app[0] if app else 0,
            "loan_tenure": app[1] if app else 0
        },

        
        "profile": {
            "name": profile[0] if profile else None,
            "age": profile[1] if profile else None,
            "pan": profile[2].strip().upper() if profile and profile[2] else None,
            "aadhaar": profile[3].strip() if profile and profile[3] else None
        },

        "employment": {
            "years_in_current_job": emp[0] if emp else 0,
            "monthly_income": emp[1] if emp else 0
        },

        "financial": {
            "existing_loans": fin[0] if fin else 0,
            "existing_emi": fin[1] if fin else 0,
            "credit_card_limit": fin[2] if fin else 0,
            "credit_card_balance": fin[3] if fin else 0,
            "bank_account_number": fin[4] if fin else None
        },

        "documents": {
            "bank_statement_url": docs[0] if docs else None,
            "salary_slip_url": docs[1] if docs else None,
            "itr_document_url": docs[2] if docs else None,
            "collateral_url": docs[3] if docs else None
        }
    }