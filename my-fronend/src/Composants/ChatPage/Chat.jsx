import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Chat.css";
import echo from "../group/echo";
import { useAuth } from "../../context/AuthContext";

const IconImage = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
    </svg>
);

const IconSend = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
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
    const [activeTab, setActiveTab] = useState("groups");
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = (behavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => {
        axios.get("http://localhost:8000/api/my-completed-groups", {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            setMyGroups(res.data);
            if (res.data.length > 0 && !selectedGroup) {
                setSelectedGroup(res.data[0]);
            }
        });
    }, [token]);
    useEffect(() => {
        if (!selectedGroup || !user) return;
        axios.get(`http://localhost:8000/api/groups/${selectedGroup.id}/messages`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            setMessages(res.data);
            setTimeout(() => scrollToBottom("auto"), 50);
        });
        const channelName = `chat.${selectedGroup.id}`;
        const channel = echo.private(channelName);

        channel.listen(".message.sent", (e) => {
            setMessages((prev) => {
                const exists = prev.some((msg) => msg.id === e.message.id);
                if (exists) return prev;
                if (String(e.message.user_id) !== String(user.id)) {
                    return [...prev, e.message];
                }
                return prev;
            });
            setTimeout(() => scrollToBottom("smooth"), 10);
        });

        return () => {
            echo.leave(channelName);
        };
    }, [selectedGroup?.id, user?.id, token]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };
    const handleSend = async () => {
        if (!selectedGroup || (!input.trim() && !selectedFile)) return;
        const optimisticId = Date.now();
        const optimisticMessage = {
            id: optimisticId,
            content: input,
            user_id: user.id,
            user: user,
            file_path: previewUrl, 
            type: selectedFile ? "image" : "text",
            created_at: new Date().toISOString(),
            isSending: true,
        };
        setMessages(prev => [...prev, optimisticMessage]);
        const savedInput = input;
        const savedFile = selectedFile;
        setInput("");
        setSelectedFile(null);
        setPreviewUrl(null);
        setTimeout(() => scrollToBottom("smooth"), 10);

        const formData = new FormData();
        formData.append("message", savedInput);
        if (savedFile) formData.append("image", savedFile);

        try {
            const res = await axios.post(
                `http://localhost:8000/api/groups/${selectedGroup.id}/messages`,
                formData,
                { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
            );
            setMessages(prev => prev.map(msg => msg.id === optimisticId ? res.data : msg));
        } catch (err) {
            console.error("Failed to send:", err);
            setMessages(prev => prev.filter(msg => msg.id !== optimisticId));
            setInput(savedInput); 
        }
    };

return (
       <div className="AuthX_AppContainer_55" style={{"--user-main-color": user?.color || "#6366f1"}}>       
            {/* LEFT SIDEBAR: Navigation */}
            <aside className="AuthX_SidebarLeft_55">
                <h2 className="AuthX_SidebarTitle_55">Mes Chats</h2>
                <div className="AuthX_TabButtons_55">
                    <button className={`AuthX_TabBtn_55 ${activeTab === 'amis' ? 'active' : ''}`} onClick={() => setActiveTab('amis')}>Amis</button>
                    <button className={`AuthX_TabBtn_55 ${activeTab === 'groups' ? 'active' : ''}`} onClick={() => setActiveTab('groups')}>Groupes</button>
                </div>

                <div className="AuthX_GroupsList_55">
                    {myGroups
                        .filter(g => activeTab === 'amis' ? g.type === 'private' : g.type !== 'private')
                        .map(group => (
                            <div key={group.id} className={`AuthX_GroupItem_55 ${selectedGroup?.id === group.id ? "AuthX_Active_55" : ""}`} onClick={() => setSelectedGroup(group)}>
                                <img src={`http://localhost:8000/storage/${group.image_event}`} className="AuthX_AvatarSm_55" alt="avatar"/>
                                <div className="AuthX_GroupInfo_55">
                                    <p className="AuthX_Name_55">{group.prenom || group.nom_event}</p>
                                    <p className="AuthX_Status_55">{activeTab === 'amis' ? 'En ligne' : `${group.users?.length || 0} membres`}</p>
                                </div>
                            </div>
                        ))}
                </div>
            </aside>

            {/* MAIN CHAT AREA */}
            <main className="AuthX_ChatWindow_55">
                <header className="AuthX_ChatHeader_55">
                    {selectedGroup && (
                        <div className="AuthX_HeaderProfile_55">
                            <img src={`http://localhost:8000/storage/${selectedGroup.image_event}`} className="AuthX_HeaderAvatar_55" alt="header" />
                            <div>
                                <h3 className="AuthX_HeaderTitle_55">{selectedGroup.prenom || selectedGroup.nom_event}</h3>
                                <span className="AuthX_HeaderSubtitle_55">Actif maintenant</span>
                            </div>
                        </div>
                    )}
                </header>

                <div className="AuthX_MessagesArea_55">
                    {messages.map(m => {
                        const isMe = String(m.user_id) === String(user?.id);
                        return (
                            <div key={m.id} className={`AuthX_MsgRow_55 ${isMe ? "AuthX_Me_55" : "AuthX_NotMe_55"}`}>
                                {!isMe && (
                                    <img src={m.user?.photo ? `http://localhost:8000/storage/${m.user.photo}` : "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} className="AuthX_MsgAvatar_55" alt="user" />
                                )}
                                <div className="AuthX_MsgContent_55">
                                    <div className={`AuthX_MsgBubble_55 ${m.isSending ? 'AuthX_Sending_55' : ''}`}>
                                        {m.type === "image" || m.file_path ? (
                                             <img src={m.isSending ? m.file_path : `http://localhost:8000/storage/${m.file_path}`} className="AuthX_ChatImg_55" alt="media" />
                                        ) : null}
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

                {/* INPUT PILL */}
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
                            placeholder="Écrivez votre message..."
                        />
                        <button onClick={handleSend} className="AuthX_BtnSend_55" disabled={!input.trim() && !selectedFile}>
                            <IconSend />
                        </button>
                    </div>
                </div>
            </main>

            {/* RIGHT SIDEBAR: Info */}
            <aside className="AuthX_SidebarRight_55">
                {selectedGroup && (
                    <>
                        <div className="AuthX_GoalCard_55">
                            <span className="AuthX_GoalLabel_55">🎯 SUGGESTION</span>
                            <p className="AuthX_GoalText_55">{selectedGroup.suggestion || "Explorez de nouveaux horizons !"}</p>
                        </div>
                        <div className="AuthX_MembersSection_55">
                            <h4 className="AuthX_SectionTitle_55">Membres ({selectedGroup.users?.length || 0})</h4>
                            <div className="AuthX_MembersList_55">
                                {selectedGroup.users?.map(u => (
                                    <div key={u.id} className="AuthX_MemberItem_55">
                                        <div className="AuthX_AvatarWrapper_55">
                                            <img src={u.photo ? `http://localhost:8000/storage/${u.photo}` : "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} className="AuthX_MemberImg_55" alt="member" />
                                            <span className="AuthX_OnlineDot_55"></span>
                                        </div>
                                        <span className="AuthX_MemberName_55">{u.prenom} {u.nom}</span>
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