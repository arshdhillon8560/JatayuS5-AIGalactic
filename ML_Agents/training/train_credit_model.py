import pandas as pd
import joblib
import os

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import roc_auc_score

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
data_path = os.path.join(BASE_DIR, "datasets", "credit_dataset_100k.csv")

data = pd.read_csv(data_path)



# EMI to income ratio
data["emi_income_ratio"] = data["existing_emi"] / (data["monthly_income"] + 1)

# Loan to income ratio
data["loan_income_ratio"] = data["loan_amount"] / (data["monthly_income"] * 12 + 1)

# Credit utilization
data["credit_utilization"] = data["credit_card_balance"] / (data["credit_card_limit"] + 1)

# Payment behavior ratio
data["payment_ratio"] = data["late_payments"] / (data["total_payments"] + 1)

# Balance strength
data["balance_income_ratio"] = data["account_balance"] / (data["monthly_income"] + 1)


X = data.drop(["pd_score", "default", "credit_history_length"], axis=1)
y = data["default"]

print("Training features:\n", X.columns)


X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)


scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)


rf = RandomForestClassifier(
    n_estimators=300,
    max_depth=12,
    min_samples_split=10,
    class_weight="balanced", 
    random_state=42
)


model = CalibratedClassifierCV(rf, method='sigmoid', cv=5)
model.fit(X_train, y_train)


prob = model.predict_proba(X_test)[:, 1]
print("AUC:", roc_auc_score(y_test, prob))


models_dir = os.path.join(BASE_DIR, "models")
os.makedirs(models_dir, exist_ok=True)

joblib.dump(model, os.path.join(models_dir, "credit_model.pkl"))
joblib.dump(scaler, os.path.join(models_dir, "scaler.pkl"))

print("Improved Credit model saved successfully")