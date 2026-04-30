import re
import os
import json
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))



def extract_name(text):
    matches = re.findall(r"Name\s*[:\-]?\s*([A-Za-z ]+)", text)
    for m in matches:
        if m.strip().lower() not in ["address", "bank"]:
            return m.strip()
    return None


def extract_pan(text):
    match = re.search(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b", text)
    return match.group(0) if match else None


def extract_aadhaar(text):
    matches = re.findall(r"\b\d{12}\b", text)
    return matches[-1] if matches else None


def extract_account(text):
    match = re.search(r"\b\d{12,18}\b", text)
    return match.group(0) if match else None


def extract_salary(text):
    match = re.search(r"(NET SALARY|Salary Credit).*?([\d,]+\.\d+)", text, re.S | re.I)
    if match:
        return int(match.group(2).replace(",", "").split(".")[0])
    return None


def extract_property(text):
    match = re.search(r"₹\s*([\d,]+)", text)
    if match:
        return int(match.group(1).replace(",", ""))
    return None



def extract_balance_history(text):
    matches = re.findall(r"BALANCE\s*[:\-]?\s*([\d,]+\.\d+)", text)
    balances = [int(float(x.replace(",", ""))) for x in matches]
    return balances[-12:]  



def safe_json_parse(text):
    try:
        text = text.replace("```json", "").replace("```", "").strip()
        return json.loads(text)
    except:
        return {}



def parse_with_llm(text):

    prompt = f"""
Extract structured JSON from OCR text.

Rules:
- Extract BUYER details (ignore seller)
- Extract correct PAN and Aadhaar
- Extract ALL balance values (last 10–15 preferred)
- Ignore random numbers like transaction IDs
- If not found → null

Return JSON ONLY:

{{
"name": "",
"pan": "",
"aadhaar": "",
"account_number": "",
"monthly_income": 0,
"property_value": 0,
"bank_balance_history": []
}}

TEXT:
{text}
"""

    res = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )

    return safe_json_parse(res.choices[0].message.content)



def validate_pan(pan):
    return pan if pan and re.match(r"[A-Z]{5}[0-9]{4}[A-Z]", pan) else None


def validate_aadhaar(a):
    return a if a and len(a) == 12 else None


def parse_document(text):

    data = {
        "name": extract_name(text),
        "pan": extract_pan(text),
        "aadhaar": extract_aadhaar(text),
        "account_number": extract_account(text),
        "monthly_income": extract_salary(text),
        "property_value": extract_property(text),
        "bank_balance_history": extract_balance_history(text)
    }

    if not data["name"] or not data["pan"]:
        print("⚠️ LLM fallback triggered...")
        llm_data = parse_with_llm(text)

        for key in data:
            if not data[key] and llm_data.get(key):
                data[key] = llm_data[key]

    data["pan"] = validate_pan(data["pan"])
    data["aadhaar"] = validate_aadhaar(data["aadhaar"])

    if isinstance(data["bank_balance_history"], list):
        data["bank_balance_history"] = [
            int(x) for x in data["bank_balance_history"]
            if isinstance(x, (int, float))
        ]

    print("FINAL PARSED:", data)
    return data