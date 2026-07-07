// Application State
let currentPatientData = null;
let probabilityChartInstance = null;
let explanationChartInstance = null;

// DOM Elements
const patientForm = document.getElementById('patient-form');
const submitBtn = document.getElementById('submit-btn');
const emptyState = document.getElementById('results-empty-state');
const loadingState = document.getElementById('results-loading-state');
const contentState = document.getElementById('results-content-state');
const modelCardsContainer = document.getElementById('model-cards-container');
const limeLoading = document.getElementById('explainer-loading');

const toggleLimeBtn = document.getElementById('toggle-lime');
const toggleShapBtn = document.getElementById('toggle-shap');
const limeContainer = document.getElementById('lime-container');
const shapContainer = document.getElementById('shap-container');
let shapChartInstance = null;

// Setup form validation listeners
const inputs = patientForm.querySelectorAll('input[required], select[required]');
inputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
        if (input.parentElement.classList.contains('error')) {
            validateField(input);
        }
    });
});

// Field Validation Logic
function validateField(input) {
    const parent = input.parentElement;
    let isValid = true;

    if (input.type === 'number') {
        const val = parseFloat(input.value);
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);
        
        if (isNaN(val) || val < min || val > max) {
            isValid = false;
        }
    } else {
        if (!input.value) {
            isValid = false;
        }
    }

    if (isValid) {
        parent.classList.remove('error');
    } else {
        parent.classList.add('error');
    }

    return isValid;
}

// Full Form Validation
function validateForm() {
    let isFormValid = true;
    inputs.forEach(input => {
        if (!validateField(input)) {
            isFormValid = false;
        }
    });
    return isFormValid;
}

// Helper to calculate risk level class
function getRiskLevel(probability) {
    if (probability < 0.10) return { label: 'Low', class: 'low' };
    if (probability <= 0.30) return { label: 'Moderate', class: 'mod' };
    return { label: 'High', class: 'high' };
}

// Handle Form Submission
patientForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm()) {
        // Scroll to first error
        const firstError = patientForm.querySelector('.input-field.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }

    // Gather form data
    const formData = new FormData(patientForm);
    const ageVal = parseFloat(formData.get('age'));
    const glucoseVal = parseFloat(formData.get('avg_glucose_level'));
    const bmiVal = parseFloat(formData.get('bmi'));
    const genderVal = formData.get('gender');
    const everMarriedVal = formData.get('ever_married');
    const workTypeVal = formData.get('work_type');
    const residenceTypeVal = formData.get('Residence_type');
    const smokingStatusVal = formData.get('smoking_status');
    const hypertensionVal = parseInt(formData.get('hypertension') || '0');
    const heartDiseaseVal = parseInt(formData.get('heart_disease') || '0');

    currentPatientData = {
        gender: genderVal,
        age: ageVal,
        hypertension: hypertensionVal,
        heart_disease: heartDiseaseVal,
        ever_married: everMarriedVal,
        work_type: workTypeVal,
        Residence_type: residenceTypeVal,
        avg_glucose_level: glucoseVal,
        bmi: bmiVal,
        smoking_status: smokingStatusVal
    };

    // Transition to loading state
    emptyState.classList.add('hidden');
    contentState.classList.add('hidden');
    loadingState.classList.remove('hidden');

    try {
        const response = await fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(currentPatientData)
        });

        if (!response.ok) {
            throw new Error(`Server returned error: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.status === 'success') {
            displayResults(data.predictions);
        } else {
            throw new Error(data.message || 'Unknown server error');
        }

    } catch (error) {
        console.error("Prediction failed:", error);
        alert(`Prediction Error: ${error.message}. Make sure the backend server is running.`);
        loadingState.classList.add('hidden');
        emptyState.classList.remove('hidden');
    }
});

// Render Predictions & Charts
function displayResults(predictions) {
    loadingState.classList.add('hidden');
    contentState.classList.remove('hidden');

    modelCardsContainer.innerHTML = '';

    const modelNames = Object.keys(predictions);
    
    modelNames.forEach(name => {
        const pred = predictions[name];
        const probPct = pred.probability * 100;
        const risk = getRiskLevel(pred.probability);
        
        // Create card element
        const cardHtml = `
            <div class="model-item-card" style="width: 100%; max-width: 600px; margin: 0 auto;">
                <div class="model-card-header">
                    <span class="model-name">${name}</span>
                    <span class="model-badge ${risk.class}">${risk.label} Risk</span>
                </div>
                <div class="model-prob-row">
                    <span class="model-prob-num">${probPct.toFixed(1)}%</span>
                    <span class="model-prob-label">stroke probability</span>
                </div>
                <div class="model-progress-bg">
                    <div class="model-progress-fill ${risk.class}" style="width: ${probPct}%"></div>
                </div>
            </div>
        `;
        modelCardsContainer.insertAdjacentHTML('beforeend', cardHtml);
    });

    // Load LIME explanation
    loadLimeExplanation(currentPatientData);
}



// Load Explanations from API
async function loadLimeExplanation(patientData) {
    limeLoading.classList.remove('hidden');
    limeContainer.classList.add('hidden');
    shapContainer.classList.add('hidden');

    try {
        const response = await fetch(`/explain`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(patientData)
        });

        if (!response.ok) {
            throw new Error(`Server returned error: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.status === 'success') {
            limeLoading.classList.add('hidden');
            
            // Show the currently active tab
            if (toggleLimeBtn.classList.contains('active')) {
                limeContainer.classList.remove('hidden');
            } else {
                shapContainer.classList.remove('hidden');
            }
            
            renderExplanationChart(data.lime_explanations, 'limeChart', 'LIME Weight');
            renderExplanationChart(data.shap_explanations, 'shapChart', 'SHAP Value');
        } else {
            throw new Error(data.message || 'Explanation calculation failed.');
        }
    } catch (error) {
        console.error("Explanation load failed:", error);
        limeLoading.classList.add('hidden');
        limeContainer.classList.remove('hidden');
        
        // Show error message placeholder in chart
        const ctx = document.getElementById('limeChart').getContext('2d');
        if (explanationChartInstance) explanationChartInstance.destroy();
        
        ctx.clearRect(0, 0, 400, 320);
        ctx.fillStyle = '#f87171';
        ctx.font = '14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText("Failed to load explanation.", 200, 150);
    }
}

