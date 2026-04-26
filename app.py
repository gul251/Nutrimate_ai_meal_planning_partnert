from flask import Flask, render_template, request, jsonify
import joblib
import pandas as pd

app = Flask(__name__)

# ================= MODEL =================
try:
    model = joblib.load("meal_model.pkl")  # Fixed: was "model.pkl"
    print("✅ Model loaded successfully")
except Exception as e:
    model = None
    print("❌ Model failed to load:", e)


# ================= ROUTES =================

@app.route('/')
def welcome():
    return render_template('welcome.html')

@app.route('/welcome')
def welcome_page():
    return render_template('welcome.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/home')
def home():
    return render_template('dashboard.html')

@app.route('/howitworks')
def howitworks():
    return render_template('howitworks.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/faq')
def faq():
    return render_template('faq.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/logout')
def logout():
    return render_template('welcome.html')

@app.route('/createaccount')
def createaccount():
    return render_template('createaccount.html')

@app.route('/privacy')
def privacy():
    return render_template('privacy.html')

@app.route('/terms')
def terms():
    return render_template('terms.html')


# ================= ML API =================

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if model is None:
            return jsonify({"success": False, "error": "Model not loaded. Run main.py first to train."})

        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No input data received"})

        age      = float(data.get('age', 25))
        weight   = float(data.get('weight', 70))
        height   = float(data.get('height', 170))
        gender   = str(data.get('gender', 'male')).lower()
        goal     = str(data.get('goal', 'maintain')).lower()
        activity = str(data.get('activity', 'moderate')).lower()
        disease  = str(data.get('disease', 'none')).lower()

        # Frontend sends cm — convert to meters
        if height > 3:
            height_m = height / 100
        else:
            height_m = height

        bmi = weight / (height_m ** 2)

        # BMI level — matches training pd.cut bins exactly
        if bmi < 18.5:
            bmi_level = 'under'
        elif bmi < 25:
            bmi_level = 'normal'
        elif bmi < 30:
            bmi_level = 'over'
        else:
            bmi_level = 'obese'

        bmi_age = bmi * age

        # All 9 features matching training schema
        input_df = pd.DataFrame([{
            "age":       age,
            "weight":    weight,
            "height":    height_m,
            "gender":    gender,
            "bmi":       bmi,
            "goal":      goal,
            "disease":   disease,
            "bmi_level": bmi_level,
            "bmi_age":   bmi_age
        }])

        prediction = model.predict(input_df)

        return jsonify({
            "success":   True,
            "meal":      str(prediction[0]),
            "bmi":       round(bmi, 1),
            "bmi_level": bmi_level
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)})


if __name__ == "__main__":
    app.run(debug=True)
