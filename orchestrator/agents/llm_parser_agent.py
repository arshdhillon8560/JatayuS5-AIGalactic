import re
import os
import json
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# -------------------------
# HELPERS
# -------------------------

def clean_number(val):
    try:
        return int(float(val.replace(",", "")))
    except:
        return None


def safe_json_parse(text):
    try:
        text = text.replace("```json", "").replace("```", "").strip()
        return json.loads(text)
    except:
        return {}


# -------------------------
# BASIC EXTRACTIONS
# -------------------------

def extract_name(text):
    match = re.search(r"(Employee Name|Name)\s*[:\-]?\s*([A-Za-z ]+)", text, re.I)
    return match.group(2).strip() if match else None


def extract_pan(text):
    match = re.search(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b", text)
    return match.group(0) if match else None


def extract_aadhaar(text):
    matches = re.findall(r"\b\d{12}\b", text)
    return matches[-1] if matches else None


def extract_account(text):
    matches = re.findall(r"\b\d{12,18}\b", text)
    return matches[0] if matches else None


# -------------------------
# SALARY (FIXED)
# -------------------------

def extract_salary(text):

    patterns = [
        r"Net Salary[^\d]*([\d,]+)",
        r"Net Pay[^\d]*([\d,]+)",
        r"Take Home[^\d]*([\d,]+)",
        r"Salary Credit[^\d]*([\d,]+)",
    ]

    for p in patterns:
        match = re.search(p, text, re.I)
        if match:
            val = clean_number(match.group(1))
            if val and val > 5000:
                return val

    return None


# -------------------------
# ITR INCOME
# -------------------------

def extract_itr_income(text):

    patterns = [
        r"Gross Total Income[^\d]*([\d,]+)",
        r"Total Income[^\d]*([\d,]+)",
        r"Income[^\d]*([\d,]+)",
    ]

    for p in patterns:
        match = re.search(p, text, re.I)
        if match:
            val = clean_number(match.group(1))

            # filter garbage like year/pincode
            if val and val > 50000:
                return val

    return None


# -------------------------
# PROPERTY VALUE
# -------------------------

def extract_property(text):
    matches = re.findall(r"₹\s*([\d,]+)", text)
    values = [clean_number(x) for x in matches]

    # choose realistic property value
    values = [v for v in values if v and v > 50000]

    return max(values) if values else None


# -------------------------
# BANK BALANCE (CRITICAL FIX)
# -------------------------

def extract_balance_history(text):

    lines = text.split("\n")
    balances = []

    for line in lines:
        if any(word in line.lower() for word in ["balance", "bal"]):

            nums = re.findall(r"[\d,]+\.\d+", line)

            for n in nums:
                val = clean_number(n)

                # filter unrealistic numbers
                if val and 10000 < val < 10000000:
                    balances.append(val)

    # fallback if nothing found
    if not balances:
        nums = re.findall(r"[\d,]+\.\d+", text)
        for n in nums:
            val = clean_number(n)
            if val and 10000 < val < 10000000:
                balances.append(val)

    print("💰 Extracted balances:", balances)

    return balances[-12:]


# -------------------------
# LLM FALLBACK
# -------------------------

def parse_with_llm(text):

    prompt = f"""
Extract structured JSON from OCR text.

Rules:
- Extract correct NAME, PAN, Aadhaar
- Extract monthly income (if available)
- Extract ONLY valid bank balances (ignore PIN, phone numbers)
- Extract property value if present
- Return clean JSON

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

    try:
        res = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}]
        )

        return safe_json_parse(res.choices[0].message.content)

    except Exception as e:
        print("❌ LLM ERROR:", e)
        return {}


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

    data = {
        "name": extract_name(text),
        "pan": extract_pan(text),
        "aadhaar": extract_aadhaar(text),
        "account_number": extract_account(text),
        "monthly_income": extract_salary(text) or extract_itr_income(text),
        "property_value": extract_property(text),
        "bank_balance_history": extract_balance_history(text)
    }

    # 🔥 smart fallback trigger
    if (
        not data["name"]
        or not data["pan"]
        or not data["monthly_income"]
        or len(data["bank_balance_history"]) < 3
    ):
        print("⚠️ LLM fallback triggered...")
        llm_data = parse_with_llm(text)

        for key in data:
            if not data[key] and llm_data.get(key):
                data[key] = llm_data[key]

    # validation
    data["pan"] = validate_pan(data["pan"])
    data["aadhaar"] = validate_aadhaar(data["aadhaar"])

    # ensure clean list
    if isinstance(data["bank_balance_history"], list):
        data["bank_balance_history"] = [
            int(x) for x in data["bank_balance_history"]
            if isinstance(x, (int, float)) and x > 10000
        ]

    print("✅ FINAL PARSED:", data)

    return data