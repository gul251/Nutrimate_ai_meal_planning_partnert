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

# height conversion (feet → meters)
df['height'] = df['height'] * 0.3048

# BMI
df['bmi'] = df['weight'] / (df['height'] ** 2)

# BMI grouping (safe)
df['bmi_level'] = pd.cut(
    df['bmi'],
    bins=[0, 18.5, 25, 30, 100],
    labels=['under', 'normal', 'over', 'obese']
).astype(str)

# Extra powerful feature
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

# =========================
# PREPROCESSING
# =========================
categorical = ['gender', 'goal', 'disease', 'bmi_level']

preprocessor = ColumnTransformer([
    ('cat', OneHotEncoder(handle_unknown='ignore'), categorical)
], remainder='passthrough')

# =========================
# MODEL (OPTIMIZED)
# =========================
model = RandomForestClassifier(
    n_estimators=1000,
    max_depth=25,
    min_samples_split=3,
    class_weight='balanced_subsample',
    random_state=42,
    n_jobs=-1
)

pipeline = Pipeline([
    ('preprocess', preprocessor),
    ('model', model)
])

# =========================
# TRAIN TEST SPLIT
# =========================
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42
)

# =========================
# TRAIN
# =========================
pipeline.fit(X_train, y_train)

# =========================
# EVALUATION
# =========================
acc = pipeline.score(X_test, y_test)
print("\nMODEL ACCURACY:", acc)

# CROSS VALIDATION (REAL SCORE)
cv_scores = cross_val_score(pipeline, X, y, cv=5)
print("CROSS VALIDATION ACCURACY:", cv_scores.mean())

# =========================
# SAVE MODEL
# =========================
joblib.dump(pipeline, "meal_model.pkl")

print("\nMODEL TRAINED + SAVED SUCCESSFULLY 🚀")