import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import unicodedata

app = Flask(__name__)
CORS(app)

# تحميل البيانات والموديل
model = joblib.load('model.pkl', mmap_mode='r')
le = joblib.load('hotel_label_encoder.pkl')
df = pd.read_excel('dataset.xlsx')

# وظيفة لإزالة الـ Accents (مثلاً تحويل 'fès' إلى 'fes')
def remove_accents(input_str):
    if not isinstance(input_str, str): return str(input_str)
    nfkd_form = unicodedata.normalize('NFKD', input_str)
    return "".join([c for c in nfkd_form if not unicodedata.combining(c)]).lower().strip()

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    target_city = remove_accents(data.get('city', ''))
    budget = float(data.get('budget', 0))
    
    # تحضير عمود للمقارنة بدون Accents
    df['City_Clean'] = df['City'].apply(remove_accents)
    
    # 1. فلتر المدينة
    city_df = df[df['City_Clean'] == target_city].copy()
    
    if city_df.empty:
        return jsonify({'success': False, 'message': 'لا توجد أوتيلات في هذه المدينة.'})

    # 2. ترتيب النتائج حسب الميزانية (أقرب أوتيل للميزانية)
    city_df['diff'] = (city_df['Prix_Num'] - budget).abs()
    best_hotel = city_df.sort_values(by='diff').iloc[0]
    
    # 3. إرجاع النتيجة
    hotel_result = {
        "nom": str(best_hotel['Nom']),
        "city": str(best_hotel['City']),
        "prix_num": float(best_hotel['Prix_Num']),
        "devise": str(best_hotel['Devise']),
        "etoiles": str(best_hotel['Etoiles']),
        "address": str(best_hotel['Address']),
        "quartier": str(best_hotel['Quartier']),
        "lat": str(best_hotel['Lat']),
        "long": str(best_hotel['Long']),
        "image_url": "https://images.unsplash.com/photo-1566073771259-6a8506099945"
    }

    return jsonify({'success': True, 'hotel': hotel_result})

if __name__ == '__main__':
    app.run(port=5000, debug=True)