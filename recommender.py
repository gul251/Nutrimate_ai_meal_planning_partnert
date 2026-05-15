import os

# =========================
# ⚙️ PERFORMANCE FIX (IMPORTANT)
# =========================
os.environ["OMP_NUM_THREADS"] = "2"
os.environ["OPENBLAS_NUM_THREADS"] = "2"
os.environ["MKL_NUM_THREADS"] = "2"

from image_generator import generate_image
import pandas as pd
import numpy as np


# =========================
# 📦 LOAD DATASET (ROBUST)
# =========================
def load_dataset(path):

    df = pd.read_excel(path)

    # normalize columns
    df.columns = (
        df.columns.astype(str)
        .str.strip()
        .str.lower()
        .str.replace(" ", "_")
    )

    # fallback for broken header
    if "meal" not in df.columns:
        df = pd.read_excel(path, header=None)
        df.columns = [
            "meal", "type", "calories", "protein", "carbs", "fats",
            "goal", "disease", "bmi_level", "diet_type", "meal_time",
            "image", "image_prompt"
        ]

    df = df.drop_duplicates().fillna("none")

    # normalize text columns
    text_cols = ["meal", "goal", "disease", "diet_type", "meal_time"]
    for col in text_cols:
        if col in df.columns:
            df[col] = df[col].astype(str).str.lower().str.strip()

    # numeric fix
    num_cols = ["calories", "protein", "carbs", "fats"]
    for col in num_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    print("✅ Dataset Loaded Successfully")
    print("📊 Columns:", df.columns.tolist())

    return df


DATASET_PATH = "Datasets Nutrimate2.xlsx"
df = load_dataset(DATASET_PATH)
# =========================
# CLEAN TEXT COLUMNS (IMPORTANT FIX)
# =========================
df["meal_time"] = df["meal_time"].astype(str).str.lower().str.strip()
df["goal"] = df["goal"].astype(str).str.lower().str.strip()
df["diet_type"] = df["diet_type"].astype(str).str.lower().str.strip()
df["disease"] = df["disease"].astype(str).str.lower().str.strip()


# =========================
# 🍽️ SMART RECOMMENDER ENGINE
# =========================

def recommend_meals(goal, disease, diet_type, meal_time, top_n=5):

    data = df.copy()

    goal = goal.lower().strip()
    disease = disease.lower().strip()
    diet_type = diet_type.lower().strip()
    meal_time = meal_time.lower().strip()

    # 🔥 SHUFFLE FIRST (fix repetition)
    data = data.sample(frac=1).reset_index(drop=True)

    # soft filtering (NOT strict crash)
    if goal in data["goal"].values:
        data = data[data["goal"] == goal]

    if diet_type in data["diet_type"].values:
        data = data[data["diet_type"] == diet_type]

    if meal_time in data["meal_time"].values:
      data = data[data["meal_time"].str.contains(meal_time, na=False)]

    if disease != "none" and "disease" in data.columns:
        data = data[(data["disease"] == disease) | (data["disease"] == "none")]

    # fallback fix
    if data.empty:
        data = df.sample(min(top_n, len(df)))

    # ranking system
    data["score"] = (
        data["protein"] * 2
        - data["calories"] * 0.01
        - data["fats"] * 0.3
    )

    data = data.sort_values("score", ascending=False)

    return data.head(top_n)

# =========================
# 🤖 WHY THIS MEAL ENGINE
# =========================
def explain_meal(row):

    reasons = []

    if row["protein"] >= 20:
        reasons.append("High protein supports muscle growth")

    if row["calories"] <= 300:
        reasons.append("Low calories help weight control")

    if row["fats"] <= 15:
        reasons.append("Healthy low-fat option")

    if str(row["diet_type"]).lower() == "vegan":
        reasons.append("Plant-based vegan friendly")

    if str(row["goal"]).lower() == "loss":
        reasons.append("Supports fat loss goal")

    return reasons if reasons else ["Balanced nutritious meal"]


# =========================
# 🖼️ IMAGE ENGINE (HYBRID)
# =========================
def get_image(row, use_ai=False):

    image_path = row.get("image", "none.jpg")
    prompt = row.get("image_prompt", "")

    # =========================
    # CLEAN PROMPT FIX
    # =========================
    if pd.isna(prompt) or str(prompt).strip() == "":
        prompt = f"{row.get('meal','food')} healthy food image"

    # =========================
    # 🟡 DATASET MODE (DEFAULT)
    # =========================
    if not use_ai:
        return {
            "mode": "dataset",
            "image": image_path,
            "prompt": prompt
        }

    # =========================
    # 🔥 AI MODE
    # =========================
    try:
        ai_image = generate_image(prompt)

        if ai_image:
            image_path = ai_image

    except Exception as e:
        print("⚠️ AI image failed:", e)

        # fallback dataset image
        return {
            "mode": "dataset",
            "image": image_path,
            "prompt": prompt
        }

    return {
        "mode": "ai",
        "image": image_path,
        "prompt": prompt
    }


# =========================
# 🔥 MAIN API FUNCTION (FLASK READY)
# =========================
def get_recommendations(goal, disease, diet_type, meal_time, use_ai_image=False):

    meals = recommend_meals(goal, disease, diet_type, meal_time)

    results = []

    for _, row in meals.iterrows():

        results.append({
            "meal": row["meal"],
            "type": row["type"],
            "calories": float(row["calories"]),
            "protein": float(row["protein"]),
            "carbs": float(row["carbs"]),
            "fats": float(row["fats"]),

            "goal": row["goal"],
            "disease": row["disease"],
            "diet_type": row["diet_type"],
            "meal_time": row["meal_time"],

            # image system
            "image_data": get_image(row, use_ai=use_ai_image),

            # AI explanation
            "why": explain_meal(row)
        })

    return results


# =========================
# 🧪 TEST RUN
# =========================
# 🧪 TEST RUN (FINAL CLEAN & DYNAMIC)
# =========================

if __name__ == "__main__":

    try:
        import random

        goals = ["loss", "gain", "maintain"]
        meals = ["morning", "lunch", "dinner"]

         # optional test sample
        data = df.sample(5)
        print(data)

        # 🔥 DYNAMIC INPUT (NOT STATIC)
        output = get_recommendations(
            goal=random.choice(goals),
            disease="none",
            diet_type="vegan",
            meal_time=random.choice(meals),
            use_ai_image=False
        )

        print("\n🔥 ===== NUTRIMATE AI OUTPUT ===== 🔥\n")

        for i, r in enumerate(output, start=1):

            image_data = r.get("image_data", {})

            print(f"\n🍽 Meal {i}: {r.get('meal', 'N/A')}")
            print(f"🥗 Type: {r.get('type', 'N/A')}")
            print(f"🔥 Calories: {r.get('calories', 0)}")
            print(f"💪 Protein: {r.get('protein', 0)}g")
            print(f"🍞 Carbs: {r.get('carbs', 0)}g")
            print(f"🥑 Fats: {r.get('fats', 0)}g")

            print(f"🎯 Goal: {r.get('goal', 'N/A')}")
            print(f"⚕ Disease: {r.get('disease', 'none')}")
            print(f"⏰ Meal Time: {r.get('meal_time', 'N/A')}")

            print(f"🧠 Why: {', '.join(r.get('why', []))}")

            print(f"🖼 Mode: {image_data.get('mode', 'dataset')}")
            print(f"📷 Image: {image_data.get('image', 'N/A')}")
            print(f"📝 Prompt: {image_data.get('prompt', 'N/A')}")

            print("-" * 60)

    except Exception as e:
        print("❌ Test Run Failed:", str(e))
       