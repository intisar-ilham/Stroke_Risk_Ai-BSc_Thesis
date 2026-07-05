import os
import joblib
import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler

# Paths
dataset_path = r"C:\Users\intis\Desktop\Thesis\healthcare-dataset-stroke-data.csv"
models_dir = r"c:\Users\intis\Desktop\New folder\Models"

# Ensure models directory exists
os.makedirs(models_dir, exist_ok=True)

# Load dataset
print("Loading dataset...")
df = pd.read_csv(dataset_path)

# Fill BMI missing values with mean
bmi_mean = df['bmi'].mean()
df['bmi'] = df['bmi'].fillna(bmi_mean)
print(f"Filled missing BMI values with mean: {bmi_mean:.4f}")

# Categorical and numerical columns
categorical_cols = ['gender', 'ever_married', 'work_type', 'Residence_type', 'smoking_status']
numerical_cols = ['age', 'avg_glucose_level', 'bmi']

# Label Encoders
label_encoders = {}
for col in categorical_cols:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    label_encoders[col] = le
    print(f"Fitted LabelEncoder for '{col}': {list(le.classes_)}")

# StandardScaler (only for numerical columns)
scaler = StandardScaler()
scaler.fit(df[numerical_cols])
print(f"Fitted StandardScaler for numerical columns. Mean: {scaler.mean_}, Var: {scaler.var_}")

# Save label encoders and scaler
le_path = os.path.join(models_dir, "label_encoders.pkl")
scaler_path = os.path.join(models_dir, "scaler.pkl")

joblib.dump(label_encoders, le_path)
joblib.dump(scaler, scaler_path)

print("Saved preprocessor objects successfully:")
print(f"  Label Encoders -> {le_path}")
print(f"  Scaler         -> {scaler_path}")
