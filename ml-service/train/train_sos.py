import os
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report


# =========================================================
# PATHS
# =========================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

DATA_PATH = os.path.join(
    BASE_DIR,
    "data",
    "sos_data.csv"
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "models"
)

os.makedirs(MODEL_DIR, exist_ok=True)


# =========================================================
# LOAD DATA
# =========================================================

df = pd.read_csv(DATA_PATH)

print("\nSOS Dataset:")
print(df.head())

print("\nDataset shape:")
print(df.shape)


# =========================================================
# FEATURES
# =========================================================

features = [
    "people_trapped",
    "injured_people",
    "critical_injuries",
    "children_elderly",
    "water_level",
    "building_damage",
    "hours_trapped",
    "communication_available"
]

X = df[features]
y = df["severity"]


# =========================================================
# TRAIN TEST SPLIT
# =========================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


# =========================================================
# MODEL
# =========================================================

model = RandomForestClassifier(
    n_estimators=200,
    max_depth=12,
    random_state=42,
    class_weight="balanced"
)


# =========================================================
# TRAIN
# =========================================================

print("\nTraining SOS severity model...")

model.fit(
    X_train,
    y_train
)


# =========================================================
# PREDICTION
# =========================================================

y_pred = model.predict(X_test)


# =========================================================
# EVALUATION
# =========================================================

accuracy = accuracy_score(
    y_test,
    y_pred
)

print("\n================================")
print("SOS SEVERITY MODEL")
print("================================")

print(
    f"Accuracy: {accuracy:.4f}"
)

print("\nClassification Report:")

print(
    classification_report(
        y_test,
        y_pred
    )
)


# =========================================================
# SAVE MODEL
# =========================================================

model_path = os.path.join(
    MODEL_DIR,
    "sos_model.pkl"
)

joblib.dump(
    model,
    model_path
)

print(
    f"\nModel saved to:\n{model_path}"
)