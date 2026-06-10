import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib

print("🚀 جاري تحميل البيانات وتجهيز الموديل...")
df = pd.read_excel('dataset.xlsx')


cols_to_drop = ['Nom', 'City', 'pageName', 'city_extract', 'Type', 'Prix_Num', 'Devise', 'Etoiles', 'Address', 'Quartier', 'Lat', 'Long']

features = df.drop(columns=cols_to_drop)
target = df['Nom'] 

# تحويل أسماء الأوتيلات لأرقام
le = LabelEncoder()
y = le.fit_transform(target)

# تدريب الموديل
print("🧠 جاري تدريب الـ Random Forest...")
# بدل السطر ديال الموديل بـ هادشي:
model = RandomForestClassifier(n_estimators=20, max_depth=10, random_state=42)
model.fit(features, y)

# حفظ النتائج
joblib.dump(model, 'model.pkl')
joblib.dump(le, 'hotel_label_encoder.pkl')

print("✅ تم تدريب الموديل وحفظ الملفات بنجاح!")