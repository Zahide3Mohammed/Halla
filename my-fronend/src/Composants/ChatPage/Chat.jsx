import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Chat.css";
import echo from "../group/echo";
import { useAuth } from "../../context/AuthContext";


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
  const [activeTab, setActiveTab] = useState("amis"); // 'amis' or 'groups'

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
    const optimisticMessage = {
      id: Date.now(),
      message: input,
      user_id: user?.id,
      user: user, 
      image: previewUrl,
      created_at: new Date().toISOString(),
      isSending: true, 
    };

    setMessages(prev => [...prev, optimisticMessage]);
    const currentInput = input; 
    setInput("");
    setSelectedFile(null);
    setPreviewUrl(null);
    setTimeout(scrollToBottom, 50);

    const formData = new FormData();
    formData.append("message", currentInput);
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
      setMessages(prev => 
        prev.map(msg => msg.id === optimisticMessage.id ? res.data : msg)
      );
    } catch (err) {
      console.error(err);
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      setInput(currentInput);
    }
  };

  return (
    <div className="AuthX_AppContainer_55"
    style={{"--user-main-color": user?.color || "#6366f1"}}>

      {/* LEFT SIDEBAR */}
      <aside className="AuthX_SidebarLeft_55">
        <h2 className="AuthX_SidebarTitle_55">Mes Chats</h2>
        
        {/* Buttons Amis/Groups */}
        <div className="AuthX_TabButtons_55">
          <button 
            className={`AuthX_TabBtn_55 ${activeTab === 'amis' ? 'active' : ''}`}
            onClick={() => setActiveTab('amis')}>Amis</button>
          <button 
            className={`AuthX_TabBtn_55 ${activeTab === 'groups' ? 'active' : ''}`}
            onClick={() => setActiveTab('groups')}>Groupes</button>
        </div>

        <div className="AuthX_GroupsList_55">
          {myGroups
            .filter(g => activeTab === 'amis' ? g.type === 'private' : g.type !== 'private')
            .map(group => (
            <div
              key={group.id}
              className={`AuthX_GroupItem_55 ${selectedGroup?.id === group.id ? "AuthX_Active_55" : ""}`}
              onClick={() => setSelectedGroup(group)}>
              <img src={`http://localhost:8000/storage/${group.image_event}`} className="AuthX_AvatarSm_55" alt="group"/>
              <div className="AuthX_GroupInfo_55">
                <p className="AuthX_Name_55">{group.prenom}</p>
                <p className="AuthX_Status_55">{activeTab === 'amis' ? 'En ligne' : `${group.users?.length || 0} membres`}</p>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* CHAT WINDOW */}
      <main className="AuthX_ChatWindow_55">
        <header className="AuthX_ChatHeader_55">
          {selectedGroup && (
            <div className="AuthX_HeaderProfile_55">
              <img src={`http://localhost:8000/storage/${selectedGroup.image_event}`} className="AuthX_HeaderAvatar_55" alt="profile" />
              <h3 className="AuthX_HeaderTitle_55">{selectedGroup.prenom || "Chat"}</h3>
            </div>
          )}
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
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
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