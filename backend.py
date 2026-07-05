import os
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from lime.lime_tabular import LimeTabularExplainer

app = FastAPI(title="Stroke Prediction Full-Stack API")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables to store loaded models and preprocessors
rf_model = None
scaler = None
label_encoders = {}
lime_explainer = None
features_cols = ['gender', 'age', 'hypertension', 'heart_disease', 'ever_married', 
                 'work_type', 'Residence_type', 'avg_glucose_level', 'bmi', 'smoking_status']

# Pydantic schema for patient input data
class PatientInput(BaseModel):
    gender: str = Field(..., description="Male, Female, or Other")
    age: float = Field(..., description="Age in years (e.g. 67.0)")
    hypertension: int = Field(..., description="0 for No, 1 for Yes")
    heart_disease: int = Field(..., description="0 for No, 1 for Yes")
    ever_married: str = Field(..., description="Yes or No")
    work_type: str = Field(..., description="Govt_job, Never_worked, Private, Self-employed, or children")
    Residence_type: str = Field(..., description="Urban or Rural")
    avg_glucose_level: float = Field(..., description="Average blood glucose level")
    bmi: float = Field(..., description="Body Mass Index")
    smoking_status: str = Field(..., description="formerly smoked, never smoked, smokes, or Unknown")

# Preprocessing helper function
def preprocess_input(input_data: PatientInput) -> pd.DataFrame:
    # Convert input data to dictionary
    data_dict = input_data.model_dump()
    
    # Check categorical categories and encode
    for col, le in label_encoders.items():
        val = data_dict[col]
        # Robust handling of categories not seen in training
        if val not in le.classes_:
            # Default to the first category if unknown
            data_dict[col] = le.transform([le.classes_[0]])[0]
        else:
            data_dict[col] = le.transform([val])[0]
            
    # Form a DataFrame with correct feature names and order
    df_raw = pd.DataFrame([data_dict])[features_cols]
    
    # Scale numerical columns
    df_proc = df_raw.copy()
    num_cols = ['age', 'avg_glucose_level', 'bmi']
    df_proc[num_cols] = scaler.transform(df_raw[num_cols])
    
    return df_proc

@app.on_event("startup")
def startup_event():
    global scaler, label_encoders, lime_explainer, rf_model
    models_dir = r"c:\Users\intis\Desktop\New folder\Models"
    
    print("Loading preprocessors and models...")
    try:
        # Load preprocessor files
        scaler = joblib.load(os.path.join(models_dir, "scaler.pkl"))
        label_encoders = joblib.load(os.path.join(models_dir, "label_encoders.pkl"))
        
        # Load ML models
        rf_model = joblib.load(os.path.join(models_dir, "random_forest_model.pkl"))
        print("Model loaded successfully.")
    except Exception as e:
        print(f"Error loading models: {e}")
        raise RuntimeError(f"Startup failed to load models: {e}")
        
    # Reconstruct preprocessed training set for LIME
    try:
        dataset_path = r"C:\Users\intis\Desktop\Thesis\healthcare-dataset-stroke-data.csv"
        if not os.path.exists(dataset_path):
            dataset_path = r"C:\Users\intis\Downloads\healthcare-dataset-stroke-data.csv"
            
        print(f"Reading dataset for LIME initialization from {dataset_path}...")
        df_train = pd.read_csv(dataset_path)
        df_train['bmi'] = df_train['bmi'].fillna(df_train['bmi'].mean())
        
        for col, le in label_encoders.items():
            df_train[col] = le.transform(df_train[col])
            
        X_train = df_train[features_cols]
        X_train_proc = X_train.copy()
        X_train_proc[['age', 'avg_glucose_level', 'bmi']] = scaler.transform(X_train[['age', 'avg_glucose_level', 'bmi']])
        
        # Initialize LimeTabularExplainer
        lime_explainer = LimeTabularExplainer(
            training_data=X_train_proc.values,
            feature_names=features_cols,
            class_names=['No Stroke', 'Stroke'],
            categorical_features=[0, 2, 3, 4, 5, 6, 9], # indices of cat features
            mode='classification',
            random_state=42
        )
        print("LIME Explainer initialized successfully.")
    except Exception as e:
        print(f"Error initializing LIME: {e}")
        print("LIME explanations will not be available.")

@app.post("/predict")
def predict_stroke(patient: PatientInput):
    try:
        # Preprocess input data
        df_proc = preprocess_input(patient)
        
        results = {}
        
        # Get prediction class and probability
        pred_class = int(rf_model.predict(df_proc)[0])
        pred_prob = float(rf_model.predict_proba(df_proc)[0][1])
        
        results["Random Forest"] = {
            "prediction": "Stroke" if pred_class == 1 else "No Stroke",
            "prediction_label": pred_class,
            "probability": pred_prob
        }
            
        return {
            "status": "success",
            "predictions": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/explain")
def explain_prediction(patient: PatientInput):
    if lime_explainer is None:
        raise HTTPException(status_code=503, detail="LIME Explainer is not initialized.")
        
    try:
        # Preprocess input data
        df_proc = preprocess_input(patient)
        target_model = rf_model
        
        # Run LIME explanation
        exp = lime_explainer.explain_instance(
            data_row=df_proc.values[0],
            predict_fn=target_model.predict_proba,
            num_features=10
        )
        
        # Format the LIME output
        explanation_list = exp.as_list()
        formatted_explanations = []
        for condition, weight in explanation_list:
            # Parse the condition to get the base feature name
            base_feature = None
            for col in features_cols:
                if col in condition:
                    base_feature = col
                    break
            
            formatted_explanations.append({
                "feature": base_feature or condition,
                "description": condition,
                "weight": float(weight),
                "influence": "Positive (Increases risk)" if weight > 0 else "Negative (Decreases risk)"
            })
            
        return {
            "status": "success",
            "model_name": "Random Forest",
            "explanations": formatted_explanations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Explainability error: {str(e)}")

# Mount the static files directory at the root or /static
# We will create the static directory in the next task
app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    # Start server locally on port 8000
    uvicorn.run("backend:app", host="127.0.0.1", port=8000, reload=True)
