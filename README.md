# 🧠 StrokeRisk AI — BSc Thesis Deployment

> A machine learning-powered web application for stroke risk prediction with real-time explainability through SHAP and LIME. Built as part of a Bachelor of Science thesis at **Daffodil International University**.

---

## 📌 Overview

**StrokeRisk AI** is a clinical decision support tool that predicts a patient's stroke risk based on demographic, clinical, and lifestyle data. It goes beyond simple prediction by providing transparent, interpretable explanations through two leading Explainable AI techniques — **SHAP** and **LIME** — helping clinicians understand *why* a prediction was made, not just *what* it is.

---

## 🖥️ Interface Preview

| Patient Profile Entry | Risk Analytics Summary |
|---|---|
| Input demographics, clinical metrics, and lifestyle data | View stroke probability, risk level, and AI interpretability charts |

The application features a clean two-panel dark-themed interface:
- **Left Panel** — Patient Profile Entry with demographics, clinical metrics, and lifestyle inputs
- **Right Panel** — Risk Analytics Summary with stroke probability, risk level badge, and SHAP/LIME toggle charts

---

## ✨ Features

- 🔮 **Real-time stroke risk prediction** using a trained Random Forest model
- 📊 **SHAP explanations** — Global feature importance across all predictions
- 🔍 **LIME explanations** — Local instance-level feature influence for individual patients
- 🔄 **SHAP vs LIME toggle** — Switch between explanation methods instantly
- 🏥 **Clinical-grade UI** — Designed for healthcare professional use
- ⚡ **Instant predictions** — Fast results with feature influence visualization
- 🎯 **Risk Level Badge** — Clear HIGH RISK / LOW RISK classification

---

## 🧪 Model Performance

| Model | Accuracy | Precision | Recall | F1-Score | ROC-AUC |
|---|---|---|---|---|---|
| Logistic Regression | 0.7953 | 0.7778 | 0.8244 | 0.8004 | 0.8578 |
| SVM | 0.8369 | 0.7956 | 0.9050 | 0.8468 | 0.8969 |
| XGBoost | 0.9378 | 0.9248 | 0.9525 | 0.9384 | 0.9872 |
| **Random Forest** ✅ | **0.9398** | **0.9119** | **0.9731** | **0.9415** | **0.9876** |

> Random Forest was selected as the final model due to its superior recall (97.31%) — the most critical metric in clinical stroke detection.

---

## 📂 Dataset

| Property | Details |
|---|---|
| Source | Healthcare Dataset Stroke Data — Kaggle |
| Total Records | 5,110 patient records |
| Features | 11 clinical and demographic variables |
| Target Variable | Stroke occurrence (0 = No, 1 = Yes) |
| Class Imbalance | 1:19 (stroke vs non-stroke) |
| Imbalance Handling | SMOTE applied — balanced to 1:1 |

---

## 🔬 XAI Methods

### SHAP (SHapley Additive exPlanations)
- Grounded in cooperative game theory
- Provides globally consistent and mathematically sound feature importance
- Shows how each feature contributes toward or against the stroke prediction
- Used for population-level global insights

### LIME (Local Interpretable Model-agnostic Explanations)
- Builds a simple local surrogate model around each individual prediction
- Provides instance-level feature influence for specific patients
- Ideal for explaining individual patient predictions to clinicians
- Used for patient-level local insights

---

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| Backend | Python, Flask |
| ML Models | Scikit-learn, XGBoost |
| XAI | SHAP, LIME |
| Class Imbalance | Imbalanced-learn (SMOTE) |
| Feature Selection | Chi-Square Test, Correlation Matrix |
| Frontend | HTML, CSS, JavaScript |
| Visualization | Matplotlib, Plotly |

---

## 🚀 Getting Started

**1. Clone the repository**
```bash
git clone https://github.com/yourusername/strokerisk-ai.git
cd strokerisk-ai
```

**2. Install dependencies**
```bash
pip install -r requirements.txt
```

**3. Run the application**
```bash
python app.py
```

**4. Open in your browser**
```
http://127.0.0.1:8000
```

---

## 📁 Project Structure

```
strokerisk-ai/
│
├── Models/
│   ├── label_encoders.pkl        # Label encoders for categorical features
│   ├── random_forest_model.pkl   # Trained Random Forest model
│   └── scaler.pkl                # StandardScaler for feature normalization
│
├── Screenshots/                  # Application screenshots
│
├── static/
│   ├── index.css                 # Application styling
│   ├── index.html                # Main UI template
│   └── main.js                   # Frontend JavaScript logic
│
├── .gitignore
├── README.md
├── backend.py                    # Flask application entry point
├── fit_preprocessors.py          # Preprocessing pipeline script
├── healthcare-dataset-stroke-data.csv  # Dataset
└── requirements.txt              # Python dependencies
```

---

## 📊 How It Works

```
Patient Input
     ↓
Preprocessing (Encoding + Scaling)
     ↓
Random Forest Model
     ↓
Stroke Risk Prediction (Probability + Risk Level)
     ↓
SHAP & LIME Explanation Generation
     ↓
Visual Feature Influence Display
```

---

## 🔑 Key Research Findings

- **Random Forest** achieved the best overall performance with **93.98% accuracy** and **97.31% recall**
- **Age** was identified as the most dominant stroke risk predictor by both SHAP and LIME
- **BMI** and **Average Glucose Level** followed as the second and third most influential features
- **SHAP** is better suited for global population-level insights
- **LIME** provides more meaningful individual patient-level explanations
- Both methods together offer a more complete and clinically trustworthy picture of stroke risk prediction
- **Hypertension** and **Heart Disease** were underrepresented in SHAP's global rankings despite their clinical significance — a key finding of this study

---

## 👨‍🎓 Research Context

This application was developed as part of a BSc thesis:

| Field | Details |
|---|---|
| Title | Machine Learning-Based Stroke Risk Prediction with Explainable AI: A Comparative Analysis of SHAP and LIME |
| Author | Intisar Ilham  |
| Institution | Daffodil International University |
| Department | Software Engineering (Major in Data Science) |
| Year | 2026 |
| Supervisor | Dr. Md. Fazla Elahe |
| Position | Assistant Professor & Associate Head, Dept. of SWE, DIU |


---

