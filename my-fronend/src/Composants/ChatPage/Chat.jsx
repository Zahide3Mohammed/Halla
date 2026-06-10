import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Chat.css";
import { useLocation } from "react-router-dom";
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

// 💀 Component Skeleton Loading modern
const ChatSkeleton = () => (
    <div className="AuthX_SkeletonWrapper_55">
        {[1, 2, 3, 4].map((n) => (
            <div key={n} className={`AuthX_SkeletonRow_55 ${n % 2 === 0 ? "AuthX_SkeletonMe_55" : ""}`}>
                <div className="AuthX_SkeletonAvatar_55"></div>
                <div className="AuthX_SkeletonContent_55">
                    <div className="AuthX_SkeletonBubble_55"></div>
                    <div className="AuthX_SkeletonTime_55"></div>
                </div>
            </div>
        ))}
    </div>
);

export default function Chat() {
    const { user, token } = useAuth();
    const location = useLocation();
    const [myGroups, setMyGroups] = useState([]);
    const [myFriends, setMyFriends] = useState([]); 
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [activeTab, setActiveTab] = useState("groups"); 
    
    // ⚡ States l-jdad dyal performance w notifications
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState({}); // Stores counts: { 'friend_15': 3, 'group_2': 1 }

    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = (behavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };
    
    useEffect(() => {
    if (myFriends.length > 0) {
        const redirectedFriendId = location.state?.openFriendId;
        if (redirectedFriendId) {
            const foundFriend = myFriends.find(f => String(f.id) === String(redirectedFriendId));
            if (foundFriend) {
                setActiveTab("amis");
                setSelectedFriend(foundFriend);
                setSelectedGroup(null);
            }
        }
    }
}, [myFriends, location.state]);
    // 1. Fetch Groups Info
    useEffect(() => {
        axios.get("/api/my-completed-groups", {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            setMyGroups(res.data || []);
            if (res.data && res.data.length > 0 && !selectedGroup && activeTab === "groups") {
                setSelectedGroup(res.data[0]);
            }
        })
        .catch(err => console.error("Error fetching groups:", err));
    }, [token]);

    // 2. Fetch Friends Info
    useEffect(() => {
        axios.get("/api/friends", {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            setMyFriends(res.data || []);
            if (res.data && res.data.length > 0 && !selectedFriend && activeTab === "amis") {
                setSelectedFriend(res.data[0]);
            }
        })
        .catch(err => console.error("Error fetching friends:", err));
    }, [token]);

    // 3. Reset choices when switching tabs
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setMessages([]);
        if (tab === "groups" && myGroups.length > 0) {
            setSelectedGroup(myGroups[0]);
            setSelectedFriend(null);
            // Clear unread for the auto-selected group
            setUnreadMessages(prev => ({ ...prev, [`group_${myGroups[0].id}`]: 0 }));
        } else if (tab === "amis" && myFriends.length > 0) {
            setSelectedFriend(myFriends[0]);
            setSelectedGroup(null);
            // Clear unread for the auto-selected friend
            setUnreadMessages(prev => ({ ...prev, [`friend_${myFriends[0].id}`]: 0 }));
        }
    };

    // 4. Real-time Listening & History Fetching
    useEffect(() => {
        if (!user) return;

        // --- PARTIE GROUPS ---
        if (activeTab === "groups" && selectedGroup) {
            setIsLoadingMessages(true); // Trigger skeleton
            axios.get(`/api/groups/${selectedGroup.id}/messages`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => {
                setMessages(res.data || []);
                setIsLoadingMessages(false);
                setTimeout(() => scrollToBottom("auto"), 50);
            })
            .catch(() => setIsLoadingMessages(false));

            // Reset notification badge direct mnin n-clikiw 3lih
            setUnreadMessages(prev => ({ ...prev, [`group_${selectedGroup.id}`]: 0 }));

            const channelName = `chat.${selectedGroup.id}`;
            const channel = echo.private(channelName);

            channel.listen(".message.sent", (e) => {
                // Check if message belongs to current open group
                if (String(selectedGroup.id) === String(e.message.group_id)) {
                    setMessages((prev) => {
                        if (prev.some((msg) => msg.id === e.message.id)) return prev;
                        if (String(e.message.user_id) !== String(user.id)) return [...prev, e.message];
                        return prev;
                    });
                    setTimeout(() => scrollToBottom("smooth"), 10);
                }

                // 🔥 Trigger sorting & notification logic for Groups
                setMyGroups(prevGroups => {
                    const targetGroup = prevGroups.find(g => g.id === e.message.group_id);
                    if (!targetGroup) return prevGroups;
                    const remaining = prevGroups.filter(g => g.id !== e.message.group_id);
                    return [targetGroup, ...remaining]; // Bring to top
                });

                if (String(selectedGroup.id) !== String(e.message.group_id) && String(e.message.user_id) !== String(user.id)) {
                    setUnreadMessages(prev => ({
                        ...prev,
                        [`group_${e.message.group_id}`]: (prev[`group_${e.message.group_id}`] || 0) + 1
                    }));
                }
            });

            return () => { echo.leave(channelName); };
        }

        // --- PARTIE AMIS ---
        if (activeTab === "amis" && selectedFriend) {
            setIsLoadingMessages(true); // Trigger skeleton
            axios.get(`/api/direct-messages/${selectedFriend.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => {
                setMessages(res.data || []);
                setIsLoadingMessages(false);
                setTimeout(() => scrollToBottom("auto"), 50);
            })
            .catch(() => setIsLoadingMessages(false));

            // Reset notification badge direct mnin n-clikiw 3lih
            setUnreadMessages(prev => ({ ...prev, [`friend_${selectedFriend.id}`]: 0 }));

            const privateChannelName = `chat.${user.id}`;
            const privateChannel = echo.private(privateChannelName);

            privateChannel.listen(".PrivateMessageSent", (e) => {
                const isFromCurrentFriend = String(e.message.sender_id) === String(selectedFriend.id);
                
                if (isFromCurrentFriend) {
                    setMessages((prev) => {
                        if (prev.some((msg) => msg.id === e.message.id)) return prev;
                        return [...prev, e.message];
                    });
                    setTimeout(() => scrollToBottom("smooth"), 10);
                }

                // 🔥 Trigger sorting & notification logic for Friends
                setMyFriends(prevFriends => {
                    const targetFriend = prevFriends.find(f => f.id === e.message.sender_id);
                    if (!targetFriend) return prevFriends;
                    const remaining = prevFriends.filter(f => f.id !== e.message.sender_id);
                    return [targetFriend, ...remaining]; // Bring to top
                });

                if (!isFromCurrentFriend) {
                    setUnreadMessages(prev => ({
                        ...prev,
                        [`friend_${e.message.sender_id}`]: (prev[`friend_${e.message.sender_id}`] || 0) + 1
                    }));
                }
            });

            return () => { echo.leave(privateChannelName); };
        }

    }, [selectedGroup?.id, selectedFriend?.id, user?.id, token, activeTab]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // 5. Send Message
    const handleSend = async () => {
        const isGroup = activeTab === "groups";
        if (isGroup && !selectedGroup) return;
        if (!isGroup && !selectedFriend) return;
        if (!input.trim() && !selectedFile) return;

        const optimisticId = Date.now();
        const optimisticMessage = {
            id: optimisticId,
            content: input,
            user_id: user.id,
            sender_id: user.id, 
            user: user,
            sender: user,
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

        // Bring current active item to top immediately on send
        if (isGroup) {
            setMyGroups(prev => [selectedGroup, ...prev.filter(g => g.id !== selectedGroup.id)]);
        } else {
            setMyFriends(prev => [selectedFriend, ...prev.filter(f => f.id !== selectedFriend.id)]);
        }

        const formData = new FormData();
        formData.append("content", savedInput); 
        formData.append("message", savedInput); 
        formData.append("type", savedFile ? "image" : "text");
        if (savedFile) {
            formData.append("image", savedFile);
            formData.append("file", savedFile); 
        }

        try {
            let res;
            if (isGroup) {
                res = await axios.post(
                    `/api/groups/${selectedGroup.id}/messages`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
                );
            } else {
                formData.append("receiver_id", selectedFriend.id);
                res = await axios.post(
                    `/api/direct-messages`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
                );
            }
            setMessages(prev => prev.map(msg => msg.id === optimisticId ? res.data : msg));
        } catch (err) {
            console.error("Failed to send message:", err);
            setMessages(prev => prev.filter(msg => msg.id !== optimisticId));
            setInput(savedInput); 
        }
    };

    const currentActiveTarget = activeTab === "groups" ? selectedGroup : selectedFriend;
    const currentAvatar = activeTab === "groups" 
        ? (currentActiveTarget?.image_event ? `/storage/${currentActiveTarget.image_event}` : null)
        : (currentActiveTarget?.photo ? `/storage/${currentActiveTarget.photo}` : null);
    const currentTitle = activeTab === "groups" 
        ? currentActiveTarget?.nom_event 
        : `${currentActiveTarget?.prenom || ""} ${currentActiveTarget?.nom || ""}`;

    return (
        <div className="AuthX_AppContainer_55" style={{"--user-main-color": user?.color || "#6366f1"}}>       
            {/* LEFT SIDEBAR: Navigation */}
            <aside className="AuthX_SidebarLeft_55">
                <h2 className="AuthX_SidebarTitle_55">Mes Chats</h2>
                <div className="AuthX_TabButtons_55">
                    <button className={`AuthX_TabBtn_55 ${activeTab === 'amis' ? 'active' : ''}`} onClick={() => handleTabChange('amis')}>Amis</button>
                    <button className={`AuthX_TabBtn_55 ${activeTab === 'groups' ? 'active' : ''}`} onClick={() => handleTabChange('groups')}>Groupes</button>
                </div>

                <div className="AuthX_GroupsList_55">
                    {activeTab === 'groups' ? (
                        (myGroups || []).map(group => {
                            const unreadCount = unreadMessages[`group_${group.id}`] || 0;
                            return (
                                <div key={group.id} className={`AuthX_GroupItem_55 ${selectedGroup?.id === group.id ? "AuthX_Active_55" : ""}`} onClick={() => setSelectedGroup(group)}>
                                    <img src={group.image_event ? `/storage/${group.image_event}` : "https://api.dicebear.com/7.x/initials/svg?seed=G"} className="AuthX_AvatarSm_55" alt="avatar"/>
                                    <div className="AuthX_GroupInfo_55">
                                        <p className="AuthX_Name_55">{group.nom_event}</p>
                                        <p className="AuthX_Status_55">{group.users?.length || 0} membres</p>
                                    </div>
                                    {/* 🔴 RED BADGE FOR UNREAD GROUPS */}
                                    {unreadCount > 0 && <span className="AuthX_UnreadBadge_55">{unreadCount}</span>}
                                </div>
                            );
                        })
                    ) : (
                        (myFriends || []).map(friend => {
                            const unreadCount = unreadMessages[`friend_${friend.id}`] || 0;
                            return (
                                <div key={friend.id} className={`AuthX_GroupItem_55 ${selectedFriend?.id === friend.id ? "AuthX_Active_55" : ""}`} onClick={() => setSelectedFriend(friend)}>
                                    <img src={friend.photo ? `/storage/${friend.photo}` : "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} className="AuthX_AvatarSm_55" alt="avatar"/>
                                    <div className="AuthX_GroupInfo_55">
                                        <p className="AuthX_Name_55">{friend.prenom} {friend.nom}</p>
                                        <p className="AuthX_Status_55">En ligne</p>
                                    </div>
                                    {/* 🔴 RED BADGE FOR UNREAD FRIENDS */}
                                    {unreadCount > 0 && <span className="AuthX_UnreadBadge_55">{unreadCount}</span>}
                                </div>
                            );
                        })
                    )}
                </div>
            </aside>

            {/* MAIN CHAT AREA */}
            <main className="AuthX_ChatWindow_55">
                <header className="AuthX_ChatHeader_55">
                    {currentActiveTarget && (
                        <div className="AuthX_HeaderProfile_55">
                            <img src={currentAvatar || "https://api.dicebear.com/7.x/initials/svg?seed=Chat"} className="AuthX_HeaderAvatar_55" alt="header" />
                            <div>
                                <h3 className="AuthX_HeaderTitle_55">{currentTitle}</h3>
                                <span className="AuthX_HeaderSubtitle_55">Actif maintenant</span>
                            </div>
                        </div>
                    )}
                </header>

                <div className="AuthX_MessagesArea_55">
                    {isLoadingMessages ? (
                        <ChatSkeleton />
                    ) : (
                        (messages || []).map(m => {
                            const currentMsgUserId = m.user_id || m.sender_id;
                            const isMe = String(currentMsgUserId) === String(user?.id);
                            const currentMsgUserPhoto = m.user?.photo || m.sender?.photo;

                            return (
                                <div key={m.id} className={`AuthX_MsgRow_55 ${isMe ? "AuthX_Me_55" : "AuthX_NotMe_55"}`}>
                                    {!isMe && (
                                        <img src={currentMsgUserPhoto ? `/storage/${currentMsgUserPhoto}` : "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} className="AuthX_MsgAvatar_55" alt="user" />
                                    )}
                                    <div className="AuthX_MsgContent_55">
                                        <div className={`AuthX_MsgBubble_55 ${m.isSending ? 'AuthX_Sending_55' : ''}`}>
                                            {(m.type === "image" || m.file_path) && (
                                                 <img src={m.isSending ? m.file_path : `/storage/${m.file_path}`} className="AuthX_ChatImg_55" alt="media" />
                                            )}
                                            {m.content && <p className="AuthX_MsgText_55">{m.content}</p>}
                                        </div>
                                        <span className="AuthX_MsgTime_55">
                                            {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
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

            {/* RIGHT SIDEBAR */}
            {/* RIGHT SIDEBAR: Info Dynamic Filtering Wrapper */}
<aside className="AuthX_SidebarRight_55">
    {activeTab === "groups" && selectedGroup ? (
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
                                <img src={u.photo ? `/storage/${u.photo}` : "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} className="AuthX_MemberImg_55" alt="member" />
                                <span className="AuthX_OnlineDot_55"></span>
                            </div>
                            <span className="AuthX_MemberName_55">{u.prenom} {u.nom}</span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    ) : (activeTab === "amis" && selectedFriend) ? (
        <div className="AuthX_FriendSidebarWrapper_55">
            {/* Info Section */}
            <div className="AuthX_FriendInfoSection_55">
                <div className="AuthX_BigAvatarWrapper_55">
                    <img 
                        src={selectedFriend.photo ? `/storage/${selectedFriend.photo}` : "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} 
                        className="AuthX_BigFriendAvatar_55" 
                        alt="friend" 
                    />
                    <span className="AuthX_OnlineStatusBadge_55"></span>
                </div>
                <h4 className="AuthX_FriendNameTitle_55">{selectedFriend.prenom} {selectedFriend.nom}</h4>
                <p className="AuthX_FriendRoleSubtitle_55">Membre officiel</p>
                <span className="AuthX_GenderTag_55">{selectedFriend.sexe || "Non spécifié"}</span>
            </div>
            <div className="AuthX_SidebarActions_55">
                <button 
                    className="AuthX_ActionBtnProfile_55"
                    onClick={() => window.location.href = `/profile/${selectedFriend.id}`}
                >
                    👤 Afficher le profil
                </button>
                <button 
                    className="AuthX_ActionBtnDeleteChat_55"
                    onClick={async () => {
                        if(confirm("Voulez-vous vraiment supprimer cette discussion ?")) {
                            try {
                                await axios.delete(`/api/direct-messages/${selectedFriend.id}`, {
                                    headers: { Authorization: `Bearer ${token}` }
                                });
                                setMessages([]);
                                alert("Discussion supprimée avec succès.");
                            } catch (err) {
                                console.error("Erreur lors de la suppression:", err);
                                alert("Impossible de supprimer la discussion.");
                            }}}}>
                    🗑️ Supprimer la discussion
                </button>
            </div>
        </div>
    ) : null}
</aside>
        </div>
    );
}