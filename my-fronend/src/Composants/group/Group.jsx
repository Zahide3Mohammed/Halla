import { useState, useEffect } from "react";
import axios from "axios";
import "./Group.css";
import { useNavigate } from 'react-router-dom';
import echo from './echo';

function Group() {
 const [availableGroups, setAvailableGroups] = useState([]); // السمية بقات هي هي
  const [activeTab, setActiveTab] = useState('evente'); 
  const navigate = useNavigate();
  const [errors, setErrors] = useState({})
  const [filterColor, setFilterColor] = useState(null);
  const [activeGroup, setActiveGroup] = useState(null); // null كتعني عرض كلشي
  // زيد هاد السطر مع الـ states الآخرين لفوق
const [serverError, setServerError] = useState("");

  const [form, setForm] = useState({
    name: "",
    type_group: "Même color", // بدلها باش تطابق الـ Option والـ Controller
    start_date: "",
    start_time: "",
    end_time: "",
    suggestion: "",
    nationality_type: "same", // بدلها لـ same
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
      // تصحيح: استخدام setAvailableGroups اللي عرفناها لفوق
      setAvailableGroups(res.data.filter(g => g.users_count < 5));
    } catch (err) {
      console.error("خطأ في جلب المجموعات", err);
    }
  };

  const createGroup = async () => {
  const currentToken = sessionStorage.getItem("token");
  const data = new FormData();
  // تأكد أن الحقول عامرة قبل الإرسال
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
        'Accept': 'application/json', // ضروري باش Laravel يجاوبك بـ JSON ماشي HTML
      }
    });
    alert("Succès!");
    setActiveTab('evente');
    fetchGroups();
  } catch (err) {
    console.log("Full Error Response:", err.response?.data);
    
    const serverErrors = err.response?.data?.errors;
    if (serverErrors) {
        // كنجيبو أول خطأ ونحطوه في الـ State
        const firstError = Object.values(serverErrors)[0][0];
        setServerError(firstError);
    } else {
        // إذا كان خطأ عام (مثلاً 500 أو 401)
        setServerError(err.response?.data?.message || "Erreur de connexion au serveur");
    }
    
    // إخفاء الخطأ أوتوماتيكياً بعد 5 ثواني (اختياري)
    setTimeout(() => setServerError(""), 5000);
}
};
  const joinGroup = async (id) => {
    try {
      const token = sessionStorage.getItem('token'); 
      const response = await axios.post(`http://localhost:8000/api/groups/${id}/join`, {}, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
      });

      alert("تم الانضمام!");
      const updatedGroup = response.data.group;

      if (updatedGroup && updatedGroup.users_count >= 5) {
setActiveGroup(res.data.group);
      } else {
        fetchGroups();
      }
    } catch (error) {
      alert(error.response?.data?.message || "فشل الانضمام");
    }
  };
  if (activeGroup) {
    return <Chat 
             groupId={activeGroup.id} 
             groupName={activeGroup.name} 
             suggestion={activeGroup.suggestion} 
             onBack={() => setActiveGroup(null)} 
           />;
}

  useEffect(() => { fetchGroups(); }, []);
  // partie chat
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
// partie websocite
useEffect(() => {
    // التسمع للقناة العمومية
    echo.channel('groups-channel')
      .listen('.group.added', (data) => {
        console.log("جروب جديد وصل:", data.group);
        
        // إضافة الجروب الجديد في أول القائمة
        setAvailableGroups((prev) => [data.group, ...prev]);
      });

    // تنظيف الاتصال عند مغادرة الصفحة
    return () => {
      echo.leaveChannel('groups-channel');
    };
  }, []);

  return (
    <div className="sketch-app-container">
      <div className="main-content">
        {activeTab === 'evente' ? (
          /* --- STUPE 1: واجهة العرض (كل شيء أخضر وبالبحث) --- */
          <div className="evente">
            {/* الهيدر مع البحث والتبويبات داخل قسم الـ Evente فقط */}
            <div className="sketch-header">
              <div className="search-wrapper">
                <input type="text" placeholder="Recherche par lieu" className="sketch-search-input" />
              </div>
              <div className="tab-buttons">
                <button 
                  className={`tab-btn ${activeTab === 'evente' ? 'active-green' : ''}`}
                  onClick={() => setActiveTab('evente')}
                >
                  Evente
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'create' ? 'active-pink' : ''}`}
                  onClick={() => setActiveTab('create')}
                >
                  creer Group
                </button>
              </div>
            </div>

           <div className="filter-tags">
         <span className="tiny-label" style={{ cursor: 'pointer', fontWeight: !filterColor ? 'bold' : 'normal' }} onClick={() => setFilterColor(null)} >All
          </span>{['red', 'green', 'yellow', 'blue', 'purple'].map(color => ( <button key={color}  className={`color-tag ${color} ${filterColor === color ? 'selected-border' : ''}`} onClick={() => setFilterColor(color)}
          >
           {color}
            </button>
           ))}
                 </div>

            <div className="evente-grid">
              <div className="cards-scrollable">
               {availableGroups
    .filter(group => !filterColor || group.creator?.color === filterColor) // الفلتر السحري
    .map(group => (
                  <div className="sketch-card-horizontal" key={group.id}>
                    <div className="card-image-section"><img src={`http://localhost:8000/storage/${group.image_event}`} alt="Group Event" onError={(e) => e.target.src = "https://via.placeholder.com/150"} /></div>
                    <div className="card-info-section">
                      <h3 className="group-name-title">{group.name}</h3>
                      <p className="suggestion-label">Suggestion du jour:{group.suggestion}</p>
                      <div className="meta-row">
                        <div className="meta-data">
                          <p>date: {group.start_date}</p>
                          <p>derur: {group.start_time}</p>
                          <p>lieu: {group.lieu_event}</p>
                        </div>
                        <div className="meta-action">
                          <span className="count-label"> 👥 {group.users_count}/5</span>
                          <button className="rejoindre-btn-green" onClick={() => joinGroup(group.id)}>Rejoindre</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="map-sidebar">
                <div className="sketch-map-placeholder">map</div>
              </div>
            </div>
          </div>
        ) : (
          /* --- STUPE 2: واجهة الإنشاء (بدون الهيدر الأخضر) --- */
          <div className="create-view animate-fade">
            {/* هنا يمكن إضافة زر بسيط للعودة أو تبويبات بسيطة إذا أردت، لكن حالياً هي "نقية" كما طلبت */}
            <h1 className="create-title-pink">Créer un groupe</h1>
            <div className="create-layout-split">
              <div className="form-column">
                <div className="sketch-field">
                  <label>Nom du groupe</label>
                  <input name="name" onChange={handleChange} className="sketch-input" />
                  {errors.name && <span className="error-text">{errors.name[0]}</span>}
                </div>
                <div className="sketch-field">
                  <label>type group:</label>
                  <select name="type_group" onChange={handleChange} className="sketch-input">
                    <option  value={"Même color"}>Même personnalité</option>
                    <option value={"color different"}>Personnage de Changeur</option>
                  </select>
                  
      {errors.type_group && <span className="error-text">{errors.type_group[0]}</span>}

                </div>
                <div className="sketch-field">
                  <label>Date de début</label>
                  <input type="date" name="start_date" onChange={handleChange} className="sketch-input" />
                </div>
                <div className="field-row-time">
                  <label>Heure de début</label> <input type="time" name="start_time" onChange={handleChange} className="small-input" />
                  <label>heure de fin</label> <input type="time" name="end_time" onChange={handleChange} className="small-input" />
                </div>
                <div className="sketch-field">
                  <label>Suggestion du jour:</label>
                  <textarea name="suggestion" onChange={handleChange} className="sketch-textarea"></textarea>
                </div>
                <div className="sketch-field">
                  <label>Type de nationalité</label>
                  <select name="nationality_type" onChange={handleChange} className="sketch-input">
                    <option value={'same'}>Même nationalité</option>
                    <option value={'different'}>nationalités différentes</option>
                  </select>
                </div>
                <div className="sketch-field">
                  <label>Lieu de l'événement</label>
                  <input name="lieu_event" onChange={handleChange} className="sketch-input" />
                </div>
              <div className="sketch-field">
      <label>Image de l'événement</label>
  <input 
    type="file" 
    id="event-image-upload" 
    name="image_event" 
        accept="image/*"
              onChange={handleChange}
                 style={{ display: 'none' }} // إخفاء حقل الإدخال الافتراضي البشع
  />
  <label htmlFor="event-image-upload" className="big-plus-upload">
    {form.image_event ? (
      <span className="file-name-ready">✅ {form.image_event.name}</span>
    ) : (
      "+"
    )}
  </label>
</div>
{serverError && (
    <div className="error-message-banner">
        ⚠️ {serverError}
    </div>
)}
                <div className="form-actions-bottom">
                  <button className="btn-annuler-pink" onClick={() => setActiveTab('evente')}>Annuler</button>
                  <button className="btn-cree-green" onClick={createGroup}>crée</button>
                </div>
              </div>

              <div className="ai-column">
                <div className="ai-box-wrapper">
                  <h1 className="ai-title">Conseil en IA</h1><div className="ai-suggestion-box-sketch">
      <div className="ai-chat-simulation">
                 {messages.map((msg,i)=>(
               <div key={i} className={msg.type === "ai" ? "ai-msg" : "user-msg"}>
             {msg.type === "ai" && <div className="ai-avatar">🤖</div>}
             <div className={msg.type === "ai" ? "bubble-grey" : "bubble-white"}>
          {msg.text}
</div>

</div>
))}

</div>
                   <div className="ai-input-bar"> <input value={input} onChange={(e)=>setInput(e.target.value)}placeholder="Ask AI..."/><button onClick={sendMessage}>➤</button></div>
                  </div>
                </div>
                
                <h3 className="h3">Rejoignez un groupe aléatoire</h3>
               <div className="random-group-box-sketch">
 
  <div className="group-icon">🎲</div>

 

  <p>
    Vous pouvez rejoindre un groupe aléatoire de personnes ayant la même personnalité que vous.
  </p>

  <div className="group-users">
   <span>👥 {availableGroups.users_count}/5</span>
  </div>
 

  <button className="btn-rejoin-large">
    🎲 Rejoindre le groupe
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