import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./Group.css";
import { useNavigate } from 'react-router-dom';
import echo from './echo';
import MapComponent from './MapComponent';
import { useAuth } from "../../context/AuthContext";
import { IconCalendar, IconCamera, IconClock, IconLightbulb, IconMapPin, IconRocket, IconSparkles, IconUser } from "../../Elementes/Icons";


function Group() {
  const { user } = useAuth();
  const brandColor = user?.color || "#3b82f6"; 

  const [availableGroups, setAvailableGroups] = useState([]); 
  const [activeTab, setActiveTab] = useState('evente'); 
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [filterColor, setFilterColor] = useState(null);
  const [activeGroup, setActiveGroup] = useState(null); 
  const [serverError, setServerError] = useState("");
  const [pendingRandomGroup, setPendingRandomGroup] = useState(null);

  const [form, setForm] = useState({
    name: "",
    type_group: "Même color",
    start_date: "",
    start_time: "",
    end_time: "",
    suggestion: "",
    nationality_type: "same",
    lieu_event: "",
    latitude: null,
    longitude: null,
    image_event: null
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image_event") {
      setForm({ ...form, image_event: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await axios.get(`/api/groups`);
      const filtered = res.data.filter(g => 
        g.users_count < 5 && 
        !g.name.startsWith("Salon")
      );
      setAvailableGroups(filtered);
    } catch (err) {
      console.error("خطأ في جلب المجموعات", err);
    }
  };

  const createGroup = async () => {
    const currentToken = sessionStorage.getItem("token");
    const data = new FormData();
    data.append("name", form.name || "");
    data.append("type_group", form.type_group);
    data.append("start_date", form.start_date || "");
    data.append("start_time", form.start_time || "");
    data.append("end_time", form.end_time || "");
    data.append("suggestion", form.suggestion || "");
    data.append("nationality_type", form.nationality_type);
    data.append("lieu_event", form.lieu_event || "");
    data.append("latitude", form.latitude || "");
    data.append("longitude", form.longitude || "");
    if (form.image_event) {
      data.append("image_event", form.image_event);
    }
    try {
      const response = await axios.post(`/api/groups`, data, {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        }
      });
      alert("Succès!");
      setActiveTab('evente');
      fetchGroups();
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) {
          const firstError = Object.values(serverErrors)[0][0];
          setServerError(firstError);
      } else {
          setServerError(err.response?.data?.message || "Erreur de connexion au serveur");
      }
      setTimeout(() => setServerError(""), 5000);
    }
  };

  const joinGroup = async (id) => {
    try {
      const token = sessionStorage.getItem('token'); 
      const response = await axios.post(`/api/groups/${id}/join`, {}, {
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Accept': "application/json",
          'Content-Type': 'application/json'
        }
      });

      alert("تم الانضمام!");
      const updatedGroup = response.data.group;

      if (updatedGroup && updatedGroup.users_count >= 5) {
        setActiveGroup(updatedGroup); 
      } else {
        fetchGroups();
      }
    } catch (error) {
      alert(error.response?.data?.message || "فشل الانضمام");
    }
  };

  const [messages, setMessages] = useState([
    { type: "ai", text: "Ils peuvent vous aider with Suggestion du jour." },
    { type: "ai", text: "Indiquez-moi simplement l'heure et le lieu." }
  ]);

  const [input, setInput] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { type: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setLoadingAI(true);

    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.post(
        `/api/ai/suggest`,
        { message: currentInput },
        { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
      );

      const aiMessage = { type: "ai", text: response.data.reply };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.log(error);
      setMessages(prev => [
        ...prev,
        { type: "ai", text: "⚠️ AI ma khdamch daba." }
      ]);
    } finally {
      setLoadingAI(false);
    }
  };

  const joinRandomGroup = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.post(`/api/groups/random-join`, {}, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': "application/json",
          'Content-Type': 'application/json'
        }
      });
      
      const group = response.data.group;
      setPendingRandomGroup(group);

      if (group.users_count >= 5) {
        navigate(`/chat/${group.id}`);
      } else {
        setActiveGroup(group); 
      }
    } catch (error) {
      alert(error.response?.data?.message || "Error");
    }
  };

  useEffect(() => {
    const channel = echo.channel('groups-channel')
        .listen('.group.added', (data) => {
            const updatedGroup = data.group;

            setAvailableGroups((prev) => {
                if (updatedGroup.name.startsWith("Salon")) {
                    return prev.filter(g => g.id !== updatedGroup.id);
                }

                if (updatedGroup.users_count >= 5) {
                    return prev.filter(g => g.id !== updatedGroup.id);
                }

                const index = prev.findIndex(g => g.id === updatedGroup.id);
                if (index > -1) {
                    const newGroups = [...prev];
                    newGroups[index] = updatedGroup;
                    return newGroups;
                }
                return [updatedGroup, ...prev];
            });

            setPendingRandomGroup(prev => {
                if (prev && prev.id === updatedGroup.id) {
                    if (updatedGroup.users_count >= 5) {
                        setTimeout(() => navigate(`/chat/${updatedGroup.id}`), 1000);
                    }
                    return { ...updatedGroup };
                }
                return prev;
            });
        });

    return () => echo.leaveChannel('groups-channel');
  }, [navigate]);

  const fetchMyCurrentSalon = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.get(`/api/my-current-salon`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': "application/json"
        }
      });
      if (res.data.group) {
        setPendingRandomGroup(res.data.group);
      }
    } catch (err) {
      console.log("No active salon found");
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchMyCurrentSalon();
  }, []);

  const MOROCCAN_CITIES = [
    { name: "Fès", lat: 34.0331, lng: -5.0003 },
    { name: "Casablanca", lat: 33.5731, lng: -7.5898 },
    { name: "Rabat", lat: 34.0209, lng: -6.8416 },
    { name: "Marrakech", lat: 31.6295, lng: -7.9811 },
    { name: "Tanger", lat: 35.7595, lng: -5.8340 },
    { name: "Agadir", lat: 30.4278, lng: -9.5981 },
    { name: "Meknès", lat: 33.8935, lng: -5.5473 },
    { name: "Oujda", lat: 34.6867, lng: -1.9114 },
    { name: "Kénitra", lat: 34.2610, lng: -6.5802 },
    { name: "Tétouan", lat: 35.5785, lng: -5.3684 },
    { name: "Safi", lat: 32.2994, lng: -9.2372 },
    { name: "El Jadida", lat: 33.2316, lng: -8.5007 }
  ];

  return (
    <div className="sketch-app-container_grp" style={{ '--user-brand-color': brandColor }}>
      <div className="main-content_grp">
        {activeTab === 'evente' ? (
          <div className="evente_grp">
            <div className="sketch-header_grp">
              <div className="search-wrapper_grp">
                <svg className="search-icon_grp" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input type="text" placeholder="Recherche par lieu..." className="sketch-search-input_grp" />
              </div>
              <div className="tab-buttons_grp">
                <button 
                  className={`tab-btn_grp ${activeTab === 'evente' ? 'active_grp' : ''}`}
                  onClick={() => setActiveTab('evente')}
                >
                  Découvrir
                </button>
                <button 
                  className={`tab-btn_grp ${activeTab === 'create' ? 'active_grp' : ''}`}
                  onClick={() => setActiveTab('create')}
                >
                  Créer un Groupe
                </button>
              </div>
            </div>

            <div className="filter-tags_grp">
              <span className={`tiny-label_grp ${!filterColor ? 'active-filter' : ''}`} onClick={() => setFilterColor(null)} >Tous les Groupes</span>
              <div className="tags-flex_grp">
                {['red', 'green', 'yellow', 'blue', 'purple'].map(color => ( 
                  <button key={color} className={`color-tag_grp ${color} ${filterColor === color ? 'selected-border_grp' : ''}`} onClick={() => setFilterColor(color)}>
                    <span className="color-dot_grp" style={{ backgroundColor: color }}></span>
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <div className="evente-grid_grp">
              <div className="cards-scrollable_grp">
                {availableGroups
                  .filter(group => !filterColor || group.creator?.color === filterColor)
                  .map(group => (
                    <div className="sketch-card-horizontal_grp" key={group.id}>
                      <div className="card-image-section_grp">
                        <img src={`/storage/${group.image_event}`} alt="Group Event" onError={(e) => e.target.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=500"} />
                        <div className="card-badge-badge_grp" style={{ backgroundColor: group.creator?.color || 'var(--user-brand-color)' }}></div>
                      </div>
                      <div className="card-info-section_grp">
                        <span className="suggestion-label_grp"><IconSparkles /> {group.suggestion || "No custom setup"}</span>
                        <h3 className="group-name-title_grp">{group.name}</h3>
                        <div className="meta-data_grp">
                          <p><span><IconCalendar /></span> {group.start_date}</p>
                          <p><span><IconClock /></span> {group.start_time}</p>
                          <p><span><IconMapPin /></span> {group.lieu_event}</p>
                        </div>
                        <div className="meta-action_grp">
                          <span className="count-label_grp"><IconUser /> <b>{group.users_count ?? 0}</b> / 5 voyageur</span>
                          <button className="rejoindre-btn-green_grp" onClick={() => joinGroup(group.id)}>Rejoindre</button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="map-sidebar_grp">
                <div className="sketch-map-placeholder_grp">
                  <MapComponent groups={availableGroups} /> 
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="create-view_grp">
            <div className="create-header-wrapper_grp">
               <h1 className="create-title-pink_grp" >Lancer une nouvelle aventure</h1>
               <p className="create-sub-grp">Remplissez les détails pour rassembler des touristes partageant les mêmes passions.</p>
            </div>
            
            <div className="create-layout-split_grp">
              <div className="form-column_grp">
                <div className="sketch-field_grp">
                  <label>Nom du groupe</label>
                  <input name="name" placeholder="Ex: Découverte de la Médina..." onChange={handleChange} className="sketch-input_grp" />
                  {errors.name && <span className="error-text_grp">{errors.name[0]}</span>}
                </div>
                
                <div className="sketch-field_grp">
                  <label>Compatibilité</label>
                  <select name="type_group" onChange={handleChange} className="sketch-input_grp">
                    <option value={"Même color"}>Même personnalité (Même Couleur)</option>
                    <option value={"color different"}>Mixte (Toutes Personnalités)</option>
                  </select>
                  {errors.type_group && <span className="error-text_grp">{errors.type_group[0]}</span>}
                </div>

                <div className="grid-form-row_grp">
                  <div className="sketch-field_grp">
                    <label>Date de début</label>
                    <input type="date" name="start_date" onChange={handleChange} className="sketch-input_grp" />
                  </div>
                  <div className="sketch-field_grp">
                    <label>Heure de début</label> 
                    <input type="time" name="start_time" onChange={handleChange} className="sketch-input_grp" />
                  </div>
                  <div className="sketch-field_grp">
                    <label>Heure de fin</label> 
                    <input type="time" name="end_time" onChange={handleChange} className="sketch-input_grp" />
                  </div>
                </div>

                <div className="sketch-field_grp">
                  <label>Suggestion d'itinéraire:</label>
                  <textarea name="suggestion" placeholder="Que voulez-vous visiter ensemble ?" onChange={handleChange} className="sketch-textarea_grp"></textarea>
                </div>

                <div className="grid-form-row_grp stacked_fields">
                  <div className="sketch-field_grp">
                    <label>Type de nationalité</label>
                    <select name="nationality_type" onChange={handleChange} className="sketch-input_grp">
                      <option value={'same'}>Même nationalité</option>
                      <option value={'different'}>Mondes et nationalités différentes</option>
                    </select>
                  </div>
                  
                  <div className="sketch-field_grp">
                    <label>Lieu de l'événement (Ville)</label>
                    <select 
                      name="lieu_event" 
                      className="sketch-input_grp"
                      value={form.lieu_event} 
                      onChange={(e) => {
                        const selectedCityName = e.target.value;
                        const cityData = MOROCCAN_CITIES.find(c => c.name === selectedCityName);
                        if (cityData) {
                          setForm(prev => ({
                            ...prev,
                            lieu_event: cityData.name,
                            latitude: cityData.lat,
                            longitude: cityData.lng
                          }));
                        }
                      }}
                    >
                      <option value="">-- Choisir une ville marocaine --</option>
                      {MOROCCAN_CITIES.map((city) => (
                        <option key={city.name} value={city.name}>{city.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="sketch-field_grp">
                  <label>Image représentative du groupe</label>
                  <input 
                    type="file" 
                    id="event-image-upload" 
                    name="image_event" 
                    accept="image/*"
                    onChange={handleChange}
                    style={{ display: 'none' }} 
                  />
                  <label htmlFor="event-image-upload" className="big-plus-upload_grp">
                    {form.image_event ? (
                      <span className="file-name-ready_grp">✅ {form.image_event.name}</span>
                    ) : (
                      <div className="uploader-flex">
                        <span><IconCamera /> Click to upload image</span>
                      </div>
                    )}
                  </label>
                </div>

                {serverError && <div className="error-message-banner_grp">⚠️ {serverError}</div>}

                <div className="form-actions-bottom_grp">
                  <button className="btn-annuler-pink_grp" onClick={() => setActiveTab('evente')}>Annuler</button>
                  <button className="btn-cree-green_grp" onClick={createGroup}>Créer l'Aventure</button>
                </div>
              </div>

              <div className="ai-column_grp">
                <div className="ai-box-wrapper_grp">
                  <h3 className="ai-title_grp"><IconLightbulb />Compagnon de voyage IA</h3>
                  <div className="ai-suggestion-box-sketch_grp">
                    <div className="ai-chat-simulation_grp">
                      {messages.map((msg, i) => (
                        <div key={i} className={msg.type === "ai" ? "ai-msg_grp" : "user-msg_grp"}>
                          <div className={msg.type === "ai" ? "bubble-grey_grp" : "bubble-white_grp"}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="ai-input-bar_grp">
                      <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Demander un itinéraire à l'IA..."
                      />
                      <button onClick={sendMessage} disabled={loadingAI}>
                        {loadingAI ? "..." : "➤"}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="random-group-box-sketch_grp">
                  <div className="group-icon_grp">
                    {pendingRandomGroup?.users_count >= 5 ? <IconRocket /> : <IconSparkles />}
                  </div>
                  <h4>Match Instantané</h4>
                  <p>
                    {pendingRandomGroup 
                      ? `Vous êtes dans le salon "${pendingRandomGroup.name}".`
                      : "Rejoignez un groupe aléatoire de voyageurs qui partagent exactement votre profil de personnalité."
                    }
                  </p>
                  
                  <div className="group-users_grp">
                    <span className="badge-pill_users">
                        👥 {pendingRandomGroup?.users_count || 0} / 5 Membres
                    </span>
                  </div>

                  <button 
                    className="btn-rejoin-large_grp" 
                    onClick={joinRandomGroup} 
                    disabled={pendingRandomGroup !== null}  
                  >
                    {pendingRandomGroup ? "Match en cours..." : "Rejoindre un Salon Auto"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Group;