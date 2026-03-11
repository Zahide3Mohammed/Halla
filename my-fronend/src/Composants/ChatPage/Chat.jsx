import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Chat.css";
import echo from "../group/echo";
import { useAuth } from "../../context/AuthContext";
/* ICONS */
const IconSend = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);
const IconImage = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);
export default function Chat() {
  const { user, token } = useAuth();
  // les group dyle le user
  const [myGroups, setMyGroups] = useState([]);
  // les group le khtrhom
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  const [messages, setMessages] = useState([]);
  // le message le ktba le user
  const [input, setInput] = useState("");
  // le image le aysfth le user
  const [selectedFile, setSelectedFile] = useState(null);
  // dayl image
  const [previewUrl, setPreviewUrl] = useState(null);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  // kola ma ja message jdida chta kyhbt l thta
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /* LOAD GROUPS  min ktfth le page  kyjib le group dyla user mn laravel*/
  useEffect(() => {
    axios.get("http://localhost:8000/api/my-completed-groups", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
// ou kihtha f myGroups
      setMyGroups(res.data);
      if (res.data.length > 0) {
        setSelectedGroup(res.data[0]);
      }

    });

  }, []);

 /* LOAD MESSAGES  hda kyjib le message par id min laravile*/
useEffect(() => {
  if (!selectedGroup) return;

  axios.get(`http://localhost:8000/api/groups/${selectedGroup.id}/messages`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => {
    setMessages(res.data);
    setTimeout(scrollToBottom, 100);
  });
// kychrk f channel dile group
  const channel = echo.private(`chat.${selectedGroup.id}`);

  channel.listen(".message.sent", (e) => {
    setMessages((prev) => {
      // 💡 الحل الذكي: كنقلبو واش الميساج ديجا كاين بـ ID ديالو
      const isDuplicate = prev.some((msg) => msg.id === e.message.id);
      
      // إيلا كان الميساج جديد وماشي ديالي (أو حتى إيلا كان ديالي وما تزيدش بـ Axios لسبب ما)
      if (!isDuplicate && String(e.message.user_id) !== String(user?.id)) {
        setTimeout(scrollToBottom, 50);
        return [...prev, e.message];
      }
      return prev;
    });
  });

  return () => {
    channel.stopListening(".message.sent");
    echo.leave(`chat.${selectedGroup.id}`);
  };
}, [selectedGroup?.id, user?.id, token]); // تأكد أن التوكن و ID داخلين هنا

  /* IMAGE SELECT  arsal image  */

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));

  };
  /* SEND MESSAGE arsal message le db image text */

  const handleSend = async () => {
    if (!selectedGroup || (!input.trim() && !selectedFile)) return;
    const formData = new FormData();
    formData.append("message", input);
    if (selectedFile) {
      formData.append("image", selectedFile);
    }
    try {
      const res = await axios.post(
        `http://localhost:8000/api/groups/${selectedGroup.id}/messages`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setMessages(prev => [...prev, res.data]);

      setInput("");
      setSelectedFile(null);
      setPreviewUrl(null);

      setTimeout(scrollToBottom, 100);

    } catch (err) {

      console.error(err);

    }

  };


  return (
    <div className="app-container">

      {/* LEFT SIDEBAR */}

      <aside className="sidebar-left">

        <h2 className="sidebar-title">Mes Chats</h2>

        <div className="groups-list">
 {/*  afficher les group */}
          {myGroups.map(group => (
            <div
              key={group.id}
              className={`group-item ${selectedGroup?.id === group.id ? "active" : ""}`}
              onClick={() => setSelectedGroup(group)}>
              <img src={`http://localhost:8000/storage/${group.image_event}`} className="avatar-sm" alt="group"/>
                 <div className="group-info">
                <p className="name">{group.prenom}</p>
                <p className="status">En ligne</p>
              </div>
            </div>))}</div>
</aside>

      {/* CHAT WINDOW */}
      <main className="chat-window">
        <header className="chat-header">
          <h3>{selectedGroup?.name || "Sélectionnez un chat"}</h3>
        </header>
        <div className="messages-area">
           {/* afficher le message */}
          {messages.map(m => {
             {/* thdid message dyli mn dyla  user akhour */}
const isMe = m.user_id === user?.id;
return (<div key={m.id}  className={`msg-row ${isMe ? "me" : "not-me"}`}>
     {!isMe && (
      <img src={  m.user?.photo ? `http://localhost:8000/storage/${m.user.photo}` 
      : "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}className="msg-avatar"alt="user"
            // إضافة onerror باش إيلا كانت التصويرة فيها مشكل ما يبقاش الفراغ
                    onError={(e) => { e.target.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"; }}
                />
            )}

                <div className="msg-content">
                  <div className="msg-bubble">
                     {/* afiiche  image  f chat */}
                    {m.type === "image" && (
                      <img src={`http://localhost:8000/storage/${m.file_path}`}className="chat-img" alt="sent"
                      />
                    )}

                    {m.content && <p>{m.content}</p>}

                  </div>

                  <span className="msg-time">
                     {/*time dyla message */}
                    {new Date(m.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>

                </div>

              </div>

            );

          })}

          <div ref={messagesEndRef} />

        </div>

        {/* INPUT */}

        <div className="input-container">
           {/*  image ktban 9ble mtsyft l image */}

          {previewUrl && (

            <div className="image-preview">

              <img src={previewUrl} alt="preview" />

              <button
                className="close-preview"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
              >
                ×
              </button>

            </div>

          )}

          <div className="input-pill">

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
              accept="image/*"
            />

            <button
              className="icon-btn"
              onClick={() => fileInputRef.current.click()}
            >
              <IconImage />
            </button>
 {/* irsal b enter */}
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Écrivez un message..."
            />

            <button
              onClick={handleSend}
              className="btn-send"
            >
              <IconSend />
            </button>

          </div>

        </div>

      </main>

      {/* RIGHT SIDEBAR */}

      <aside className="sidebar-right">
        {/* sidebar affiche le group */}

        {selectedGroup && (

          <>
            <div className="goal-card">
              <span className="goal-label">
                SUGGESTION DU JOUR
              </span>

              <div className="goal-content">

                <div className="goal-icon">🎯</div>

                <p>{selectedGroup.suggestion}</p>

              </div>

            </div>

            <div className="members-section">

              <h4 className="section-title">
                Membres ({selectedGroup.users?.length || 0})
              </h4>

              <div className="members-list">

                {selectedGroup.users?.map(u => (

                  <div key={u.id} className="member-item">

                    <div className="avatar-wrapper">

                      <img
                        src={
                          u.photo
                            ? `http://localhost:8000/storage/${u.photo}`
                            : "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                        }
                        alt={u.prenom}
                      />

                      <span className="online-dot"></span>

                    </div>

                    <span className="member-name">
                      {u.nom} {u.prenom}
                    </span>

                  </div>

                ))}

              </div>

            </div>
          </>

        )}

      </aside>

    </div>
  );
}