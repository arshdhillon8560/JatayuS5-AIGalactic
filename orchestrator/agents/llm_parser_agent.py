import re
import os
import json
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


# -------------------------
# NAME
# -------------------------
def extract_name(text):
    matches = re.findall(r"(?:Name|Customer Name)\s*[:\-]?\s*([A-Za-z ]+)", text, re.I)
    for m in matches:
        if m.strip().lower() not in ["address", "bank"]:
            return m.strip()
    return None


# -------------------------
# PAN
# -------------------------
def extract_pan(text):
    match = re.search(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b", text)
    return match.group(0) if match else None


# -------------------------
# AADHAAR
# -------------------------
def extract_aadhaar(text):
    matches = re.findall(r"\b\d{12}\b", text)
    return matches[-1] if matches else None


# -------------------------
# ACCOUNT
# -------------------------
def extract_account(text):
    match = re.search(r"\b\d{12,18}\b", text)
    return match.group(0) if match else None


# -------------------------
# SALARY (IMPROVED)
# -------------------------
def extract_salary(text):
    match = re.search(
        r"(NET SALARY|Salary Credit|Monthly Salary|Net Pay)[^\d]*([\d,]+\.?\d*)",
        text,
        re.I
    )
    if match:
        return int(float(match.group(2).replace(",", "")))
    return None


# -------------------------
# PROPERTY VALUE
# -------------------------
def extract_property(text):
    match = re.search(r"(₹|Rs\.?)\s*([\d,]+)", text)
    if match:
        return int(match.group(2).replace(",", ""))
    return None


# -------------------------
# ITR INCOME (NEW 🔥)
# -------------------------
def extract_itr_income(text):
    match = re.search(
        r"(Total Income|Gross Total Income|Income)[^\d]*([\d,]+\.?\d*)",
        text,
        re.I
    )
    if match:
        return int(float(match.group(2).replace(",", "")))
    return None


# -------------------------
# BANK BALANCES (FIXED 🔥🔥🔥)
# -------------------------
def extract_balance_history(text):
    matches = re.findall(
        r"(?:BALANCE|Balance|Bal|Available Balance|Closing Balance)[^\d]*([\d,]+\.?\d*)",
        text,
        re.I
    )

    balances = []

    for m in matches:
        try:
            val = int(float(m.replace(",", "")))
            if val > 1000:  # filter garbage
                balances.append(val)
        except:
            continue

    return balances[-12:]


# -------------------------
# SAFE JSON PARSE
# -------------------------
def safe_json_parse(text):
    try:
        text = text.replace("```json", "").replace("```", "").strip()
        return json.loads(text)
    except:
        return {}


# -------------------------
# LLM FALLBACK (STRONGER PROMPT)
# -------------------------
def parse_with_llm(text):

    prompt = f"""
Extract structured JSON from OCR text.

STRICT RULES:
- Extract buyer/applicant details only
- Ignore seller / random numbers
- Extract PAN, Aadhaar, Account Number correctly
- Extract ALL bank balances (last 10–15 entries)
- Extract income from salary OR ITR
- If multiple Aadhaar → choose most relevant
- Return ONLY JSON

Format:

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


# -------------------------
# VALIDATION
# -------------------------
def validate_pan(pan):
    return pan if pan and re.match(r"[A-Z]{5}[0-9]{4}[A-Z]", pan) else None


def validate_aadhaar(a):
    return a if a and len(a) == 12 else None


# -------------------------
# MAIN PARSER
# -------------------------
def parse_document(text):

    print("\n🧾 OCR SAMPLE:\n", text[:300])

    salary = extract_salary(text)
    itr_income = extract_itr_income(text)

    data = {
        "name": extract_name(text),
        "pan": extract_pan(text),
        "aadhaar": extract_aadhaar(text),
        "account_number": extract_account(text),
        "monthly_income": salary or itr_income,
        "property_value": extract_property(text),
        "bank_balance_history": extract_balance_history(text)
    }

    print("💰 Extracted balances:", data["bank_balance_history"])

    # 🔥 smarter fallback condition
    if (
        not data["name"]
        or not data["pan"]
        or not data["bank_balance_history"]
    ):
        print("⚠️ LLM fallback triggered...")
        llm_data = parse_with_llm(text)

        for key in data:
            if not data[key] and llm_data.get(key):
                data[key] = llm_data[key]

    # validation
    data["pan"] = validate_pan(data["pan"])
    data["aadhaar"] = validate_aadhaar(data["aadhaar"])

    if isinstance(data["bank_balance_history"], list):
        data["bank_balance_history"] = [
            int(x) for x in data["bank_balance_history"]
            if isinstance(x, (int, float))
        ]

    print("FINAL PARSED:", data)
    return data