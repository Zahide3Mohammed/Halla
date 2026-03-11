import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Notifications.css';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router';

const Notifications = () => {
  const [notifsList, setNotifsList] = useState([]);
  const navigate = useNavigate();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const { user, token } = useAuth(); // Khdmina b token dyal l-context mchark m3a l-app kamla

  // 1. Fetching Notifications
  useEffect(() => {
    const getMyNotifs = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifsList(res.data);
        setIsPageLoading(false);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setIsPageLoading(false);
      }
    };

    if (token) {
      getMyNotifs();
    }
  }, [token]);

  // 2. Mark ALL as Read
  const markAllNotificationsRead = async () => {
    try {
      await axios.post('http://localhost:8000/api/notifications/read', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update local state bach t-tfa dik l-point l-7mer fihom kmlin
      setNotifsList(notifsList.map(item => ({ ...item, is_read: 1 })));
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  // 3. Mark SINGLE as Read (clique 3la whda)
  

const handleSingleRead = async (item) => {
  if (!item.is_read) {
    try {
      await axios.post(`http://localhost:8000/api/notifications/${item.id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifsList(prev => 
        prev.map(n => n.id === item.id ? { ...n, is_read: 1 } : n)
      );
    } catch (err) {
      console.error("Error marking single read:", err);
    }
  }
  switch (item.type) {
    case 'like':
    case 'comment':
      navigate(`/post/${item.post_id}`); 
      break;
    case 'friend_request':
      navigate(`/profile/${item.sender_id}`);
      break;
    default:
      console.log("No specific route for this type");
  }
};

  if (isPageLoading) return <div className="ntf-loader">Loading...</div>;

  return (
    <div className="ntf-screen-container">
      <div className="ntf-content-card">
        <div className="ntf-top-bar">
          <h2 className="ntf-main-title">Notifications</h2>
          <button onClick={markAllNotificationsRead} className="ntf-action-link">
            Mark all as read
          </button>
        </div>

        <div className="ntf-items-stack">
          {notifsList.length > 0 ? (
            notifsList.map((item) => (
              <div 
                key={item.id} 
                className={`ntf-single-row ${!item.is_read ? 'ntf-status-unread' : ''}`}
                onClick={() => handleSingleRead(item)}>
                <div className="ntf-avatar-box">
                    {item.sender?.photo ? (
                        <img src={`http://localhost:8000/storage/${item.sender.photo}`} className="ntf-user-pic" alt="user" />
                        ) : (
                        <div className="ntf-user-pic">
                            {item.sender?.nom?.charAt(0).toUpperCase()}
                        </div>
                    )}
                    
                    {/* Badge dyal type (like/comment/request) */}
                    <div className={`ntf-type-badge ntf-bg-${item.type}`}>
                        {item.type === 'like' && <span>❤️</span>}
                        {item.type === 'comment' && <span>💬</span>}
                        {item.type === 'friend_request' && <span>👤</span>}
                    </div>
                </div>

                <div className="ntf-message-block">
                  <p className="ntf-text">
                    <span className="ntf-username">
                    {item.sender?.nom} {item.sender?.prenom}    
                    </span>{' '}
                    {item.type === 'like' && 'liked your post'}
                    {item.type === 'comment' && 'commented on your post'}
                    {item.type === 'friend_request' && 'sent you a friend request'}
                  </p>
                  <span className="ntf-timestamp">
                    {new Date(item.created_at).toLocaleDateString()} - {new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>

                {!item.is_read && <div className="ntf-indicator-dot"></div>}
              </div>
            ))
          ) : (
            <div className="ntf-empty-msg">No new notifications.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;