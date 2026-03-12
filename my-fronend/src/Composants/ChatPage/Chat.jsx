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
  const [myGroups, setMyGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /* LOAD GROUPS */
  useEffect(() => {
    axios.get("http://localhost:8000/api/my-completed-groups", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setMyGroups(res.data);
      if (res.data.length > 0) {
        setSelectedGroup(res.data[0]);
      }
    });
  }, []);

  /* LOAD MESSAGES & ECHO */
  useEffect(() => {
    if (!selectedGroup) return;

    axios.get(`http://localhost:8000/api/groups/${selectedGroup.id}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setMessages(res.data);
      setTimeout(scrollToBottom, 100);
    });

    const channel = echo.private(`chat.${selectedGroup.id}`);

    channel.listen(".message.sent", (e) => {
      setMessages((prev) => {
        const isDuplicate = prev.some((msg) => msg.id === e.message.id);
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
  }, [selectedGroup?.id, user?.id, token]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

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
    <div className="AuthX_AppContainer_55">
      {/* LEFT SIDEBAR */}
      <aside className="AuthX_SidebarLeft_55">
        <h2 className="AuthX_SidebarTitle_55">Mes Chats</h2>
        <div className="AuthX_GroupsList_55">
          {myGroups.map(group => (
            <div
              key={group.id}
              className={`AuthX_GroupItem_55 ${selectedGroup?.id === group.id ? "AuthX_Active_55" : ""}`}
              onClick={() => setSelectedGroup(group)}>
              <img src={`http://localhost:8000/storage/${group.image_event}`} className="AuthX_AvatarSm_55" alt="group"/>
              <div className="AuthX_GroupInfo_55">
                <p className="AuthX_Name_55">{group.prenom}</p>
                <p className="AuthX_Status_55">En ligne</p>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* CHAT WINDOW */}
      <main className="AuthX_ChatWindow_55">
        <header className="AuthX_ChatHeader_55">
          <h3 className="AuthX_HeaderTitle_55">{selectedGroup?.name || "Sélectionnez un chat"}</h3>
        </header>
        <div className="AuthX_MessagesArea_55">
          {messages.map(m => {
            const isMe = m.user_id === user?.id;
            return (
              <div key={m.id} className={`AuthX_MsgRow_55 ${isMe ? "AuthX_Me_55" : "AuthX_NotMe_55"}`}>
                {!isMe && (
                  <img src={m.user?.photo ? `http://localhost:8000/storage/${m.user.photo}` : "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} 
                    className="AuthX_MsgAvatar_55" alt="user"
                    onError={(e) => { e.target.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"; }}
                  />
                )}
                <div className="AuthX_MsgContent_55">
                  <div className="AuthX_MsgBubble_55">
                    {m.type === "image" && (
                      <img src={`http://localhost:8000/storage/${m.file_path}`} className="AuthX_ChatImg_55" alt="sent" />
                    )}
                    {m.content && <p className="AuthX_MsgText_55">{m.content}</p>}
                  </div>
                  <span className="AuthX_MsgTime_55">
                    {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        <div className="AuthX_InputContainer_55">
          {previewUrl && (
            <div className="AuthX_ImagePreview_55">
              <img src={previewUrl} className="AuthX_PreviewImg_55" alt="preview" />
              <button className="AuthX_ClosePreview_55" onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}>×</button>
            </div>
          )}
          <div className="AuthX_InputPill_55">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: "none" }} accept="image/*" />
            <button className="AuthX_IconBtn_55" onClick={() => fileInputRef.current.click()}>
              <IconImage />
            </button>
            <input
              value={input}
              className="AuthX_MainInput_55"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Écrivez un message..."
            />
            <button onClick={handleSend} className="AuthX_BtnSend_55">
              <IconSend />
            </button>
          </div>
        </div>
      </main>

      {/* RIGHT SIDEBAR */}
      <aside className="AuthX_SidebarRight_55">
        {selectedGroup && (
          <>
            <div className="AuthX_GoalCard_55">
              <span className="AuthX_GoalLabel_55">SUGGESTION DU JOUR</span>
              <div className="AuthX_GoalContent_55">
                <div className="AuthX_GoalIcon_55">🎯</div>
                <p className="AuthX_GoalText_55">{selectedGroup.suggestion}</p>
              </div>
            </div>
            <div className="AuthX_MembersSection_55">
              <h4 className="AuthX_SectionTitle_55">Membres ({selectedGroup.users?.length || 0})</h4>
              <div className="AuthX_MembersList_55">
                {selectedGroup.users?.map(u => (
                  <div key={u.id} className="AuthX_MemberItem_55">
                    <div className="AuthX_AvatarWrapper_55">
                      <img src={u.photo ? `http://localhost:8000/storage/${u.photo}` : "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} alt={u.prenom} className="AuthX_MemberImg_55" />
                      <span className="AuthX_OnlineDot_55"></span>
                    </div>
                    <span className="AuthX_MemberName_55">{u.nom} {u.prenom}</span>
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