import pandas as pd
import joblib
import os

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import roc_auc_score

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
data_path = os.path.join(BASE_DIR, "datasets", "fraud_dataset_100k.csv")

data = pd.read_csv(data_path)


X = data[[
    "income_declared",
    "income_detected",
    "address_mismatch",
    "document_authenticity_score",
    "account_balance_pattern",
    "employment_mismatch",
    "rapid_loan_requests"
]]

y = data["fraud_flag"]

print("Training fraud features:", X.columns)

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Model
rf = RandomForestClassifier(n_estimators=200, max_depth=10, random_state=42)

# ✅ Calibration
model = CalibratedClassifierCV(rf, method='sigmoid', cv=5)
model.fit(X_train, y_train)

# Evaluate
prob = model.predict_proba(X_test)[:, 1]
print("Fraud AUC:", roc_auc_score(y_test, prob))

# Save
models_dir = os.path.join(BASE_DIR, "models")
os.makedirs(models_dir, exist_ok=True)

joblib.dump(model, os.path.join(models_dir, "fraud_model.pkl"))

print("✅ Fraud model saved successfully")