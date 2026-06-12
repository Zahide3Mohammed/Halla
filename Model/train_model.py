import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib

# --- Step 1: Data Loading & Preprocessing ---
print("🚀 Loading dataset and initializing model training...")
df = pd.read_excel('dataset.xlsx')

# Drop non-feature columns that don't contribute to the prediction logic
cols_to_drop = ['Nom', 'City', 'pageName', 'city_extract', 'Type', 'Prix_Num', 'Devise', 'Etoiles', 'Address', 'Quartier', 'Lat', 'Long']
features = df.drop(columns=cols_to_drop)

# Target variable preparation
target = df['Nom'] 

# --- Step 2: Label Encoding ---
# Encode hotel names into numerical classes for model compatibility
le = LabelEncoder()
y = le.fit_transform(target)

# --- Step 3: Model Training ---
print("🧠 Training the Random Forest classifier...")
# Configure the Random Forest with optimal hyperparameters
model = RandomForestClassifier(n_estimators=20, max_depth=10, random_state=42)
model.fit(features, y)

# --- Step 4: Model Serialization ---
# Save the trained model and the encoder for future inference in production
joblib.dump(model, 'model.pkl')
joblib.dump(le, 'hotel_label_encoder.pkl')

print("✅ Model training completed and artifacts saved successfully!")