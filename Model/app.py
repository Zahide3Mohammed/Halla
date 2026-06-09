from flask import Flask, request, jsonify
import pickle
import pandas as pd
import traceback

app = Flask(__name__)

try:
    with open('model.pkl', 'rb') as f:
        model = pickle.load(f)
        print(type(model))
      

        
except Exception as e:
    print(f"CRITICAL ERROR LOADING MODEL: {str(e)}")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        print("\n=== DATA RECEIVED FROM LARAVEL ===")
        print(data)
      
        
        city = data.get('city', 'Marrakech')
        
        try:
            budget = float(data.get('budget', 0))
        except Exception:
            budget = 1000.0

        stars_raw = data.get('stars', '3')
        try:
            if isinstance(stars_raw, str) and ' ' in stars_raw:
                stars = int(stars_raw.split()[0])
            else:
                stars = int(stars_raw)
        except Exception:
            stars = 3

        input_data = pd.DataFrame([{
            'city': city,
            'budget': budget,
            'stars': stars
        }])

        # Execution secure dial prediction attribute
        if hasattr(model, 'predict'):
            prediction = model.predict(input_data)
            predicted_hotel_name = str(prediction[0])
        else:
            if hasattr(model, '__getitem__') and len(model) > 0:
                predicted_hotel_name = str(model[0])
            else:
                predicted_hotel_name = "Hôtel Atlas Luxury"
        
        print(f"PREDICTION RESULT: {predicted_hotel_name}")
        
        hotel_output = {
            "nom": predicted_hotel_name,
            "city": city,
            "pagename": "hotel-details-page",
            "city_extract": city,
            "type": "Luxury Hotel",
            "prix_num": budget,
            "devise": "DH",
            "etoiles": f"{stars} Stars",
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
        return jsonify({
            'status': 'error', 
            'message': str(e)
        }), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)