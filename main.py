import pandas as pd

# Load file
df = pd.read_excel('Datasets Nutrimate.xlsx')

# 🔍 STEP 1: Check actual column names
print("Original Columns:", df.columns.tolist())

# 🔧 STEP 2: Clean column names (spaces + lowercase)
df.columns = df.columns.str.strip().str.lower()

print("Cleaned Columns:", df.columns.tolist())

# ❗ STEP 3: Rename columns manually (IMPORTANT)
df.rename(columns={
    'gender ': 'gender',
    ' gender': 'gender',
    'genders': 'gender',
}, inplace=True)

# 🔍 STEP 4: Check again
print("Final Columns:", df.columns.tolist())

# ❌ Safety check
if 'gender' not in df.columns:
    raise Exception("❌ 'gender' column NOT FOUND — check spelling in Excel")

# ✅ STEP 5: Apply mapping

df['gender'] = df['gender'].astype(str).str.strip().str.lower().map({
  'male': 0,
    'female': 1
}).fillna(-1)

# Safe fill for missing values
df.fillna("Unknown", inplace=True)

# Convert height to numeric first
df['height'] = pd.to_numeric(df['height'], errors='coerce')

# Now convert feet to meters
df['height'] = df['height'] * 0.3048

# Recalculate BMI
df['bmi'] = df['weight'] / (df['height'] ** 2)

# BMI Risk Score
def bmi_category(bmi):
    if bmi < 18.5:
        return "Underweight"
    elif bmi < 25:
        return "Normal"
    elif bmi < 30:
        return "Overweight"
    else:
        return "Obese"

df['bmi_category'] = df['bmi'].apply(bmi_category)

# bmi_risk
def bmi_risk(bmi):
    if bmi < 18.5:
        return "Low Risk"
    elif bmi < 25:
        return "Healthy Risk"
    elif bmi < 30:
        return "Medium Risk"
    else:
        return "High Risk"

df['bmi_risk'] = df['bmi'].apply(bmi_risk)

# Age Group Classification
df['age'] = pd.to_numeric(df['age'], errors='coerce')

def age_group(age):
    if age <= 18:
        return "Teen"
    elif age <= 35:
        return "Young Adult"
    elif age <= 55:
        return "Adult"
    else:
        return "Senior"

df['age_group'] = df['age'].apply(age_group)

# Diet Priority Tag
# Smart Feature Column
df['priority_tag'] = df['goal'].astype(str) + "_" + df['bmi_category'].astype(str)
df['ai_input'] = df['age_group'].astype(str) + "_" + df['gender'].astype(str) + "_" + df['bmi_category'].astype(str)

# Quick Insight Print
print("\nBMI Category Count:\n", df['bmi_category'].value_counts())
print("\nAge Groups:\n", df['age_group'].value_counts())

num_cols = df.select_dtypes(include=['float64', 'int64']).columns
df[num_cols] = df[num_cols].fillna(0)

cat_cols = df.select_dtypes(include=['string', 'object']).columns
df[cat_cols] = df[cat_cols].fillna("Unknown")

print(df.head())

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.tree import DecisionTreeClassifier


# STEP 1: ENCODING (TEXT → NUMBER)
le_goal = LabelEncoder()
df['goal'] = le_goal.fit_transform(df['goal'].astype(str))

le_meal = LabelEncoder()
df['meal'] = le_meal.fit_transform(df['meal'].astype(str))


# STEP 2: FEATURES & TARGET
X = df[['age', 'weight', 'height', 'gender', 'bmi', 'goal']]
y = df['meal']


# STEP 3: TRAIN TEST SPLIT
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)


# STEP 4: MODEL TRAINING
model = DecisionTreeClassifier()
model.fit(X_train, y_train)

# STEP 5: MODEL ACCURACY
accuracy = model.score(X_test, y_test)
print("\nMODEL ACCURACY:", accuracy)


# STEP 6: TEST PREDICTION
sample = [[25, 70, 1.70, 0, 22, 1]]  # example input
prediction = model.predict(sample)

print("Recommended Meal:", le_meal.inverse_transform(prediction))