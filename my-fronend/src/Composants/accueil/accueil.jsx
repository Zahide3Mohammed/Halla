import React, { useState } from "react";
import "./accueil.css";
import { useAuth } from "../../context/AuthContext";
<<<<<<< HEAD

export default function Accueil() {
=======
import HotelMap from "./HotelMap";

export default function Accueil() {
    // Form state
  const [city, setCity] = useState("Fes");
  const [budget, setBudget] = useState(500);
  const [stars, setStars] = useState("4 Stars");
  const [hotelType, setHotelType] = useState("Riad"); 
    // Recommendation data
>>>>>>> f6f0564cc7d2f23edecaf27d7e2738c74848a983
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const { user } = useAuth();
  const primaryColor = user?.color || "#6366f1";
<<<<<<< HEAD
  const [loading, setLoading] = useState(false);
  const amenities = [
    "Climatisation", "Chauffage", "Salle de bains", "Toilettes",
    "Douche", "Télévision", "Internet Gratuit", "Terrasse",
    "Service de navette", "Ascenseur", "Chambres familiales",
    "Navette aéroport", "Restaurant", "Balcon", "Parking",
    "Piscine extérieure", "Piscine intérieure", "Fitness",
    "Spa", "Massages", "Sauna", "Petit déjeuner", "Jardin",
    "Vue sur la ville", "Vue sur la piscine",
  ];
=======
    // Loading state
  const [loading, setLoading] = useState(false);
  // Available amenities
 const amenities = [
    "climatisation", "chauffage", "salle_de_bains", "toilettes", "douche", 
    "television", "internet_gratuit", "terrasse", "service_de_navette", "ascenseur", 
    "chambres_familiales", "navette_aeroport", "restaurant", "balcon", "cheminee", 
    "parking", "piscine_exterieure", "piscine_interieure", "fitness", "spa", 
    "coiffure", "massages", "sauna", "bagagerie", "petit_dejeuner_en_chambre", 
    "jardin", "vue_sur_la_ville", "vue_sur_la_piscine", "vue_sur_le_jardin"
];
  // Add or remove an amenity
>>>>>>> f6f0564cc7d2f23edecaf27d7e2738c74848a983
  const toggleAmenity = (item) => {
    setSelectedAmenities((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };
<<<<<<< HEAD
  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    setLoading(true);
    const cityInput = document.querySelector('input[name="city"]')?.value;
    const budgetInput = document.querySelector('input[name="budget"]')?.value;
    const starsSelect = document.querySelector('select[name="stars"]')?.value;

    const payload = {
      city: cityInput,
      budget: budgetInput,
      stars: starsSelect,
      amenities: selectedAmenities,
    };

    try {
=======
  // Send user preferences to the API

  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    setLoading(true);

  
    
const amenitiesToPython = selectedAmenities.map(a => a.toLowerCase().replace(/ /g, '_'));
      // Request payload
    const payload = {
      city: city,
      budget: parseFloat(budget),
      stars: stars,
      type: hotelType, // Selected hotel category
      amenities: amenitiesToPython,
    };

    try {
      console.log("✈️ Sending Data to Laravel:", payload);
      
>>>>>>> f6f0564cc7d2f23edecaf27d7e2738c74848a983
      const response = await fetch("http://127.0.0.1:8000/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
<<<<<<< HEAD
      if (result.success) {
        setRecommendation(result.ai_data); // Matchi m3a Controller dynamic output
      } else {
        alert("Moshkil f prediction");
      }
    } catch (error) {
      console.error("Error:", error);
=======
      
      if (result.success) {
        setRecommendation(result.ai_data); 
      } else {
        alert("🚨 مـشـكـل فـ الـ Prediction: " + (result.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error during prediction fetch:", error);
      alert("❌ تعذر الاتصال بسيرفر لارافيل.");
>>>>>>> f6f0564cc7d2f23edecaf27d7e2738c74848a983
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ "--primary-color": primaryColor }}>
      <div className="bg-circle one"></div>
      <div className="bg-circle two"></div>

      <div className="container">
<<<<<<< HEAD
        {/* LEFT SIDE */}
=======
     {/* Recommendation panel */}
>>>>>>> f6f0564cc7d2f23edecaf27d7e2738c74848a983
        <div className="left">
          <div className="mini-badge">AI Powered Hotel Recommendation</div>

          {!recommendation ? (
            <>
              <h1>Find Your <span>Dream Hotel</span></h1>
              <p>
                Experience a next-generation hotel recommendation system powered by
                artificial intelligence. Select your preferences and get the most
                suitable luxury hotels instantly.
              </p>
              <div className="features">
                <div className="feature-card"><h2>500+</h2><span>Luxury Hotels</span></div>
                <div className="feature-card"><h2>AI</h2><span>Smart Match</span></div>
                <div className="feature-card"><h2>24/7</h2><span>Instant Results</span></div>
              </div>
            </>
          ) : (
            <div className="hotel-result-card">
              <div className="card-top-info">
                <span className="result-badge">AI MATCH FOUND</span>
                <span className="hotel-stars-badge">{recommendation.etoiles}</span>
              </div>
              
              <img src={recommendation.image_url} alt={recommendation.nom} className="hotel-img" />
              
              <div className="hotel-details-content">
                <div className="hotel-header-row">
                  <h2>{recommendation.nom}</h2>
                  <div className="hotel-price">
                    <span className="price-num">{recommendation.prix_num}</span>
                    <span className="price-devise"> {recommendation.devise}</span>
                  </div>
                </div>

                <span className="hotel-type-tag">{recommendation.type}</span>
                
                <p className="hotel-location-info">
                  <strong>Quartier:</strong> {recommendation.quartier}, {recommendation.city} <br />
                  <strong>Address:</strong> {recommendation.address}
                </p>

<<<<<<< HEAD
                <div className="geo-coordinates">
                  Lat: {recommendation.lat} | Long: {recommendation.long}
                </div>
=======
  <a
  href={`https://www.google.com/maps/search/?api=1&query=${recommendation.lat},${recommendation.long}`}
  target="_blank"
  rel="noreferrer"
  className="maps-btn"
>
  Open in Google Maps
</a>
>>>>>>> f6f0564cc7d2f23edecaf27d7e2738c74848a983

                <button className="reset-btn" onClick={() => setRecommendation(null)}>
                  ← Search Another Hotel
                </button>
              </div>
            </div>
          )}
        </div>

<<<<<<< HEAD
        {/* RIGHT SIDE */}
        <div className="right">
          {/* Fix 2: Beddelna form b div bach n-7ydo automatic browser submit reloads */}
=======
       {/* Search form */}
        <div className="right">
>>>>>>> f6f0564cc7d2f23edecaf27d7e2738c74848a983
          <div className="form">
            <div className="top">
              <h2>Customize Your Experience</h2>
              <p>Select your travel preferences</p>
            </div>

            <div className="inputs-grid">
              <div className="input-group">
                <label>Destination City</label>
<<<<<<< HEAD
                <input type="text" name="city" placeholder="Ex: Marrakech" required />
              </div>

              <div className="input-group">
                <label>Budget</label>
                <input type="number" name="budget" placeholder="Ex: 1200 DH" required />
=======
                <input 
                  type="text" 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)} 
                  placeholder="Ex: Marrakech" 
                  required 
                />
              </div>

              <div className="input-group">
                <label>Budget (DH)</label>
                <input 
                  type="number" 
                  value={budget} 
                  onChange={(e) => setBudget(e.target.value)} 
                  placeholder="Ex: 1200" 
                  required 
                />
>>>>>>> f6f0564cc7d2f23edecaf27d7e2738c74848a983
              </div>

              <div className="input-group">
                <label>Hotel Stars</label>
<<<<<<< HEAD
                <select name="stars">
                  <option>3 Stars</option>
                  <option>4 Stars</option>
                  <option>5 Stars</option>
=======
                <select value={stars} onChange={(e) => setStars(e.target.value)}>
                  <option value="3 Stars">3 Stars</option>
                  <option value="4 Stars">4 Stars</option>
                  <option value="5 Stars">5 Stars</option>
>>>>>>> f6f0564cc7d2f23edecaf27d7e2738c74848a983
                </select>
              </div>

              <div className="input-group">
                <label>Hotel Type</label>
<<<<<<< HEAD
                <select>
                  <option>Luxury</option>
                  <option>Resort</option>
                  <option>Business</option>
                  <option>Romantic</option>
=======
                <select value={hotelType} onChange={(e) => setHotelType(e.target.value)}>
                  <option value="Riad">Riad</option>
                  <option value="Hôtel">Hôtel</option>
                  <option value="Appartement">Appartement</option>
>>>>>>> f6f0564cc7d2f23edecaf27d7e2738c74848a983
                </select>
              </div>
            </div>

            <div className="section-title">
              <h3>Select Amenities</h3>
            </div>

            <div className="amenities-grid">
              {amenities.map((item, index) => (
                <div
                  key={index}
                  className={`amenity ${selectedAmenities.includes(item) ? "active" : ""}`}
                  onClick={() => toggleAmenity(item)}
                >
                  {item}
                </div>
              ))}
            </div>

<<<<<<< HEAD
            {/* Fix 3: Bdelna type l button l type="button" w derna onClick direct */}
=======
>>>>>>> f6f0564cc7d2f23edecaf27d7e2738c74848a983
            <button type="button" className="submit-btn" disabled={loading} onClick={handleSubmit}>
              {loading ? "AI Processing..." : "Find Best Hotels"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}