// Toggle Listeners
toggleLimeBtn.addEventListener('click', () => {
    toggleLimeBtn.classList.add('active');
    toggleShapBtn.classList.remove('active');
    limeContainer.classList.remove('hidden');
    shapContainer.classList.add('hidden');
});

toggleShapBtn.addEventListener('click', () => {
    toggleShapBtn.classList.add('active');
    toggleLimeBtn.classList.remove('active');
    shapContainer.classList.remove('hidden');
    limeContainer.classList.add('hidden');
});

// Render Chart function (handles both LIME and SHAP)
function renderExplanationChart(explanations, canvasId, xAxisLabel) {
    let currentInstance = canvasId === 'limeChart' ? explanationChartInstance : shapChartInstance;
    
    if (currentInstance) {
        currentInstance.destroy();
    }

    // Sort explanations by absolute weight so most important features are at the top
    const sortedExplanations = [...explanations].sort((a, b) => Math.abs(a.weight) - Math.abs(b.weight));

    const labels = sortedExplanations.map(e => e.description || e.feature);
    const weights = sortedExplanations.map(e => e.weight);
    
    // Assign color: red for positive weights (increases risk), green for negative weights (decreases risk)
    const backgroundColors = weights.map(w => w > 0 ? 'rgba(248, 113, 113, 0.75)' : 'rgba(52, 211, 153, 0.75)');
    const borderColors = weights.map(w => w > 0 ? 'rgba(248, 113, 113, 1.0)' : 'rgba(52, 211, 153, 1.0)');

    const ctx = document.getElementById(canvasId).getContext('2d');
    
    const newChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: weights,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1,
                borderRadius: 4,
                barPercentage: 0.7
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const direction = context.parsed.x > 0 ? "Increases risk" : "Decreases risk";
                            return ` Weight: ${context.parsed.x.toFixed(4)} (${direction})`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#9ca3af',
                        font: {
                            family: 'Inter'
                        }
                    },
                    title: {
                        display: true,
                        text: `Feature Influence (${xAxisLabel})`,
                        color: '#9ca3af',
                        font: {
                            family: 'Inter',
                            size: 11
                        }
                    }
                },
                y: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#f3f4f6',
                        font: {
                            family: 'Inter',
                            size: 11
                        }
                    }
                }
            }
        }
    });
    
    if (canvasId === 'limeChart') {
        explanationChartInstance = newChart;
    } else {
        shapChartInstance = newChart;
    }
}
