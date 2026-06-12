import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import './MainLayout.css';
import { useLanguage } from './LanguageContext';
import { translationsLayout } from './translations/translationsLayout';
import { useAuth } from '../context/AuthContext';
import axios from "axios";
import React, { useEffect, useState } from 'react';

// --- IMPORTS DIAL REAL-TIME ---
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const MainLayout = () => {
    const { language } = useLanguage();
    const { user, logout, token } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0); 
    const [liveToast, setLiveToast] = useState(null); // ✨ State jdid dial Pop-up live notification
    const t = translationsLayout[language];
    const navigate = useNavigate();
    const API_URL = "/api";

    // ------------------------------------- LOGIC WEBSOCKET (REAL-TIME) -----------------------------------
    useEffect(() => {
        if (!token || !user?.id) return;

        window.Pusher = Pusher;
        const echoInstance = new Echo({
            broadcaster: 'reverb',
            key: 'hallamaghrebkey',
            wsHost: window.location.hostname ,
            wsPort: 8080,
            forceTLS: false,
            enabledTransports: ['ws', 'wss'],
            authEndpoint: '/broadcasting/auth',
            auth: {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            },
        });

        echoInstance.private(`App.Models.User.${user.id}`)
            .listen('.NotificationSent', (data) => {
                console.log('New Friend Request Received!', data);
                setUnreadCount(prev => prev + 1);

                // ✨ Ila jatt demande d follow, n-affichiw Toast real-time dynamic f l-blasa
                const notifPayload = data.notification;
                if (notifPayload.type === 'friend_request') {
                    setLiveToast(notifPayload);
                    
                    // Auto-hide pop-up après 8 seconds la ma-clikach
                    setTimeout(() => {
                        setLiveToast(null);
                    }, 8000);
                }
            });

        return () => {
            if (echoInstance) {
                echoInstance.leave(`App.Models.User.${user.id}`);
                echoInstance.disconnect();
            }
        };
    }, [token, user?.id]);

    // ---------------------------------- INITIAL FETCH (GET OLD UNREADS) -----------------------------
    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const res = await axios.get('/api/notifications', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const unread = res.data.filter(n => !n.is_read).length;
                setUnreadCount(unread);
            } catch (err) {
                console.log("Error fetching unread count", err);
            }
        };

        if (user && token) fetchUnreadCount();
    }, [user, token]);

    // ---------------------------------- ACTIONS LIVE BUTTONS -----------------------------
    const handleAcceptLive = async (senderId) => {
        try {
            await axios.post(`${API_URL}/friend-accept`, { sender_id: senderId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLiveToast(null);
            alert("Demande acceptée !");
        } catch (err) {
            console.error("Error accepting request:", err);
        }
    };

    const handleRefuseLive = async (notifId) => {
        try {
            // Sifet call l backend bach n-supprimiwn notification oula n-bdelo status
            await axios.delete(`${API_URL}/notifications/${notifId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLiveToast(null);
        } catch (err) {
            console.error("Error refusing request:", err);
            setLiveToast(null); // hide anyway for UI smooth flow
        }
    };

    const handleNotificationClick = async () => {
        setUnreadCount(0);
        try {
            await axios.post('/api/notifications/read', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.log("Error marking notifications as read", err);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post("http://localhost:8000/api/logout", {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch(err){
            console.log("logout error", err);
        }
        logout();
        navigate("/login", { state: { signin: true } });
    };

    // --- ICONS COMPONENTS ---
    const HomeIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>);
    const ClubIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>);
    const ChatIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>);
    const GroupIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>);

    return (
        <div className="AuthX_DashboardContainer_55" style={{"--accent-blue": user?.color }}>
            
            {/* ✨ DYNAMIC LIVE TOAST WINDOW (APPLE/STRIPE STYLE) */}
            {liveToast && (
                <div className="live-toast-premium">
                    <div className="live-toast-content">
                        <div className="live-toast-avatar">
                            {liveToast.sender?.photo ? (
                                <img src={`http://localhost:8000/storage/${liveToast.sender.photo}`} alt="user" />
                            ) : (
                                <div className="live-avatar-fallback">{liveToast.sender?.nom?.charAt(0)}</div>
                            )}
                        </div>
                        <div className="live-toast-body">
                            <strong>{liveToast.sender?.prenom} {liveToast.sender?.nom}</strong>
                            <p>vous a envoyé une demande de suivi</p>
                        </div>
                    </div>
                    <div className="live-toast-actions">
                        <button className="live-btn-accept" onClick={() => handleAcceptLive(liveToast.sender_id)}>Accepter</button>
                        <button className="live-btn-refuse" onClick={() => handleRefuseLive(liveToast.id)}>Refuser</button>
                    </div>
                </div>
            )}

            {/* Custom inject for live toast positioning without touching global CSS */}
            <style>{`
                .live-toast-premium { position: fixed; top: 24px; right: 24px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(8px); border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.03); z-index: 99999; display: flex; flex-direction: column; gap: 12px; min-width: 320px; animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); font-family: system-ui, sans-serif; }
                @keyframes slideIn { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .live-toast-content { display: flex; align-items: center; gap: 12px; }
                .live-toast-avatar img { width: 42px; height: 42px; border-radius: 50%; object-fit: cover; }
                .live-avatar-fallback { width: 42px; height: 42px; border-radius: 50%; background: #e2e8f0; text-align: center; line-height: 42px; font-weight: bold; color: #475569; }
                .live-toast-body strong { font-size: 14px; color: #0f172a; display: block; }
                .live-toast-body p { font-size: 13px; color: #64748b; margin: 2px 0 0 0; }
                .live-toast-actions { display: flex; gap: 8px; justify-content: flex-end; border-top: 1px solid #f1f5f9; padding-top: 10px; }
                .live-btn-accept { background: ${user?.color || '#6366f1'}; color: white; border: none; padding: 6px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
                .live-btn-refuse { background: #f1f5f9; color: #475569; border: none; padding: 6px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
                .live-btn-accept:hover { filter: brightness(1.05); }
                .live-btn-refuse:hover { background: #e2e8f0; }
            `}</style>

            <header className="AuthX_TopNavbar_55">
                <div className="AuthX_UserProfileMini_55">
                    <div className="AuthX_AvatarPlaceholder_55">
                        <NavLink to="/Profile" >
                            <img src={!user?.photo ? "./icons/Nonprofilelight.jpg" : `http://localhost:8000/storage/${user?.photo}`} alt="profile" />
                        </NavLink>
                    </div>
                </div>
                <NavLink to="/home" end className="AuthX_IconClick_55"><ClubIcon /></NavLink>
                <NavLink to="/HallaClub" className="AuthX_IconClick_55"><HomeIcon /></NavLink>
                <NavLink to="/chat" className="AuthX_IconClick_55"><ChatIcon /></NavLink>
                <NavLink to="/Groups" className="AuthX_IconClick_55"><GroupIcon /></NavLink>
            </header>

            <div className="AuthX_LayoutBody_55">
                <aside className="AuthX_SideNavbar_55">
                    <NavLink to="/Notifications" className="AuthX_NavItem_55" onClick={handleNotificationClick}>
                        <span className="AuthX_Icon_55" style={{ position: 'relative' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="AuthX_SidebarIcon_55">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>
                            {unreadCount > 0 && <span className="AuthX_NotifBadge_55">{unreadCount}</span>}
                        </span>
                        <span className="AuthX_Label_55">Notification</span>
                    </NavLink>

                    <NavLink to="/Settings" className="AuthX_NavItem_55">
                        <span className="AuthX_Icon_55">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                        </span>
                        <span className="AuthX_Label_55">{t.settings}</span>
                    </NavLink>

                    <NavLink to="/Security" className="AuthX_NavItem_55">
                        <span className="AuthX_Icon_55">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                        </span>
                        <span className="AuthX_Label_55">{t.Security}</span>
                    </NavLink>

                    <span onClick={handleLogout} className="AuthX_NavItem_55 AuthX_LogoutNav_55" style={{ cursor: 'pointer' }}>
                        <span className="AuthX_Icon_55">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        </span>
                        <span className="AuthX_Label_55">{t.Logout}</span>
                    </span>
                </aside>

                <main className="AuthX_MainContent_55">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;