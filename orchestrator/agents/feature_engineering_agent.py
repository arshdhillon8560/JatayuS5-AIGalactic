def build_ml_input(db, data, consistency_score, emp_verified):

    history = data.get("bank_balance_history", [])
    if not history:
        print("No bank history → using fallback")
        history = [data.get("monthly_income", 0)] * 6

    account_balance = history[-1]

    ml_input = {
        "age": db["profile"].get("age"),

        "monthly_income": data.get("monthly_income")
        or db["employment"].get("monthly_income"),

        "years_in_job": db["employment"].get("years_in_current_job"),

        "existing_emi": db["financial"].get("existing_emi"),
        "credit_card_balance": db["financial"].get("credit_card_balance"),
        "credit_card_limit": db["financial"].get("credit_card_limit"),
        "number_of_existing_loans": db["financial"].get("existing_loans"),

        "loan_amount": db["application"].get("loan_amount"),
        "loan_tenure": db["application"].get("loan_tenure"),

        "account_balance": account_balance,
        "bank_balance_history": history,
        "property_value": data.get("property_value"),

        # signals
        "consistency_score": consistency_score,
        "employment_verified": emp_verified
    }

    print("\nML INPUT:", ml_input)
    return ml_input