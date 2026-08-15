import os
import numpy as np
import pandas as pd

np.random.seed(42)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")

os.makedirs(DATA_DIR, exist_ok=True)


# =========================================================
# DISASTER DATASET
# =========================================================

n = 5000

rainfall = np.random.uniform(0, 400, n)
river_level = np.random.uniform(1, 10, n)
humidity = np.random.uniform(30, 100, n)
temperature = np.random.uniform(15, 45, n)
previous_floods = np.random.randint(0, 6, n)

# Calculate a synthetic risk score
risk_score = (
    rainfall * 0.35
    + river_level * 7
    + humidity * 0.15
    + previous_floods * 8
)

# Add randomness
risk_score += np.random.normal(0, 10, n)

# Convert score into classes
risk = []

for score in risk_score:

    if score < 70:
        risk.append("LOW")

    elif score < 120:
        risk.append("MEDIUM")

    else:
        risk.append("HIGH")


disaster_df = pd.DataFrame({
    "rainfall": rainfall,
    "river_level": river_level,
    "humidity": humidity,
    "temperature": temperature,
    "previous_floods": previous_floods,
    "risk": risk
})

disaster_path = os.path.join(DATA_DIR, "disaster_data.csv")

disaster_df.to_csv(disaster_path, index=False)


# =========================================================
# RESOURCE SHORTAGE DATASET
# =========================================================

n = 5000

population = np.random.randint(500, 20000, n)

current_stock = np.random.uniform(
    500,
    50000,
    n
)

daily_consumption = np.random.uniform(
    100,
    10000,
    n
)

incoming_supply = np.random.uniform(
    0,
    20000,
    n
)

people_per_unit = np.random.uniform(
    0.5,
    3,
    n
)

# Consumption per hour
hourly_consumption = daily_consumption / 24

# Effective stock after incoming supply
effective_stock = current_stock + incoming_supply

# Theoretical hours until shortage
hours_until_shortage = (
    effective_stock / hourly_consumption
)

# Add realistic noise
hours_until_shortage += np.random.normal(
    0,
    3,
    n
)

# Prevent negative values
hours_until_shortage = np.maximum(
    hours_until_shortage,
    0
)

resource_df = pd.DataFrame({
    "population": population,
    "current_stock": current_stock,
    "daily_consumption": daily_consumption,
    "incoming_supply": incoming_supply,
    "people_per_unit": people_per_unit,
    "hours_until_shortage": hours_until_shortage
})

resource_path = os.path.join(DATA_DIR, "resource_data.csv")

resource_df.to_csv(
    resource_path,
    index=False
)


print("Datasets generated successfully!")

print(f"\nDisaster dataset:")
print(disaster_path)

print(f"\nResource dataset:")
print(resource_path)


# =========================================================
# SOS SEVERITY DATASET
# =========================================================

n = 5000

people_trapped = np.random.randint(1, 20, n)

injured_people = np.random.randint(
    0,
    people_trapped + 1
)

critical_injuries = np.array([
    np.random.randint(0, injured + 1)
    for injured in injured_people
])

children_elderly = np.random.randint(
    0,
    10,
    n
)

water_level = np.random.uniform(
    0,
    10,
    n
)

building_damage = np.random.randint(
    0,
    6,
    n
)

hours_trapped = np.random.uniform(
    0,
    24,
    n
)

communication_available = np.random.randint(
    0,
    2,
    n
)


# =========================================================
# CALCULATE SYNTHETIC SEVERITY SCORE
# =========================================================

severity_score = (
    people_trapped * 3
    + injured_people * 7
    + critical_injuries * 12
    + children_elderly * 4
    + water_level * 5
    + building_damage * 8
    + hours_trapped * 2
    + (1 - communication_available) * 10
)


# Add randomness
severity_score += np.random.normal(
    0,
    8,
    n
)


# Keep score between 0 and 100
severity_score = np.clip(
    severity_score,
    0,
    100
)


# =========================================================
# CONVERT SCORE TO SEVERITY
# =========================================================

severity = []

for score in severity_score:

    if score < 25:
        severity.append("LOW")

    elif score < 50:
        severity.append("MEDIUM")

    elif score < 75:
        severity.append("HIGH")

    else:
        severity.append("CRITICAL")


# =========================================================
# CREATE DATAFRAME
# =========================================================

sos_df = pd.DataFrame({

    "people_trapped":
        people_trapped,

    "injured_people":
        injured_people,

    "critical_injuries":
        critical_injuries,

    "children_elderly":
        children_elderly,

    "water_level":
        water_level,

    "building_damage":
        building_damage,

    "hours_trapped":
        hours_trapped,

    "communication_available":
        communication_available,

    "severity_score":
        severity_score,

    "severity":
        severity
})


# =========================================================
# SAVE SOS DATASET
# =========================================================

sos_path = os.path.join(
    DATA_DIR,
    "sos_data.csv"
)

sos_df.to_csv(
    sos_path,
    index=False
)

print("\nSOS dataset:")
print(sos_path)