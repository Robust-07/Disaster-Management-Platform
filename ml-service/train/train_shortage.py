import os
import pandas as pd
import joblib
import numpy as np

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)


BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

DATA_PATH = os.path.join(
    BASE_DIR,
    "data",
    "resource_data.csv"
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "models"
)

os.makedirs(
    MODEL_DIR,
    exist_ok=True
)


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


# =========================================================
# FEATURES
# =========================================================

features = [
    "population",
    "current_stock",
    "daily_consumption",
    "incoming_supply",
    "people_per_unit"
]

X = df[features]

y = df["hours_until_shortage"]


# =========================================================
# TRAIN / TEST SPLIT
# =========================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

print("\nTraining samples:", len(X_train))
print("Testing samples:", len(X_test))


# =========================================================
# MODEL
# =========================================================

model = RandomForestRegressor(
    n_estimators=200,
    max_depth=15,
    random_state=42,
    n_jobs=-1
)


# =========================================================
# TRAIN
# =========================================================

print("\nTraining shortage model...")

model.fit(
    X_train,
    y_train
)


# =========================================================
# PREDICTION
# =========================================================

y_pred = model.predict(
    X_test
)


# =========================================================
# EVALUATION
# =========================================================

mae = mean_absolute_error(
    y_test,
    y_pred
)

rmse = np.sqrt(
    mean_squared_error(
        y_test,
        y_pred
    )
)

r2 = r2_score(
    y_test,
    y_pred
)


print("\n================================")
print("RESOURCE SHORTAGE MODEL")
print("================================")

print(
    f"MAE : {mae:.2f} hours"
)

print(
    f"RMSE: {rmse:.2f} hours"
)

print(
    f"R²  : {r2:.4f}"
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
    scoring="r2"
)

print(
    "Cross Validation R² Scores:",
    cv_scores
)

print(
    f"Average CV R²: {cv_scores.mean():.4f}"
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

print(
    feature_importance
)


# =========================================================
# SAVE MODEL
# =========================================================

model_path = os.path.join(
    MODEL_DIR,
    "shortage_model.pkl"
)

joblib.dump(
    model,
    model_path
)

print(
    f"\nModel saved to:\n{model_path}"
)