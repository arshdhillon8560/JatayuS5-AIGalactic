def make_decision(pd, fraud, emp):

    pd = round(pd, 2)
    fraud = round(fraud, 2)

    if fraud > 0.7:
        return "REJECTED", "High fraud risk"

    if pd > 0.6:
        return "REJECTED", "High credit risk"

    if not emp:
        return "ESCALATED", "Employment not verified"

    if 0.4 < pd <= 0.6:
        return "ESCALATED", "Medium risk"

    return "APPROVED", "Low risk"