import React, { useState } from 'react';
import './accueil.css';

const HotelAIFinder = () => {
    const [city, setCity] = useState('');
    const [favColor, setFavColor] = useState('#8b3dff');
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);

    // --- SVG ICONS (Inline) ---
    const SvgLocation = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
    const SvgPalette = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93"/></svg>;
    const SvgSearch = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;

    const handleSearch = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setRecommendations([
                { id: 1, name: "Royal Mansour", img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=500&q=80", price: "4,500", tag: "LUXURY" },
                { id: 2, name: "Selman Marrakech", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=500&q=80", price: "2,800", tag: "AI MATCH" }
            ]);
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="canva-wrapper">
            <div className="glow-effect" style={{ backgroundColor: favColor }}></div>
            
            <div className="app-container">
                <header className="app-header">
                    <span className="badge-ai" style={{ color: favColor, backgroundColor: `${favColor}20` }}>✨ AI ASSISTANT</span>
                    <h1>Find your next <span style={{ color: favColor }}>escape</span>.</h1>
                </header>

                <div className="search-pill-wrapper">
                    <form onSubmit={handleSearch} className="pill-form">
                        <div className="field">
                            <SvgLocation />
                            <input type="text" placeholder="Where to?" value={city} onChange={(e)=>setCity(e.target.value)} required />
                        </div>
                        <div className="field divider">
                            <SvgPalette />
                            <select value={favColor} onChange={(e)=>setFavColor(e.target.value)}>
                                <option value="#8b3dff">Purplicious</option>
                                <option value="#00c4cc">Ocean Teal</option>
                                <option value="#ff4f4f">Sunset Red</option>
                            </select>
                        </div>
                        <button type="submit" className="pill-btn" style={{ backgroundColor: favColor }}>
                            {loading ? <div className="spinner"></div> : <><SvgSearch /> <span>Search</span></>}
                        </button>
                    </form>
                </div>

                <div className="main-layout">
                    <section className="results-grid">
                        <div className="cards-wrapper">
                            {recommendations.length > 0 ? recommendations.map(h => (
                                <div key={h.id} className="hotel-card">
                                    <div className="card-img" style={{ backgroundImage: `url(${h.img})` }}>
                                        <span className="card-tag">{h.tag}</span>
                                    </div>
                                    <div className="card-content">
                                        <h3>{h.name}</h3>
                                        <p>{city} • <b>{h.price} DH</b></p>
                                    </div>
                                </div>
                            )) : (
                                <div className="empty-state">No results yet. Start searching to see magic.</div>
                            )}
                        </div>
                    </section>

                    <aside className="sidebar">
                        <div className="side-card">
                            <h3>🌤️ Weather</h3>
                            <div className="w-flex">
                                <span className="temp" style={{ color: favColor }}>24°</span>
                                <p>Clear Skies</p>
                            </div>
                        </div>
                        <div className="side-card">
                            <h3>💡 AI Tip</h3>
                            <p>Booking on Tuesdays usually gets you the best creative suites.</p>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default HotelAIFinder;