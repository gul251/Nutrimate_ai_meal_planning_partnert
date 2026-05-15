import os
os.environ["OMP_NUM_THREADS"] = "2"
os.environ["OPENBLAS_NUM_THREADS"] = "2"
os.environ["MKL_NUM_THREADS"] = "2"
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
import joblib

# =========================
# LOAD DATA
# =========================
df = pd.read_excel("Datasets Nutrimate.xlsx")
df.columns = df.columns.str.strip().str.lower()

# =========================
# CLEAN DATA
# =========================
df = df.drop_duplicates()

for col in ['age', 'weight', 'height']:
    df[col] = pd.to_numeric(df[col], errors='coerce')

df = df.dropna(subset=['age', 'weight', 'height', 'meal'])
df = df[df['height'] > 0]
df = df[df['weight'] > 0]

# =========================
# FEATURE ENGINEERING
# =========================
df['gender'] = df['gender'].astype(str).str.lower().fillna("unknown")
df['goal']   = df['goal'].astype(str).str.lower().str.strip()
df['disease'] = df['disease'].astype(str).str.lower().str.strip().fillna("none")

# NOTE: Dataset stores height in feet — convert to meters
df['height'] = df['height'] * 0.3048

# BMI
df['bmi'] = df['weight'] / (df['height'] ** 2)

# BMI level
df['bmi_level'] = pd.cut(
    df['bmi'],
    bins=[0, 18.5, 25, 30, 100],
    labels=['under', 'normal', 'over', 'obese']
).astype(str)

# Interaction feature
df['bmi_age'] = df['bmi'] * df['age']

# =========================
# FEATURES & TARGET
# =========================
features = [
    'age',
    'weight',
    'height',
    'gender',
    'bmi',
    'goal',
    'disease',
    'bmi_level',
    'bmi_age'
]

X = df[features]
y = df['meal']

print("Dataset shape:", df.shape)
print("Unique meal classes:", y.nunique())
print("Features:", features)

# =========================
# PREPROCESSING
# =========================
categorical = ['gender', 'goal', 'disease', 'bmi_level']

preprocessor = ColumnTransformer([
    ('cat', OneHotEncoder(handle_unknown='ignore'), categorical)
], remainder='passthrough')

# =========================
# MODEL
# =========================
model = RandomForestClassifier(
    n_estimators=150,
    max_depth=15,
    min_samples_split=10,
    class_weight='balanced_subsample',
    random_state=52,
    n_jobs=5
)

pipeline = Pipeline([
    ('preprocess', preprocessor),
    ('model', model)
])

# =========================
# TRAIN / TEST SPLIT
# =========================
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# =========================
# TRAIN
# =========================
print("\nTraining model...")
pipeline.fit(X_train, y_train)

# =========================
# EVALUATION
# =========================
acc = pipeline.score(X_test, y_test)
print("Test accuracy:", round(acc, 4))

cv_scores = cross_val_score(pipeline, X, y, cv=5)
print("Cross-validation accuracy:", round(cv_scores.mean(), 4))

# =========================
# SAVE MODEL
# =========================
joblib.dump(pipeline, "meal_model.pkl")  # Fixed: matches app.py load name
print("\nModel saved as meal_model.pkl ✅")
