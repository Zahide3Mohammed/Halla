import { useState, useEffect } from "react";
import axios from "axios";
import "./Group.css";
import { useNavigate } from 'react-router-dom';
import echo from './echo';

function Group() {
 const [availableGroups, setAvailableGroups] = useState([]); 
  const [activeTab, setActiveTab] = useState('evente'); 
  const navigate = useNavigate();
  const [errors, setErrors] = useState({})
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
      const res = await axios.get("http://localhost:8000/api/groups");
      // 🔥 تحديث: تصفية المجموعات باش ميبانوش "Salons" ويكون العدد أقل من 5
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
  if (form.image_event) {
    data.append("image_event", form.image_event);
  }
  try {
    const response = await axios.post("http://localhost:8000/api/groups", data, {
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
      const response = await axios.post(`http://localhost:8000/api/groups/${id}/join`, {}, {
        headers: { Authorization: `Bearer ${token}`, 
        Accept: "application/json" }
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

  
  const [messages,setMessages] = useState([
    {type:"ai",text:"Ils peuvent vous aider with Suggestion du jou."},
    {type:"ai",text:"Indiquez-moi simplement l'heure et le lieu."}
  ]);

const [input,setInput] = useState("");

const sendMessage = () => {
if(!input) return;
setMessages([
...messages,
{type:"user",text:input},
{type:"ai",text:"Merci ! Je vais vous proposer une suggestion."}
]);
setInput("");
};


  // parte Rejoignez un groupe aléatoire
  const joinRandomGroup = async () => {
  try {
    const token = sessionStorage.getItem('token');
    const response = await axios.post("http://localhost:8000/api/groups/random-join", {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const group = response.data.group;
 setPendingRandomGroup(group);

    // إيلا كمل الجروب (5/5) ديه نيشان للشات
    if (group.users_count >= 5) {
      navigate(`/chat/${group.id}`);
    } else {
      // إيلا مزال، تقدر تخليه يتسنى أو تطلع ليه ميساج
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

            // 1. تحديث قائمة المجموعات (Evente Tab)
            setAvailableGroups((prev) => {
                // إيلا كان صالون، ما يبانش في القائمة العامة
                if (updatedGroup.name.startsWith("Salon")) {
                    return prev.filter(g => g.id !== updatedGroup.id);
                }

                // إيلا كمل 5، نحيدوه من القائمة
                if (updatedGroup.users_count >= 5) {
                    return prev.filter(g => g.id !== updatedGroup.id);
                }

                // تحديث المجموعة إيلا كانت ديجا كاين أو زيادتها
                const index = prev.findIndex(g => g.id === updatedGroup.id);
                if (index > -1) {
                    const newGroups = [...prev];
                    newGroups[index] = updatedGroup;
                    return newGroups;
                }
                return [updatedGroup, ...prev];
            });

            // 2. تحديث الصالون العشوائي (Pending Group)
            setPendingRandomGroup(prev => {
                if (prev && prev.id === updatedGroup.id) {
                    // إيلا وصل 5، التوجيه للشات
                    if (updatedGroup.users_count >= 5) {
                        setTimeout(() => navigate(`/chat/${updatedGroup.id}`), 1000);
                    }
                    return { ...updatedGroup }; // تحديث مع الحفاظ على المرجعية
                }
                return prev;
            });
        });

    return () => echo.leaveChannel('groups-channel');
}, [navigate]);

const fetchMyCurrentSalon = async () => {
  try {
    const token = sessionStorage.getItem('token');
    // هاد الـ Route خاصك تزيدو في Laravel يجيب آخر صالون دخل ليه اليوزر اليوم ومزال ما كملش
    const res = await axios.get("http://localhost:8000/api/my-current-salon", {
      headers: { Authorization: `Bearer ${token}` }
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
  fetchMyCurrentSalon(); // عيط ليها هنا
}, []);
  return (
    <div className="sketch-app-container_grp">
      <div className="main-content_grp">
        {activeTab === 'evente' ? (
          <div className="evente_grp">
            <div className="sketch-header_grp">
              <div className="search-wrapper_grp">
                <input type="text" placeholder="Recherche par lieu" className="sketch-search-input_grp" />
              </div>
              <div className="tab-buttons_grp">
                <button 
                  className={`tab-btn_grp ${activeTab === 'evente' ? 'active-green_grp' : ''}`}
                  onClick={() => setActiveTab('evente')}
                >
                  Evente
                </button>
                <button 
                  className={`tab-btn_grp ${activeTab === 'create' ? 'active-pink_grp' : ''}`}
                  onClick={() => setActiveTab('create')}
                >
                  creer Group
                </button>
              </div>
            </div>

           <div className="filter-tags_grp">
         <span className="tiny-label_grp" style={{ cursor: 'pointer', fontWeight: !filterColor ? 'bold' : 'normal' }} onClick={() => setFilterColor(null)} >All
          </span>{['red', 'green', 'yellow', 'blue', 'purple'].map(color => ( <button key={color}  className={`color-tag_grp ${color} ${filterColor === color ? 'selected-border_grp' : ''}`} onClick={() => setFilterColor(color)}
          >
           {color}
            </button>
            ))}
                  </div>

            <div className="evente-grid_grp">
              <div className="cards-scrollable_grp">
               {availableGroups
                .filter(group => !filterColor || group.creator?.color === filterColor)
                .map(group => (
                  <div className="sketch-card-horizontal_grp" key={group.id}>
                    <div className="card-image-section_grp"><img src={`http://localhost:8000/storage/${group.image_event}`} alt="Group Event" onError={(e) => e.target.src = "https://via.placeholder.com/150"} /></div>
                    <div className="card-info-section_grp">
                      <h3 className="group-name-title_grp">{group.name}</h3>
                      <p className="suggestion-label_grp">Suggestion du jour:{group.suggestion}</p>
                      <div className="meta-row_grp">
                        <div className="meta-data_grp">
                          <p>date: {group.start_date}</p>
                          <p>derur: {group.start_time}</p>
                          <p>lieu: {group.lieu_event}</p>
                        </div>
                        <div className="meta-action_grp">
<span className="count-label_grp"> 👥 {group.users_count ?? 0}/5</span>                          <button className="rejoindre-btn-green_grp" onClick={() => joinGroup(group.id)}>Rejoindre</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="map-sidebar_grp">
                <div className="sketch-map-placeholder_grp">map</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="create-view_grp animate-fade_grp">
            <h1 className="create-title-pink_grp">Créer un groupe</h1>
            <div className="create-layout-split_grp">
              <div className="form-column_grp">
                <div className="sketch-field_grp">
                  <label>Nom du groupe</label>
                  <input name="name" onChange={handleChange} className="sketch-input_grp" />
                  {errors.name && <span className="error-text_grp">{errors.name[0]}</span>}
                </div>
                <div className="sketch-field_grp">
                  <label>type group:</label>
                  <select name="type_group" onChange={handleChange} className="sketch-input_grp">
                    <option  value={"Même color"}>Même personnalité</option>
                    <option value={"color different"}>Personnage de Changeur</option>
                  </select>
                  {errors.type_group && <span className="error-text_grp">{errors.type_group[0]}</span>}
                </div>
                <div className="sketch-field_grp">
                  <label>Date de début</label>
                  <input type="date" name="start_date" onChange={handleChange} className="sketch-input_grp" />
                </div>
                <div className="field-row-time_grp">
                  <label>Heure de début</label> <input type="time" name="start_time" onChange={handleChange} className="small-input_grp" />
                  <label>heure de fin</label> <input type="time" name="end_time" onChange={handleChange} className="small-input_grp" />
                </div>
                <div className="sketch-field_grp">
                  <label>Suggestion du jour:</label>
                  <textarea name="suggestion" onChange={handleChange} className="sketch-textarea_grp"></textarea>
                </div>
                <div className="sketch-field_grp">
                  <label>Type de nationalité</label>
                  <select name="nationality_type" onChange={handleChange} className="sketch-input_grp">
                    <option value={'same'}>Même nationalité</option>
                    <option value={'different'}>nationalités différentes</option>
                  </select>
                </div>
                <div className="sketch-field_grp">
                  <label>Lieu de l'événement</label>
                  <input name="lieu_event" onChange={handleChange} className="sketch-input_grp" />
                </div>
              <div className="sketch-field_grp">
      <label>Image de l'événement</label>
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
      "+"
    )}
  </label>
</div>
{serverError && (
    <div className="error-message-banner_grp">
        ⚠️ {serverError}
    </div>
)}
                <div className="form-actions-bottom_grp">
                  <button className="btn-annuler-pink_grp" onClick={() => setActiveTab('evente')}>Annuler</button>
                  <button className="btn-cree-green_grp" onClick={createGroup}>crée</button>
                </div>
              </div>

              <div className="ai-column_grp">
                <div className="ai-box-wrapper_grp">
                  <h1 className="ai-title_grp">Conseil en IA</h1><div className="ai-suggestion-box-sketch_grp">
      <div className="ai-chat-simulation_grp">
                 {messages.map((msg,i)=>(
               <div key={i} className={msg.type === "ai" ? "ai-msg_grp" : "user-msg_grp"}>
             {msg.type === "ai" && <div className="ai-avatar_grp">🤖</div>}
             <div className={msg.type === "ai" ? "bubble-grey_grp" : "bubble-white_grp"}>
          {msg.text}
</div>
</div>
))}
</div>
                   <div className="ai-input-bar_grp"> <input value={input} onChange={(e)=>setInput(e.target.value)}placeholder="Ask AI..."/><button onClick={sendMessage}>➤</button></div>
                  </div>
                </div>
                
               <h3 className="h3_grp">Rejoignez un groupe aléatoire</h3>
<div className="random-group-box-sketch_grp">
  <div className="group-icon_grp">
    {pendingRandomGroup?.users_count >= 5 ? "🚀" : "🎲"}
  </div>
  <p>
    {pendingRandomGroup 
      ? `Vous êtes dans le salon "${pendingRandomGroup.name}".`
      : "Vous pouvez rejoindre un groupe aléatoire de personnes ayant la même personnalité que vous."
    }
  </p>
  
  <div className="group-users_grp">
   <span className={pendingRandomGroup?.users_count >= 5 ? "text-success" : ""}>
        👥 {pendingRandomGroup?.users_count || 0}/5
    </span>
  </div>

  <button 
    className="btn-rejoin-large_grp" 
    onClick={joinRandomGroup} // 🔥 ربط الدالة بالزر
disabled={pendingRandomGroup !== null}  >
    {pendingRandomGroup ? "En attente..." : "🎲 Rejoindre le groupe"}
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