import React, { useState } from "react";
import "./accueil.css";
import { useAuth } from "../../context/AuthContext";

export default function Accueil() {
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const { user } = useAuth();
  const primaryColor = user?.color || "#6366f1";
  
  // Fix 1: Default value false l-loading
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

    // Kanjbdo l-inputs directly mn l-document framework safe
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
      const response = await fetch("http://127.0.0.1:8000/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        setRecommendation(result.ai_data); // Matchi m3a Controller dynamic output
      } else {
        alert("Moshkil f prediction");
      }
    } catch (error) {
      console.error("Error:", error);
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
          {/* Fix 2: Beddelna form b div bach n-7ydo automatic browser submit reloads */}
          <div className="form">
            <div className="top">
              <h2>Customize Your Experience</h2>
              <p>Select your travel preferences</p>
            </div>

            <div className="inputs-grid">
              <div className="input-group">
                <label>Destination City</label>
                <input type="text" name="city" placeholder="Ex: Marrakech" required />
              </div>

              <div className="input-group">
                <label>Budget</label>
                <input type="number" name="budget" placeholder="Ex: 1200 DH" required />
              </div>

              <div className="input-group">
                <label>Hotel Stars</label>
                <select name="stars">
                  <option>3 Stars</option>
                  <option>4 Stars</option>
                  <option>5 Stars</option>
                </select>
              </div>

              <div className="input-group">
                <label>Hotel Type</label>
                <select>
                  <option>Luxury</option>
                  <option>Resort</option>
                  <option>Business</option>
                  <option>Romantic</option>
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

            {/* Fix 3: Bdelna type l button l type="button" w derna onClick direct */}
            <button type="button" className="submit-btn" disabled={loading} onClick={handleSubmit}>
              {loading ? "AI Processing..." : "Find Best Hotels"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}