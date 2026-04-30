def check_all_documents(profile, data):

    score = 0
    total = 3

    if profile.get("name") and data.get("name"):
        if profile["name"].lower() in data["name"].lower():
            score += 1

    if profile.get("pan") and data.get("pan"):
        if profile["pan"] == data["pan"]:
            score += 1

    if profile.get("aadhaar") and data.get("aadhaar"):
        if profile["aadhaar"] == data["aadhaar"]:
            score += 1

    consistency_score = score / total

    if consistency_score < 0.5:
        return False, consistency_score

    return True, consistency_score