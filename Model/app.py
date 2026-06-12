import pandas as pd
import unicodedata
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

df = pd.read_excel("dataset.xlsx")


def remove_accents(text):
    if not isinstance(text, str):
        return ""

    nfkd = unicodedata.normalize('NFKD', text)
    return ''.join(
        c for c in nfkd
        if not unicodedata.combining(c)
    ).lower().strip()


amenities_columns = [
    "climatisation",
    "chauffage",
    "salle_de_bains",
    "toilettes",
    "douche",
    "television",
    "internet_gratuit",
    "terrasse",
    "service_de_navette",
    "ascenseur",
    "chambres_familiales",
    "navette_aeroport",
    "telephone",
    "restaurant",
    "balcon",
    "cheminee",
    "parking",
    "piscine_exterieure",
    "piscine_interieure",
    "fitness",
    "spa",
    "coiffure",
    "massages",
    "sauna",
    "bagagerie",
    "petit_dejeuner_en_chambre",
    "jardin",
    "vue_sur_la_ville",
    "vue_sur_la_piscine",
    "vue_sur_le_jardin"
]


@app.route('/predict', methods=['POST'])
def predict():

    data = request.get_json()

    city = data.get("city", "")
    budget = float(data.get("budget", 0))
    stars = data.get("stars", "")
    hotel_type = data.get("type", "")
    amenities = data.get("amenities", [])

    city_clean = remove_accents(city)

    df["City_Clean"] = df["City"].apply(remove_accents)

    # ==========================
    # FILTRE CITY
    # ==========================

    hotels = df[df["City_Clean"] == city_clean].copy()

    if hotels.empty:
        return jsonify({
            "success": False,
            "message": "Aucun hôtel trouvé dans cette ville"
        })

    scores = []

    for _, hotel in hotels.iterrows():

        score = 0

      
        # STARS SCORE
       

        if str(hotel["Etoiles"]).strip() == str(stars).strip():
            score += 15

     
        # TYPE SCORE
      

        if remove_accents(str(hotel["Type"])) == remove_accents(str(hotel_type)):
            score += 15

       
        # BUDGET SCORE
      

        hotel_price = float(hotel["Prix_Num"])

        diff = abs(hotel_price - budget)

        if diff <= 200:
            score += 30
        elif diff <= 500:
            score += 20
        elif diff <= 1000:
            score += 10

   
        # AMENITIES SCORE
      

        amenities_score = 0

        for amenity in amenities:

            if amenity in amenities_columns:

                if int(hotel[amenity]) == 1:
                    amenities_score += 2

        score += amenities_score

        scores.append(score)

    hotels["score"] = scores

    best_hotel = hotels.sort_values(
        by="score",
        ascending=False
    ).iloc[0]

    hotel_result = {

        "nom": str(best_hotel["Nom"]),
        "city": str(best_hotel["City"]),
        "prix_num": float(best_hotel["Prix_Num"]),
        "devise": str(best_hotel["Devise"]),
        "etoiles": str(best_hotel["Etoiles"]),
        "type": str(best_hotel["Type"]),
        "address": str(best_hotel["Address"]),
        "quartier": str(best_hotel["Quartier"]),
        "lat": str(best_hotel["Lat"]),
        "long": str(best_hotel["Long"]),
        "score": float(best_hotel["score"]),
        "image_url": "https://images.unsplash.com/photo-1566073771259-6a8506099945"
    }

    return jsonify({
        "success": True,
        "hotel": hotel_result
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000)