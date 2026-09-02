import os
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix
)


BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

DATA_PATH = os.path.join(
    BASE_DIR,
    "data",
    "disaster_data.csv"
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

print("\nDataset:")
print(df.head())

print("\nDataset shape:")
print(df.shape)

print("\nMissing values:")
print(df.isnull().sum())

print("\nRisk distribution:")
print(df["risk"].value_counts())


# =========================================================
# FEATURES AND TARGET
# =========================================================

features = [
    "rainfall",
    "river_level",
    "humidity",
    "temperature",
    "previous_floods"
]

X = df[features]
y = df["risk"]


# =========================================================
# TRAIN / TEST SPLIT
# =========================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


print("\nTraining samples:", len(X_train))
print("Testing samples:", len(X_test))


# =========================================================
# MODEL
# =========================================================

model = RandomForestClassifier(
    n_estimators=200,
    max_depth=12,
    random_state=42,
    class_weight="balanced",
    n_jobs=-1
)


# =========================================================
# TRAIN
# =========================================================

print("\nTraining disaster model...")

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

precision = precision_score(
    y_test,
    y_pred,
    average="weighted",
    zero_division=0
)

recall = recall_score(
    y_test,
    y_pred,
    average="weighted",
    zero_division=0
)

f1 = f1_score(
    y_test,
    y_pred,
    average="weighted",
    zero_division=0
)


print("\n================================")
print("DISASTER MODEL RESULTS")
print("================================")

print(
    f"Accuracy : {accuracy:.4f}"
)

print(
    f"Precision: {precision:.4f}"
)

print(
    f"Recall   : {recall:.4f}"
)

print(
    f"F1 Score : {f1:.4f}"
)


print("\nClassification Report:")

print(
    classification_report(
        y_test,
        y_pred,
        zero_division=0
    )
)


print("\nConfusion Matrix:")

print(
    confusion_matrix(
        y_test,
        y_pred
    )
)


# =========================================================
# CROSS VALIDATION
# =========================================================

print("\nRunning 5-Fold Cross Validation...")

cv_scores = cross_val_score(
    model,
    X,
    y,
    cv=5,
    scoring="f1_weighted"
)

print(
    "Cross Validation F1 Scores:",
    cv_scores
)

print(
    f"Average CV F1: {cv_scores.mean():.4f}"
)


# =========================================================
# FEATURE IMPORTANCE
# =========================================================

print("\nFeature Importance:")

feature_importance = pd.DataFrame({
    "feature": features,
    "importance": model.feature_importances_
})

feature_importance = feature_importance.sort_values(
    by="importance",
    ascending=False
)

print(feature_importance)


# =========================================================
# SAVE MODEL
# =========================================================

model_path = os.path.join(
    MODEL_DIR,
    "disaster_model.pkl"
)

joblib.dump(
    model,
    model_path
)

print(
    f"\nModel saved to:\n{model_path}"
)