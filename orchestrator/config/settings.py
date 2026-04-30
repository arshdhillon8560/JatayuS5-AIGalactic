import os
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.getenv("DB_URL")

ML_API_URL = os.getenv("ML_API_URL")  

CREDIT_API = f"{ML_API_URL}/predict-credit"
FRAUD_API = f"{ML_API_URL}/predict-fraud"

GROQ_API_KEY = os.getenv("GROQ_API_KEY")