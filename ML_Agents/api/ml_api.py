from fastapi import FastAPI
import joblib
import pandas as pd
import os

# IMPORTANT: correct import path
from ML_Agents.utils.feature_engineering import *

app = FastAPI()

# 🔥 Base path fix (Azure safe)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")


def safe_load(path):
    if not os.path.exists(path):
        raise Exception(f"Model not found: {path}")
    return joblib.load(path)


# ✅ Load models safely
credit_model = safe_load(os.path.join(MODELS_DIR, "credit_model.pkl"))
fraud_model = safe_load(os.path.join(MODELS_DIR, "fraud_model.pkl"))
scaler = safe_load(os.path.join(MODELS_DIR, "scaler.pkl"))


@app.get("/")
def home():
    return {"message": "ML API Running 🚀"}


# ================= CREDIT =================
@app.post("/predict-credit")
def predict_credit(data: dict):
    try:
        balances = data.get("bank_balance_history", [])

        features = [[
            data["age"],
            data["monthly_income"],
            compute_debt_to_income_ratio(data["monthly_income"], data["existing_emi"]),
            compute_credit_utilization(data["credit_card_balance"], data["credit_card_limit"]),
            data["number_of_existing_loans"],
            data["years_in_job"],
            compute_repayment_history_score(data["late_payments"], data["total_payments"]),
            data["loan_amount"],
            data["loan_tenure"],
            data["account_balance"],
            compute_income_stability(balances)
        ]]

        features_df = pd.DataFrame(features, columns=[
            "age",
            "monthly_income",
            "debt_to_income_ratio",
            "credit_utilization",
            "number_of_existing_loans",
            "years_in_job",
            "repayment_history_score",
            "loan_amount",
            "loan_tenure",
            "account_balance",
            "income_stability_score"
        ])

        features_scaled = scaler.transform(features_df)

        pd_score = credit_model.predict_proba(features_scaled)[0][1]

        if pd_score < 0.2:
            risk = "LOW"
        elif pd_score < 0.5:
            risk = "MEDIUM"
        else:
            risk = "HIGH"

        return {
            "pd_score": float(pd_score),
            "risk_band": risk
        }

    except Exception as e:
        return {"error": str(e)}


# ================= FRAUD =================
@app.post("/predict-fraud")
def predict_fraud(data: dict):
    try:
        balances = data.get("bank_balance_history", [])

        features = [[
            data["income_declared"],
            data["income_detected"],
            data["address_mismatch"],
            data["document_authenticity_score"],
            compute_account_balance_pattern(balances),
            data["employment_mismatch"],
            data["rapid_loan_requests"]
        ]]

        features_df = pd.DataFrame(features, columns=[
            "income_declared",
            "income_detected",
            "address_mismatch",
            "document_authenticity_score",
            "account_balance_pattern",
            "employment_mismatch",
            "rapid_loan_requests"
        ])

        prob = fraud_model.predict_proba(features_df)[0][1]
        pred = prob > 0.7

        return {
            "fraud_probability": float(prob),
            "fraud_flag": bool(pred)
        }

    except Exception as e:
        return {"error": str(e)}