import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

population_file = (
    BASE_DIR / "data" / "raw" / "ps191_final_village_dataset.csv"
)

coordinates_file = (
    BASE_DIR / "data" / "raw" / "prayagraj_village_coordinates.csv"
)

output_file = (
    BASE_DIR / "data" / "processed" /
    "prayagraj_villages_with_coordinates.csv"
)

population_df = pd.read_csv(population_file)
coordinates_df = pd.read_csv(coordinates_file)

# Keep only the required coordinate columns
coordinates_df = coordinates_df[
    ["village_code", "latitude", "longitude"]
]

# Convert village codes to strings to avoid mismatch
population_df["village_code"] = (
    population_df["village_code"].astype(str).str.strip()
)

coordinates_df["village_code"] = (
    coordinates_df["village_code"].astype(str).str.strip()
)

# Remove duplicate coordinate records
coordinates_df = coordinates_df.drop_duplicates(
    subset=["village_code"]
)

# Merge using village code
merged_df = population_df.merge(
    coordinates_df,
    on="village_code",
    how="left"
)

# Check missing coordinates
missing_coordinates = merged_df[
    merged_df["latitude"].isna() |
    merged_df["longitude"].isna()
]

print("Total villages:", len(merged_df))
print("Villages with coordinates:",
      len(merged_df) - len(missing_coordinates))
print("Villages without coordinates:",
      len(missing_coordinates))

# Save the final dataset
output_file.parent.mkdir(parents=True, exist_ok=True)
merged_df.to_csv(output_file, index=False)

print(f"Saved merged dataset to: {output_file}")