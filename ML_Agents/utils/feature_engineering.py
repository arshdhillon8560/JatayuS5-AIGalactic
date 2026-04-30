import numpy as np

def compute_debt_to_income_ratio(monthly_income, existing_emi):
    if monthly_income == 0:
        return 0
    return round(existing_emi / monthly_income, 3)

def compute_credit_utilization(balance, limit):
    if limit == 0:
        return 0
    return round(balance / limit, 3)

def compute_income_stability(bank_balances):
    if len(bank_balances) == 0:
        return 0.5
    std = np.std(bank_balances)
    mean = np.mean(bank_balances)
    if mean == 0:
        return 0.5
    stability = 1 - (std / mean)
    return round(max(0, min(1, stability)), 3)

def compute_account_balance_pattern(bank_balances):
    if len(bank_balances) < 2:
        return 0.5
    diff = np.diff(bank_balances)
    volatility = np.std(diff)
    return round(min(1, volatility / 100000), 3)

def compute_repayment_history_score(late_payments, total_payments):
    if total_payments == 0:
        return 0.5
    return round(1 - (late_payments / total_payments), 3)