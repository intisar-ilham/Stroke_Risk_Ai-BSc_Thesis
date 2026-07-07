# StrokeRisk AI: Predictive Health Dashboard

![StrokeRisk AI](https://img.shields.io/badge/Status-Active-brightgreen)
![Python](https://img.shields.io/badge/Python-3.9+-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688)
![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.5.2-F7931E)

StrokeRisk AI is a full-stack, clinical-grade predictive intelligence engine. It leverages a trained **Random Forest Machine Learning Model** to assess the risk of stroke in patients based on demographic, lifestyle, and clinical metrics. 

The application features a high-performance **FastAPI backend** for real-time inference and a premium, **glassmorphic Vanilla CSS/JS frontend** for an immersive user experience. It also features **LIME (Local Interpretable Model-agnostic Explanations)** to provide patient-specific interpretability, showing exactly *why* a specific prediction was made.

---

## 🌟 Key Features

- **High-Accuracy Inference**: Uses a highly optimized Random Forest Classifier to predict stroke probability.
- **Explainable AI (XAI)**: Integrates LIME to generate localized feature-weight charts, explaining which patient metrics increased or decreased their stroke risk.
- **Premium UI/UX**: A dark-themed, glassmorphic interface with micro-animations, neon glows, and dynamic Chart.js visualizations.
- **Real-Time Validation**: Client-side form validation ensures data integrity before sending to the prediction engine.
- **Production Ready**: Configured for immediate cloud deployment on platforms like Render.

---

## 🏗️ Architecture

- **Frontend**: HTML5, Vanilla CSS3 (Glassmorphism), Vanilla JavaScript, Chart.js, FontAwesome.
- **Backend**: Python, FastAPI, Uvicorn.
- **Machine Learning**: Scikit-Learn, Pandas, Numpy, Joblib, LIME.

---

## 🚀 How to Run Locally

### 1. Prerequisites
Ensure you have Python installed (3.9 or higher recommended). 

### 2. Install Dependencies
Navigate to the project root directory and install the required packages:
```bash
pip install -r requirements.txt
```

### 3. Start the Server
Run the FastAPI backend using Uvicorn:
```bash
python -m uvicorn backend:app --host 127.0.0.1 --port 8000
```

### 4. Access the Dashboard
Open your web browser and navigate to:
```
http://127.0.0.1:8000
```

---

## ☁️ Deployment (Render)

This repository is pre-configured for deployment on [Render](https://render.com/).

1. Push this repository to GitHub.
2. In your Render Dashboard, create a new **Web Service**.
3. Connect the GitHub repository.
4. Set the build command:
   ```bash
   pip install -r requirements.txt
   ```
5. Set the start command:
   ```bash
   uvicorn backend:app --host 0.0.0.0 --port $PORT
   ```
6. Deploy!

---

## 📊 Dataset & Preprocessing

The model expects the following preprocessing pipeline, which is executed in real-time by the FastAPI server before inference:
- **Numerical Features** (`age`, `avg_glucose_level`, `bmi`): Scaled using `StandardScaler`.
- **Categorical Features** (`gender`, `ever_married`, `work_type`, `Residence_type`, `smoking_status`): Integer-encoded using `LabelEncoder`.
- Missing values in `bmi` are dynamically handled using the training set mean.

*(Note: The `healthcare-dataset-stroke-data.csv` file is included in the repository solely for initializing the LIME explainer baseline distributions).*

---

## 📄 License
This project is created for educational and research purposes. Please consult medical professionals for real-world clinical applications.
