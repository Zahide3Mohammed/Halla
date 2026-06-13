import React, { useState } from "react";
import "./accueil.css";
import { useAuth } from "../../context/AuthContext";
import HotelMap from "./HotelMap";

export default function Accueil() {
  const [city, setCity] = useState("Fes");
  const [budget, setBudget] = useState(500);
  const [stars, setStars] = useState("4 Stars");
  const [hotelType, setHotelType] = useState("Riad"); 
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const { user } = useAuth();
  const primaryColor = user?.color || "#6366f1";
  const [loading, setLoading] = useState(false);
  const amenities = [
    "climatisation", "chauffage", "salle_de_bains", "toilettes", "douche", 
    "television", "internet_gratuit", "terrasse", "service_de_navette", "ascenseur", 
    "chambres_familiales", "navette_aeroport", "restaurant", "balcon", "cheminee", 
    "parking", "piscine_exterieure", "piscine_interieure", "fitness", "spa", 
    "coiffure", "massages", "sauna", "bagagerie", "petit_dejeuner_en_chambre", 
    "jardin", "vue_sur_la_ville", "vue_sur_la_piscine", "vue_sur_le_jardin"
];
//========================================================
  const toggleAmenity = (item) => {
    setSelectedAmenities((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };
//===================================================
  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    setLoading(true);
    const amenitiesToPython = selectedAmenities.map(a => a.toLowerCase().replace(/ /g, '_'));
    const payload = {
        city: city,
        budget: parseFloat(budget),
        stars: stars,
        type: hotelType, 
        amenities: amenitiesToPython,
    };
    try {
        console.log("✈️ Sending Data to Laravel:", payload);
        const response = await fetch("/api/recommendations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = await response.json(); 
         if (data.success) {
            setRecommendation(data.ai_data); 
        } else {
            alert("🚨 مـشـكـل فـ الـ Prediction: " + (data.message || "Unknown error"));
        }
    } catch (error) {
        console.error("Error during prediction fetch:", error);
        alert("❌ تعذر الاتصال بسيرفر لارافيل.");
    } finally {
        setLoading(false);
    }
};
  return (
    <div className="page" style={{ "--primary-color": primaryColor }}>
      <div className="bg-circle one"></div>
      <div className="bg-circle two"></div>
      <div className="container">
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
            </>) : (
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
                <a
                href={`https://www.google.com/maps/search/?api=1&query=${recommendation.lat},${recommendation.long}`}
                target="_blank" rel="noreferrer" className="maps-btn">
                Open in Google Maps
                </a>
                <button className="reset-btn" onClick={() => setRecommendation(null)}>
                  ← Search Another Hotel
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="right">
          <div className="form">
            <div className="top">
              <h2>Customize Your Experience</h2>
              <p>Select your travel preferences</p>
            </div>
            <div className="inputs-grid">
              <div className="input-group">
                <label>Destination City</label>
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
                  type="number" value={budget} 
                  onChange={(e) => setBudget(e.target.value)} placeholder="Ex: 1200" required />
              </div>
              <div className="input-group">
                <label>Hotel Stars</label>
                <select value={stars} onChange={(e) => setStars(e.target.value)}>
                  <option value="3 Stars">3 Stars</option>
                  <option value="4 Stars">4 Stars</option>
                  <option value="5 Stars">5 Stars</option>
                </select>
              </div>
              <div className="input-group">
                <label>Hotel Type</label>
                <select value={hotelType} onChange={(e) => setHotelType(e.target.value)}>
                  <option value="Riad">Riad</option>
                  <option value="Hôtel">Hôtel</option>
                  <option value="Appartement">Appartement</option>
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
                  onClick={() => toggleAmenity(item)}>
                  {item}
                </div>
              ))}
            </div>
            <button type="button" className="submit-btn" disabled={loading} onClick={handleSubmit}>
              {loading ? "AI Processing..." : "Find Best Hotels"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}