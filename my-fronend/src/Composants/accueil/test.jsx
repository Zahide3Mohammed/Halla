import { useState, useEffect } from "react";
import axios from "axios";
import "./Group.css";
import { Link, useNavigate} from 'react-router-dom';

function Group() {

  const [groups,setGroups] = useState([]);
  const navigate = useNavigate();

 const [form, setForm] = useState({
  name: "",
  type_group: "Même color", // قيمة افتراضية
  start_date: "",
  start_time: "",
  end_time: "",
  suggestion: "",
  nationality_type: "same"// اجعلها 'same' كقيمة افتراضية بدلاً من نص فارغ
  
});

  const handleChange=(e)=>{
    setForm({
      ...form,
      [e.target.name]:e.target.value
    });
  };

const createGroup = async () => {
  const currentToken = sessionStorage.getItem("token");
  console.log("Token used for request:", currentToken); // سطر للتأكد في Console

  try {
    const response = await axios.post("http://localhost:8000/api/groups", form, {
      headers: {
        'Authorization': `Bearer ${currentToken}`, // تأكد من وجود المسافة بعد Bearer
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    alert("Success!");
  } catch (err) {
    if (err.response?.status === 401) {
       alert("جلسة العمل انتهت، يرجى إعادة تسجيل الدخول");
    }
    console.log(err.response?.data);
  }
};
const fetchGroups = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/groups");
      // التعديل هنا: عرض المجموعات التي لم تكتمل فقط (أقل من 5)
      const availableGroups = res.data.filter(g => g.users_count < 5);
      setGroups(availableGroups);
    } catch (err) {
      console.error("خطأ في جلب المجموعات", err);
    }
  };

const joinGroup = async (id) => {
    try {
      const token = sessionStorage.getItem('token'); 

      const response = await axios.post(`http://localhost:8000/api/groups/${id}/join`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      });

      alert("تم الانضمام بنجاح!");

      // 2. التحقق من عدد الأعضاء بعد الانضمام
      // نفترض أن API يرجع بيانات المجموعة المحدثة أو نقوم بفحص الحالة محلياً
      const updatedGroup = response.data.group; // حسب ما يرجعه الـ Backend لديك

      // إذا اكتمل العدد (5/5) ننتقل للدردشة
      if (updatedGroup && updatedGroup.users_count >= 5) {
        navigate(`/Chat/${id}`); // التوجه لغرفة الدردشة الخاصة بالمجموعة
      } else {
        fetchGroups(); // تحديث القائمة إذا لم يكتمل العدد بعد
      }

    } catch (error) {
      console.error(error.response?.data);
      alert(error.response?.data?.message || "فشل الانضمام");
    }
  };

  // 3. إضافة وظيفة الدخول المباشر للمجموعات المكتملة أصلاً
  const goToChat = (id) => {
    navigate(`/chat/${id}`);
  };

  useEffect(()=>{

    fetchGroups();

  },[]);

  return (
    <div className="container">

      {/* LEFT */}
      <div className="form-section">

        <h2>Créer un groupe</h2>

        <label>Nom du groupe</label>
        <input name="name" onChange={handleChange}/>

        <label>Type group</label>
        <select name="type_group" onChange={handleChange}>
          <option value="">Select</option>
          <option value="Même color">Même color</option>
          <option value="color different">color different</option>
        </select>


        <label>Date de début</label>
        <input type="date" name="start_date" onChange={handleChange}/>

        <div className="time">

          <div>
            <label>Heure de début</label>
            <input type="time" name="start_time" onChange={handleChange}/>
          </div>

          <div>
            <label>Heure de fin</label>
            <input type="time" name="end_time" onChange={handleChange}/>
          </div>

        </div>

        <label>Suggestion du jour</label>
        <textarea name="suggestion" onChange={handleChange}></textarea>

        <label>Type de nationalité</label>
        <select name="nationality_type" onChange={handleChange}>
          <option value="same">Same</option>
          <option value="different">Different</option>
        </select>

        <div className="buttons">

          <button className="cancel">Annuler</button>

          <button className="create" onClick={createGroup}>
            Créer
          </button>

        </div>

      </div>

      {/* RIGHT */}

      <div className="groups-section">
        <h3>Groupes disponibles</h3>

        {groups.map((g) => (
          <div className="group-card" key={g.id}>
            <Link to={`/chat/${g.id}`}>{g.name}</Link>
            <p>{g.suggestion}</p>
            <p>{g.start_date}</p>

            <div className="group-footer">
              <span>👥 {g.users_count}/5</span>

              {/* 4. تغيير الزر بناءً على حالة المجموعة */}
              {g.users_count >= 5 ? (
                <button className="chat-btn" onClick={() => goToChat(g.id)} style={{backgroundColor: '#28a745'}}>
                  Aller au Chat
                </button>
              ) : (
                <button onClick={() => joinGroup(g.id)}>
                  Rejoindre
                </button>
              )}
            </div>
          </div>
        ))}
        <div>
         <h3>Conseil en IA - Suggestion du jour</h3>
          <label>IA</label>
            <input type="text" name="ia" onChange={handleChange}/>
            </div>
          <div>
         <h3>Rejoignez un groupe aléatoire</h3>
          <label>IA</label>
            <input type="text" name="ia" onChange={handleChange}/>
            </div>
      </div>
        </div>
  );
}

export default Group;