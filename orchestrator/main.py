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


# -------------------------
# SAFE MERGE FUNCTION
# -------------------------
def merge_docs(docs):

    def safe_get(doc, key):
        return doc.get(key) if doc else None

    return {
        "name": safe_get(docs.get("salary_slip_url"), "name")
                or safe_get(docs.get("bank_statement_url"), "name"),

        "pan": safe_get(docs.get("itr_document_url"), "pan")
               or safe_get(docs.get("salary_slip_url"), "pan"),

        "aadhaar": safe_get(docs.get("collateral_url"), "aadhaar"),

        "account_number": safe_get(docs.get("bank_statement_url"), "account_number"),

        "monthly_income": safe_get(docs.get("salary_slip_url"), "monthly_income"),

        "property_value": safe_get(docs.get("collateral_url"), "property_value"),

        "bank_balance_history": safe_get(
            docs.get("bank_statement_url"), "bank_balance_history"
        ) or []
    }



@app.post("/process-application")
def process(data: dict):

    try:
        app_id = data.get("application_id")

        if not app_id:
            raise HTTPException(status_code=400, detail="application_id required")

       
        db = get_application_data(app_id)

        if not db:
            raise HTTPException(status_code=404, detail="Application not found")

        parsed_docs = {}

        
        for key, url in db.get("documents", {}).items():
            if not url:
                continue

            try:
                text = extract_text_s3(url)
                parsed_docs[key] = parse_document(text)
            except Exception as e:
                logging.error(f"OCR/PARSE failed for {key}: {str(e)}")

        logging.info(f"PARSED DOCS: {parsed_docs}")

        
        merged = merge_docs(parsed_docs)

        logging.info(f"MERGED DATA: {merged}")

        
        valid, consistency_score = check_all_documents(
            db.get("profile", {}), merged
        )

        if not valid:
            update_application_status(
                app_id, "REJECTED", f"Low consistency: {consistency_score}"
            )
            return {
                "decision": "REJECTED",
                "reason": "Low document consistency"
            }

       
        emp_verified = verify_employment(db.get("employment", {}))

        
        ml_input = build_ml_input(
            db, merged, consistency_score, emp_verified
        )

        
        credit, fraud = get_scores(ml_input)

       
        decision, reason = make_decision(
            credit.get("pd_score", 0),
            fraud.get("fraud_probability", 0),
            emp_verified
        )

        
        update_application_status(app_id, decision, reason)

        save_agent_result(
            app_id,
            credit.get("pd_score", 0),
            fraud.get("fraud_probability", 0),
            emp_verified,
            merged.get("property_value"),
            decision,
            reason
        )

        return {
            "decision": decision,
            "reason": reason,
            "pd_score": credit.get("pd_score"),
            "fraud": fraud.get("fraud_probability"),
            "consistency_score": consistency_score
        }

    except HTTPException as e:
        raise e

    except Exception as e:
        logging.error(f"PROCESS FAILED: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")