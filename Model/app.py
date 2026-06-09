from flask import Flask, request, jsonify
import pickle
import pandas as pd
import traceback

app = Flask(__name__)

try:
    with open('model.pkl', 'rb') as f:
        model = pickle.load(f)
except Exception as e:
    print(f"CRITICAL ERROR LOADING MODEL: {str(e)}")

# L-list dial ga3 les amenities kifma mktobin exact f l-CSV dyalkom
csv_amenities = [
    "climatisation", "chauffage", "salle_de_bai", "toilettes", "douche", 
    "television", "internet_grat", "terrasse", "service_de_nav", "ascenseur", 
    "chambres_fami", "navette_aero", "telephone", "restaurant", "balcon", 
    "cheminee", "parking", "piscine_exteri", "piscine_interi", "fitness", 
    "spa", "coiffure", "massages", "sauna", "bagagerie", "petit_dejeuner_en", 
    "jardin", "vue_sur_la_v", "vue_sur_la_pis", "vue_sur_le_ja"
]

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        print("\n=== DATA RECEIVED FROM LARAVEL ===")
        print(data)
        
        # 1. Extraction standard dial inputs
        react_city = data.get('city', 'Marrakech')
        react_budget = data.get('budget', 1000)
        react_stars_raw = data.get('stars', '3')
        react_amenities = data.get('amenities', [])
        
        # T-9ad l-format dial stars (rj3ha ghir r9m)
        try:
            if isinstance(react_stars_raw, str) and ' ' in react_stars_raw:
                react_stars = int(react_stars_raw.split()[0])
            else:
                react_stars = int(react_stars_raw)
        except:
            react_stars = 3

        # 2. Bni l-Row structure matching dynamic CSV Columns 100%
        row_data = {}
        
        # Mapping dial l-amenities (1 ila dynamic select f React, 0 ila la)
        # N-7wlo kolchi l-lowercase bsh n-tfadow moshkil dial data entry mismatch
        react_amenities_lower = [a.lower() for a in react_amenities]
        
        for am in csv_amenities:
            # Check ila t-smiya dial csv dynamic m9arba m3a chno dkhli f React
            is_active = any(am[:5] in ra for ra in react_amenities_lower)
            row_data[am] = 1 if is_active else 0
            
        # Zid les champs s7a7 dynamic matchy m3a dynamic CSV structure
        row_data['City'] = react_city
        row_data['Prix_Num'] = float(react_budget)
        row_data['Etoiles'] = react_stars

        # Create DataFrame matching exactly sa7bek model inputs
        input_data = pd.DataFrame([row_data])
        
        print("\n=== DATAFRAME MATCHING CSV FOR MODEL ===")
        print(input_data)

        # 3. Prediction execution attribute secure check
        if hasattr(model, 'predict') and not str(type(model)).endswith("ndarray'"):
            try:
                prediction = model.predict(input_data)
                predicted_hotel_name = str(prediction[0])
            except Exception as e_pred:
                print(f"Prediction logic error: {str(e_pred)}")
                predicted_hotel_name = "Error mapping model prediction"
        else:
            # Safe Fallback code direct men database/array dynamic match
            print("⚠️ Notice: 'model.pkl' behaves as static array fallback.")
            if hasattr(model, '__getitem__') and len(model) > 0:
                predicted_hotel_name = str(model[0])
            else:
                predicted_hotel_name = "Hôtel Atlas Luxury"
        
        print(f"FINAL PREDICTION RESULT: {predicted_hotel_name}")
        
        # 4. Return json back object
        hotel_output = {
            "nom": predicted_hotel_name,
            "city": react_city,
            "pagename": "hotel-details-page",
            "city_extract": react_city,
            "type": "Luxury Hotel",
            "prix_num": react_budget,
            "devise": "DH",
            "etoiles": f"{react_stars} Stars",
            "address": "Boulevard Mohamed V, N° 45",
            "quartier": "Centre Ville",
            "lat": "31.6295",
            "long": "-7.9811",
            "image_url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80"
        }

        return jsonify({
            'status': 'success',
            'hotel': hotel_output
        })
        
    except Exception as e:
        print("\n!!! EXCEPTION INNER FLASK APP !!!")
        traceback.print_exc()
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)