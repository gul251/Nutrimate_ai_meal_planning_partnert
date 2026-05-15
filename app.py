from flask import Flask, request, jsonify, render_template
import joblib
import pandas as pd
from recommender import get_recommendations

app = Flask(__name__)

# =========================
# LOAD ML MODEL
# =========================
try:
    model = joblib.load("meal_model.pkl")
    print("✅ ML Model Loaded")
except:
    model = None
    print("⚠️ ML Model not loaded")


#----meals_db

meals_db = []

@app.route("/add_meal", methods=["POST"])
def add_meal():

    data = request.get_json()

    meal = {
        "id": len(meals_db) + 1,
        "name": data.get("name"),
        "mealType": data.get("mealType"),
        "calories": data.get("calories"),
        "protein": data.get("protein"),
        "cost": data.get("cost"),
        "date": data.get("date")
    }

    meals_db.append(meal)

    return jsonify({
        "success": True,
        "meal": meal
    })


#_______delete_meal

@app.route("/delete_meal/<int:meal_id>", methods=["DELETE"])
def delete_meal(meal_id):

    global meals_db

  
    meals_db = [
        m for m in meals_db
        if m["id"] != meal_id
    ]

    return jsonify({
        "success": True
    })


#-------clear_meals

@app.route("/clear_meals", methods=["DELETE"])
def clear_meals():

    global meals_db

    date = request.args.get("date")

    meals_db = [
        m for m in meals_db
        if m["date"] != date
    ]

    return jsonify({
        "success": True
    })
# =========================
# 🌐 FRONTEND PAGES
# =========================

@app.route("/")
def welcome():
    return render_template("welcome.html")


@app.route("/login")
def login():
    return render_template("login.html")


@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")


@app.route("/createaccount")
def createaccount():
    return render_template("createaccount.html")


@app.route("/about")
def about():
    return render_template("about.html")


@app.route("/contact")
def contact():
    return render_template("contact.html")


@app.route("/faq")
def faq():
    return render_template("faq.html")


@app.route("/howitworks")
def howitworks():
    return render_template("howitworks.html")


@app.route("/privacy")
def privacy():
    return render_template("privacy.html")


@app.route("/terms")
def terms():
    return render_template("terms.html")


# =========================
# 🔥 AI RECOMMENDER API
# =========================
@app.route("/predict", methods=["POST"])
def predict():
    try:

        if model is None:
            return jsonify({
                "success": False,
                "error": "Model not loaded"
            })

        data = request.get_json()

        age = float(data.get("age", 25))
        weight = float(data.get("weight", 70))
        height = float(data.get("height", 170))
        gender = data.get("gender", "male")
        goal = data.get("goal", "maintain")
        disease = data.get("disease", "none")

        # height fix
        height_m = height / 100 if height > 3 else height

        bmi = weight / (height_m ** 2)

        bmi_level = (
            "under" if bmi < 18.5 else
            "normal" if bmi < 25 else
            "over" if bmi < 30 else
            "obese"
        )

        bmi_age = bmi * age

        input_df = pd.DataFrame([{
            "age": age,
            "weight": weight,
            "height": height_m,
            "gender": gender,
            "bmi": bmi,
            "goal": goal,
            "disease": disease,
            "bmi_level": bmi_level,
            "bmi_age": bmi_age
        }])

        prediction = model.predict(input_df)

        # ✅ FIXED: USE REAL USER INPUT
        recommendations = get_recommendations(
            goal=goal,
            disease=disease,
            diet_type=data.get("dietType", "omnivore"),
            meal_time=data.get("meal_time", "morning"),
            use_ai_image=True
        )

        return jsonify({
            "success": True,
            "meal": str(prediction[0]),
            "bmi": round(bmi, 1),
            "bmi_level": bmi_level,
            "recommendations": recommendations
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        })



# =========================
# 🤖 CHAT API
# =========================

@app.route("/chat", methods=["POST"])
def chat():

    data = request.get_json()
    msg = data.get("message", "").lower()

    if "protein" in msg:
        goal = "gain"
    elif "diet" in msg:
        goal = "loss"
    else:
        goal = "maintain"

    result = get_recommendations(
        goal,
        "none",
        "vegan",
        "morning"
    )

    return jsonify({
        "status": "success",
        "data": result
    })


# =========================
# 🍽 GET MEALS API
# =========================
@app.route("/get_meals")
def get_meals():

    date = request.args.get("date")

    filtered = [
        m for m in meals_db
        if m["date"] == date
    ]

    return jsonify(filtered)

# -------dataset_meals
@app.route("/dataset_meals")
def dataset_meals():

    goal = request.args.get("goal", "maintain")
    meal_time = request.args.get("meal_time", "morning")

    df = pd.read_excel("Datasets Nutrimate.xlsx")

    filtered = df[
        (df["goal"] == goal) &
        (df["meal_time"] == meal_time)
    ]

    meals = filtered.sample(min(5, len(filtered)))

    return jsonify(
        meals.to_dict(orient="records")
    )


# =========================
# RUN SERVER
# =========================

if __name__ == "__main__":
    app.run(debug=True)