from flask import Flask, render_template, request, jsonify
import joblib
import pandas as pd

app = Flask(__name__)

# ================= MODEL =================
try:
    model = joblib.load("model.pkl")
    print("✅ Model loaded successfully")
except Exception as e:
    model = None
    print("❌ Model failed to load:", e)


# ================= ROUTES =================

@app.route('/')
def dashboard():
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


# ✅ FIXED LOGOUT
@app.route('/logout')
def logout():
    return render_template('welcome.html')


@app.route('/welcome')
def welcome():
    return render_template('welcome.html')


# ✅ ADD THIS (IMPORTANT - tumhara error fix)
@app.route('/createaccount')
def createaccount():
    return render_template('createaccount.html')


@app.route('/privacy')
def privacy():
    return render_template('privacy.html')


@app.route('/terms')
def terms():
    return render_template('terms.html')


@app.route('/home')
def home():
    return render_template('dashboard.html')


# ================= ML API =================

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if model is None:
            return jsonify({"success": False, "error": "Model not loaded"})

        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No input data received"})

        age = float(data.get('age', 25))
        weight = float(data.get('weight', 70))
        height = float(data.get('height', 170))
        goal = data.get('goal', 'maintain')
        activity = data.get('activity', 'moderate')
        disease = data.get('disease', 'none')

        if height > 3:
            height = height / 100

        bmi = weight / (height ** 2)

        input_df = pd.DataFrame([{
            "age": age,
            "weight": weight,
            "height": height,
            "bmi": bmi,
            "goal": goal,
            "activity": activity,
            "disease": disease
        }])

        prediction = model.predict(input_df)

        return jsonify({
            "success": True,
            "meal": str(prediction[0])
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)})


if __name__ == "__main__":
    app.run(debug=True)