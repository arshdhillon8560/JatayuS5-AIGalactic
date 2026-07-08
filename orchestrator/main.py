from fastapi import FastAPI, HTTPException
import logging
from dotenv import load_dotenv

load_dotenv()

from services.application_service import get_application_data
from services.database_service import update_application_status
from services.agent_result_service import save_agent_result
from services.ml_service import get_scores

from agents.ocr_agent import extract_text_s3
from agents.llm_parser_agent import parse_document
from agents.identity_verification_agent import verify_identity
from agents.document_consistency_agent import check_all_documents
from agents.feature_engineering_agent import build_ml_input
from agents.decision_agent import make_decision
from agents.employment_agent import verify_employment

app = FastAPI()


@app.get("/")
def home():
    return {"message": "Orchestrator running 🚀"}


@app.get("/health")
def health():
    return {"status": "ok"}


def merge_docs(docs):

    def safe_get(doc, key):
        return doc.get(key) if doc else None

    return {
        "name": safe_get(docs.get("salary_slip_url"), "name")
                or safe_get(docs.get("bank_statement_url"), "name"),

        "pan": safe_get(docs.get("itr_document_url"), "pan")
               or safe_get(docs.get("salary_slip_url"), "pan"),

        "aadhaar": safe_get(docs.get("collateral_url"), "aadhaar"),

        "account_number": safe_get(
            docs.get("bank_statement_url"),
            "account_number"
        ),

        "monthly_income": safe_get(
            docs.get("salary_slip_url"),
            "monthly_income"
        ),

        "property_value": safe_get(
            docs.get("collateral_url"),
            "property_value"
        ),

        "bank_balance_history": safe_get(
            docs.get("bank_statement_url"),
            "bank_balance_history"
        ) or []
    }


@app.post("/process-application")
def process(data: dict):

    try:

        app_id = data.get("application_id")

        if not app_id:
            raise HTTPException(
                status_code=400,
                detail="application_id required"
            )

        # =========================
        # FETCH DATABASE DATA
        # =========================

        db = get_application_data(app_id)

        if not db:
            raise HTTPException(
                status_code=404,
                detail="Application not found"
            )

        parsed_docs = {}

        # =========================
        # OCR + PARSING
        # =========================

        for key, url in db.get("documents", {}).items():

            if not url:
                continue

            try:

                print(f"\n📄 Processing document: {key}")

                text = extract_text_s3(url)

                parsed_docs[key] = parse_document(text)

            except Exception as e:

                logging.error(
                    f"OCR/PARSE failed for {key}: {str(e)}"
                )

        logging.info(f"PARSED DOCS: {parsed_docs}")

        # =========================
        # IDENTITY VERIFICATION
        # =========================

        identity_verified, identity_reason = verify_identity(
            db.get("profile", {}),
            parsed_docs
        )

        print("\n🔍 Identity Verification:", identity_reason)

        if not identity_verified:

            update_application_status(
                app_id,
                "REJECTED",
                identity_reason,
                "HIGH"
            )

            return {
              "application_id": app_id,
              "decision": "REJECTED",
              "reason": identity_reason,
              "stage": "Identity Verification"
              
            }



        # =========================
        # MERGE DOC DATA
        # =========================

        merged = merge_docs(parsed_docs)

        logging.info(f"MERGED DATA: {merged}")

        # =========================
        # DOCUMENT CONSISTENCY
        # =========================

        valid, consistency_score = check_all_documents(
            db.get("profile", {}),
            merged
        )

        print("\n📊 Consistency Score:", consistency_score)

        if not valid:

            update_application_status(
                app_id,
                "REJECTED",
                f"Low document consistency: {consistency_score}",
                "HIGH"
            )

            return {
                "decision": "REJECTED",
                "reason": "Low document consistency",
                "consistency_score": consistency_score
            }

        # =========================
        # EMPLOYMENT VERIFICATION
        # =========================

        emp_verified = verify_employment(
            db.get("employment", {})
        )

        print("💼 Employment Verified:", emp_verified)

        # =========================
        # FEATURE ENGINEERING
        # =========================

        ml_input = build_ml_input(
            db,
            merged,
            consistency_score,
            emp_verified
        )

        # =========================
        # ML API CALLS
        # =========================

        credit, fraud, ml_available, ml_error = get_scores(ml_input)

        if not ml_available:

            update_application_status(
                app_id,
                "ESCALATED",
                f"ML Service Failed: {ml_error}",
                "UNKNOWN"
            )

            return {
                "application_id": app_id,
                "decision": "ESCALATED",
                "reason": "ML service unavailable",
                "details": ml_error,
                "stage": "ML Assessment"
            }

        print("\n📥 CREDIT:", credit)
        print("📥 FRAUD:", fraud)

        pd_score = credit.get("pd_score", 0)

        risk_band = credit.get("risk_band", "UNKNOWN")

        fraud_probability = fraud.get(
            "fraud_probability",
            0
        )

        # =========================
        # FINAL DECISION
        # =========================

        decision, reason = make_decision(
            pd_score,
            fraud_probability,
            emp_verified
        )

        print("\n✅ FINAL DECISION:", decision)
        print("📝 REASON:", reason)

        # =========================
        # UPDATE APPLICATION
        # =========================

        update_application_status(
            app_id,
            decision,
            reason,
            risk_band
        )

        # =========================
        # SAVE AGENT RESULT
        # =========================

        save_agent_result(
            app_id,
            pd_score,
            fraud_probability,
            emp_verified,
            merged.get("property_value"),
            decision,
            reason
        )

        # =========================
        # FINAL RESPONSE
        # =========================

        return {
            "application_id": app_id,
            "decision": decision,
            "reason": reason,
            "risk_band": risk_band,
            "pd_score": pd_score,
            "fraud_probability": fraud_probability,
            "consistency_score": consistency_score,
            "employment_verified": emp_verified
        }

    except HTTPException as e:
        raise e

    except Exception as e:

        logging.error(f"PROCESS FAILED: {str(e)}")

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )