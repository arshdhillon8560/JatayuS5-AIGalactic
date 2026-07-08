import requests
from config.settings import CREDIT_API, FRAUD_API
from decimal import Decimal


def clean(val):
    if isinstance(val, Decimal):
        return float(val)
    return val if val is not None else 0


def get_scores(data):

    income = clean(data.get("monthly_income"))
    history = [int(x) for x in data.get("bank_balance_history", [])]

    
    total_payments = max(len(history), 1)

    if history:
        min_balance = min(history)
        avg_balance = sum(history) / len(history)
        stability = max(history) - min(history)

    
        late_payments = 1 if min_balance < 0.2 * income else 0
    else:
        avg_balance = 0
        stability = 0
        late_payments = 0

    
    emi = clean(data.get("existing_emi"))
    loan = clean(data.get("loan_amount"))
    cc_balance = clean(data.get("credit_card_balance"))
    cc_limit = clean(data.get("credit_card_limit"))
    account_balance = clean(data.get("account_balance"))

    emi_ratio = emi / income if income else 0
    loan_income_ratio = loan / (income * 12) if income else 0
    credit_utilization = cc_balance / cc_limit if cc_limit else 0
    balance_income_ratio = account_balance / income if income else 0
    payment_ratio = late_payments / total_payments

    
    credit_payload = {
        "age": clean(data.get("age")),
        "monthly_income": income,
        "existing_emi": emi,
        "credit_card_balance": cc_balance,
        "credit_card_limit": cc_limit,
        "number_of_existing_loans": clean(data.get("number_of_existing_loans")),
        "years_in_job": clean(data.get("years_in_job")),
        "loan_amount": loan,
        "loan_tenure": clean(data.get("loan_tenure")),
        "account_balance": account_balance,

        
        "late_payments": late_payments,
        "total_payments": total_payments,
        "avg_balance": avg_balance,
        "balance_stability": stability,

        "emi_income_ratio": emi_ratio,
        "loan_income_ratio": loan_income_ratio,
        "credit_utilization": credit_utilization,
        "balance_income_ratio": balance_income_ratio,
        "payment_ratio": payment_ratio
    }

    
    fraud_payload = {
        "income_declared": income,
        "income_detected": income,
        "address_mismatch": 0 if data.get("consistency_score", 0) > 0.7 else 1,
        "device_location": 1,
        "rapid_loan_requests": 0,
        "document_authenticity_score": round(clean(data.get("consistency_score")), 2),
        "employment_mismatch": 0 if data.get("employment_verified") else 1,
        "bank_balance_history": history
    }

    print("\n📤 CREDIT:", credit_payload)
    print("📤 FRAUD:", fraud_payload)

    
    credit_res = requests.post(CREDIT_API, json=credit_payload)
    fraud_res = requests.post(FRAUD_API, json=fraud_payload)

    credit = credit_res.json()
    fraud = fraud_res.json()

    print("\n📥 CREDIT RESPONSE:", credit)
    print("📥 FRAUD RESPONSE:", fraud)

    return credit, fraud, True, None