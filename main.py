import pandas as pd

# Load Excel file (ab proper .xlsx hai)
df = pd.read_excel('Datasets Nutrimate.xlsx')

# Column names clean (spaces + lowercase)
df.columns = df.columns.str.strip().str.lower()

# Remove duplicates
df = df.drop_duplicates()

# Remove missing values
df = df.dropna()

# Convert categorical columns

# Gender
df['gender'] = df['gender'].str.strip().str.lower().map({
    'male': 0,
    'female': 1
})

# Goal
df['goal'] = df['goal'].str.strip().str.lower().map({
    'loss': 0,
    'maintain': 1,
    'gain': 2
})

# Optional: Meal type (agar use karna ho ML mein)
df['meal'] = df['meal'].astype('category').cat.codes

# Disease (optional)
df['disease'] = df['disease'].astype('category').cat.codes

# Final check
print(df.head())
print("\nColumns:", df.columns)