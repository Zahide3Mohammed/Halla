import React, { useState } from "react";
import "./accueil.css";
import { useAuth } from "../../context/AuthContext";

export default function Accueil() {
  // 1. استخدام state لكل input لتفادي querySelector ومشاكل الـ DOM
  const [city, setCity] = useState("Fes");
  const [budget, setBudget] = useState(500);
  const [stars, setStars] = useState("4 Stars");
  const [hotelType, setHotelType] = useState("Riad"); // الديفولت لي كاين فالفلاكس
  
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const { user } = useAuth();
  const primaryColor = user?.color || "#6366f1";
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

  const toggleAmenity = (item) => {
    setSelectedAmenities((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    setLoading(true);

    // 2. تحويل الـ amenities لـ Lowercase باش تطابق مع الـ Python والـ Dataset
    
const amenitiesToPython = selectedAmenities.map(a => a.toLowerCase().replace(/ /g, '_'));
    // بناء الـ Payload الحقيقي والمطابق للـ Controller د لارافيل
    const payload = {
      city: city,
      budget: parseFloat(budget),
      stars: stars,
      type: hotelType, // صيفطنا الـ type دابا
      amenities: amenitiesToPython,
    };

    try {
      console.log("✈️ Sending Data to Laravel:", payload);
      
      const response = await fetch("http://127.0.0.1:8000/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      
      if (result.success) {
        setRecommendation(result.ai_data); 
      } else {
        alert("🚨 مـشـكـل فـ الـ Prediction: " + (result.message || "Unknown error"));
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
        {/* LEFT SIDE */}
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

                <div className="geo-coordinates">
                  Lat: {recommendation.lat} | Long: {recommendation.long}
                </div>

                <button className="reset-btn" onClick={() => setRecommendation(null)}>
                  ← Search Another Hotel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDE */}
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
                  type="number" 
                  value={budget} 
                  onChange={(e) => setBudget(e.target.value)} 
                  placeholder="Ex: 1200" 
                  required 
                />
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
                  onClick={() => toggleAmenity(item)}
                >
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