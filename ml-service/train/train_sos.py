import os
import pandas as pd
import joblib

from sklearn.model_selection import (
    train_test_split,
    cross_val_score
)

from sklearn.ensemble import RandomForestClassifier

from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)


# =========================================================
# PATHS
# =========================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
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

os.makedirs(
    MODEL_DIR,
    exist_ok=True
)


# =========================================================
# LOAD DATA
# =========================================================

df = pd.read_csv(DATA_PATH)

print("\n================================")
print("SOS DATASET")
print("================================")

print(df.head())

print("\nDataset shape:")
print(df.shape)


# =========================================================
# CHECK MISSING VALUES
# =========================================================

print("\nMissing values:")

print(
    df.isnull().sum()
)


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
# CLASS DISTRIBUTION
# =========================================================

print("\nSeverity distribution:")

print(
    y.value_counts()
)


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


print("\nTraining samples:")
print(len(X_train))

print("\nTesting samples:")
print(len(X_test))


# =========================================================
# MODEL
# =========================================================

model = RandomForestClassifier(
    n_estimators=500,
    max_depth=None,
    min_samples_split=4,
    min_samples_leaf=2,
    max_features="sqrt",
    class_weight="balanced",
    random_state=42,
    n_jobs=-1
)


# =========================================================
# TRAIN
# =========================================================

print("\n================================")
print("TRAINING SOS MODEL")
print("================================")

model.fit(

    X_train,

    y_train

)

print("Training completed.")


# =========================================================
# PREDICTION
# =========================================================

y_pred = model.predict(

    X_test

)


# =========================================================
# ACCURACY
# =========================================================

accuracy = accuracy_score(

    y_test,

    y_pred

)


print("\n================================")
print("MODEL PERFORMANCE")
print("================================")

print(
    f"Accuracy: {accuracy:.4f}"
)


# =========================================================
# CLASSIFICATION REPORT
# =========================================================

print("\nClassification Report:")

print(

    classification_report(

        y_test,

        y_pred

    )

)


# =========================================================
# CONFUSION MATRIX
# =========================================================

print("\nConfusion Matrix:")

cm = confusion_matrix(

    y_test,

    y_pred

)

print(cm)


# =========================================================
# CROSS VALIDATION
# =========================================================

print("\n================================")
print("CROSS VALIDATION")
print("================================")

cv_scores = cross_val_score(

    model,

    X,

    y,

    cv=5,

    scoring="accuracy"

)

print(
    "CV Scores:",
    cv_scores
)

print(
    f"Mean CV Accuracy: "
    f"{cv_scores.mean():.4f}"
)


# =========================================================
# FEATURE IMPORTANCE
# =========================================================

print("\n================================")
print("FEATURE IMPORTANCE")
print("================================")

importance = pd.DataFrame({

    "feature": features,

    "importance":
        model.feature_importances_

})


importance = importance.sort_values(

    by="importance",

    ascending=False

)


print(

    importance.to_string(
        index=False
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


print("\n================================")
print("MODEL SAVED")
print("================================")

print(

    f"Model saved to:\n{model_path}"

)

print("\nSOS model training completed!")