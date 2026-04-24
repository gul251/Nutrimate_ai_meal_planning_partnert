from flask import Flask, render_template, request
import joblib
import pandas as pd

app = Flask(__name__)

# Load trained pipeline model
model = joblib.load('model.pkl')

@app.route('/')
def home():
    return render_template('index.html')


@app.route('/predict', methods=['POST'])
def predict():

    # =========================
    # INPUT (KEEP RAW STRINGS)
    # =========================
    age = float(request.form['age'])
    weight = float(request.form['weight'])
    height = float(request.form['height'])
    gender = request.form['gender']      # keep string
    goal = request.form['goal']          # keep string
    disease = request.form['disease']    # keep string

    # =========================
    # FEATURE ENGINEERING
    # =========================
    bmi = weight / (height ** 2)

    # =========================
    # INPUT DATAFRAME (MATCH TRAINING FEATURES)
    # =========================
    input_data = pd.DataFrame([{
        'age': age,
        'weight': weight,
        'height': height,
        'gender': gender,
        'bmi': bmi,
        'goal': goal,
        'disease': disease,
        'bmi_level': "normal",   # safe default
        'bmi_age': bmi * age
    }])

    # =========================
    # PREDICT
    # =========================
    prediction = model.predict(input_data)

    return f"🍽 Recommended Meal ID: {prediction[0]}"


if __name__ == '__main__':
    app.run(debug=True)