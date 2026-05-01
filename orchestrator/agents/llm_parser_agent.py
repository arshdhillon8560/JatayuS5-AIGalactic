import re
import os
import json
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))



def clean_number(val):
    try:
        return int(float(val.replace(",", "")))
    except:
        return None



def detect_document_type(text):
    t = text.lower()

    if "account statement" in t:
        return "bank"

    if "salary slip" in t or "net salary" in t:
        return "salary"

    if "income tax return" in t:
        return "itr"

    if "sale deed" in t or "registration" in t:
        return "collateral"

    return "unknown"



def extract_name(text):
    patterns = [
        r"Name\s*[:\-]?\s*([A-Za-z ]+)",
        r"Name\s*\n\s*([A-Za-z ]+)"
    ]

    for p in patterns:
        match = re.search(p, text, re.I)
        if match:
            name = match.group(1).strip()

            # avoid common OCR mistakes
            if name.lower() not in ["address", "india", "government"]:
                return name

    return None


def extract_pan(text):
    match = re.search(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b", text)
    return match.group(0) if match else None


def extract_aadhaar(text):
    matches = re.findall(r"\b\d{12}\b", text)
    return matches[-1] if matches else None


def extract_account(text):
    match = re.search(
        r"Account Number\s*[:\-]?\s*(\d{10,18})", text, re.I
    )
    return match.group(1) if match else None



def extract_salary(text):

    patterns = [
        r"NET SALARY.*?([\d,]+\.\d+)",
        r"Net Salary.*?([\d,]+\.\d+)",
        r"Salary Credit.*?([\d,]+\.\d+)"
    ]

    for p in patterns:
        match = re.search(p, text, re.S | re.I)
        if match:
            return clean_number(match.group(1))

    return None



def extract_property(text):

    match = re.search(r"₹\s*([\d,]+)", text)

    if match:
        return clean_number(match.group(1))

    return None



def extract_balance_history(text):

    balances = []
    lines = text.split("\n")

    for line in lines:

        
        if re.search(r"\d{2}[-\s][A-Za-z]{3}[-\s]\d{4}", line):

            nums = re.findall(r"[\d,]+\.\d+", line)

            if nums:
                val = clean_number(nums[-1])

                if val and 10000 < val < 10000000:
                    balances.append(val)

    
    if len(balances) < 5:
        print("⚠️ fallback balance parsing...")

        nums = re.findall(r"[\d,]+\.\d+", text)
        cleaned = [clean_number(n) for n in nums]

        balances = [
            x for x in cleaned
            if x and 50000 < x < 10000000
        ]

    print("💰 Extracted balances:", balances)

    return balances[-12:]


def extract_buyer_details(text):

    section = re.search(
        r"BUYER DETAILS(.*?)(PROPERTY DETAILS|CONSIDERATION)",
        text,
        re.S | re.I
    )

    if not section:
        return None, None, None

    block = section.group(1)

    name = re.search(r"Name\s*[:\-]?\s*([A-Za-z ]+)", block)
    pan = re.search(r"[A-Z]{5}[0-9]{4}[A-Z]", block)
    aadhaar = re.search(r"\b\d{12}\b", block)

    return (
        name.group(1).strip() if name else None,
        pan.group(0) if pan else None,
        aadhaar.group(0) if aadhaar else None
    )


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
- Extract BUYER details
- Extract PAN, Aadhaar
- Extract ALL balances
- Ignore transaction IDs
- If missing → null

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



def parse_document(text):

    doc_type = detect_document_type(text)
    print("📄 Document Type:", doc_type)

    name = pan = aadhaar = account = None
    income = property_value = None
    balances = []

    if doc_type == "bank":
        name = extract_name(text)
        account = extract_account(text)
        balances = extract_balance_history(text)

    elif doc_type == "salary":
        name = extract_name(text)
        pan = extract_pan(text)
        aadhaar = extract_aadhaar(text)
        account = extract_account(text)
        income = extract_salary(text)

    elif doc_type == "itr":

        name_match = re.search(r"Name\s*\n\s*([A-Za-z ]+)", text)
        if name_match:
            name = name_match.group(1).strip()

        pan = extract_pan(text)
        account = extract_account(text)

        match = re.search(r"Total Income.*?([\d,]+)", text, re.I)
        if match:
            income = clean_number(match.group(1))

    elif doc_type == "collateral":
        name, pan, aadhaar = extract_buyer_details(text)
        property_value = extract_property(text)

    data = {
        "name": name,
        "pan": pan,
        "aadhaar": aadhaar,
        "account_number": account,
        "monthly_income": income,
        "property_value": property_value,
        "bank_balance_history": balances
    }

    if doc_type != "bank" and (not data["name"] or not data["pan"]):
        print("⚠️ LLM fallback triggered...")
        llm_data = parse_with_llm(text)

        for key in data:
            if not data[key] and llm_data.get(key):
                data[key] = llm_data[key]

    print("FINAL PARSED:", data)
    return data