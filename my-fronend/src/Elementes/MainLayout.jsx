import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import './MainLayout.css';
import { useLanguage } from './LanguageContext';
import { translationsLayout } from './translations/translationsLayout';
import { useAuth } from '../context/AuthContext';
import axios from "axios";
import React, { useEffect, useState } from 'react';

// --- HAD L-IMPORTS DARORIYIN ---
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const MainLayout = () => {
    const { language } = useLanguage();
    const { user, logout, token } = useAuth();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [unreadCount, setUnreadCount] = useState(0); 
    const t = translationsLayout[language];
    const navigate = useNavigate();

//------------------------------------- LOGIC WEBSOCKET (MA-BEDDELT WALO F STYLE) -----------------------------------
useEffect(() => {
        if (!token || !user?.id) return;

        window.Pusher = Pusher;
        const echoInstance = new Echo({
            broadcaster: 'reverb',
            key: 'xxkgyypqsnguzq3d81ww',
            wsHost: '127.0.0.1',
            wsPort: 8080,
            forceTLS: false,
            enabledTransports: ['ws', 'wss'],
            authEndpoint: 'http://127.0.0.1:8000/broadcasting/auth',
            auth: {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            },
        });

        // Listen for private notifications
        echoInstance.private(`App.Models.User.${user.id}`)
            .notification((notification) => {
                console.log('Notification received!', notification);
                setUnreadCount(prev => prev + 1);
            });

        return () => {
            if (echoInstance) {
                echoInstance.leave(`App.Models.User.${user.id}`);
                echoInstance.disconnect();
            }
        };
    }, [token, user?.id]);
//------------------------------------------------------------------------------------------------
const handleNotificationClick = async () => {
    setUnreadCount(0);
    try {
        await axios.post('http://localhost:8000/api/notifications/read', {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
    } catch (err) {
        console.log("Error marking notifications as read", err);
    }
};
//---------------------------------- INITIAL FETCH (MA-BEDDELT WALO) -----------------------------
    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const res = await axios.get('http://localhost:8000/api/notifications', {
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

    // --- L-ICONS DYALK KIF MA KANO ---
    const getProfileIcon = (variant, userPhoto) => {
        if (userPhoto) {
            return <img src={`http://localhost:8000/storage/${userPhoto}`} alt="profile" />;
        }
        const icons = {
            Femme: (<svg viewBox="0 0 24 24" fill="#e2ab97"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>),
            Homme: (<svg viewBox="0 0 24 24" fill="#4a5568"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>),
        };
        return icons[variant];
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

    const userAccentColor = user?.color;
    const HomeIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-svg"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>);
    const ClubIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-svg"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>);
    const ChatIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-svg"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>);
    const GroupIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-svg">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );

    return (
        <div className="dashboard-container" style={{"--accent-blue": userAccentColor }}>
            <header className="top-navbar">
                <div className="user-profile-mini">
                    <div className="avatar-placeholder">
                        <NavLink to="/Profile" >
                            <img src={
                                !user?.photo 
                                ? "./icons/Nonprofilelight.jpg"
                                : `http://localhost:8000/storage/${user?.photo}`
                            } alt="profile" />
                        </NavLink>
                    </div>
                </div>
                <NavLink to="/home" end className="icon-click"><HomeIcon /></NavLink>
                <NavLink to="/HallaClub" className="icon-click"><ClubIcon /></NavLink>
                <NavLink to="/chat" className="icon-click"><ChatIcon /></NavLink>
                <NavLink to="/Groups" className="icon-click"><GroupIcon /></NavLink>
            </header>

            <div className="layout-body">
                <aside className="side-navbar">
                    <NavLink to="/Notifications" className="nav-item" onClick={handleNotificationClick}>
                        <span className="icon" style={{ position: 'relative' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sidebar-icon">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>
                            {unreadCount > 0 && (
                                <span className="notif-badge">{unreadCount}</span>
                            )}
                        </span>
                        <span className="label">Notification</span>
                    </NavLink>

                    <NavLink to="/Settings" className="nav-item">
                        <span className="icon">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                            </svg>
                        </span>
                        <span className="label">{t.settings}</span>
                    </NavLink>

                    <NavLink to="/Security" className="nav-item">
                        <span className="icon">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                            </svg>
                        </span>
                        <span className="label">{t.Security}</span>
                    </NavLink>

                    <span onClick={handleLogout} className="nav-item logout-nav" style={{ cursor: 'pointer' }}>
                        <span className="icon">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                        </span>
                        <span className="label">{t.Logout}</span>
                    </span>
                </aside>

                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
export default MainLayout;