import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './friends.css';
import { useAuth } from '../../../context/AuthContext';

const FindFriends = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/find-friends', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching users", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchUsers();
  }, [token]);

  const sendFriendRequest = async (userId) => {
    try {
      await axios.post(`http://localhost:8000/api/friend-request/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="find-friends-container">
      <h2 className="title-grp">Find New Friends</h2>
      <div className="friends-grid">
        {loading ? (
          // Skeleton placeholders باش ما يتزعزعش الستيل
          [1, 2, 3, 4].map(n => <div key={n} className="user-card skeleton"></div>)
        ) : (
          users.map(u => (
            <div key={u.id} className="user-card">
              <div className="image-wrapper">
                <img 
                  src={u.photo ? (u.photo.startsWith('http') ? u.photo : `http://localhost:8000/storage/${u.photo}`) : '/default-avatar.png'} 
                  alt={`${u.nom}`} 
                  className="user-img"
                />
              </div>
              <div className="user-info">
                <h4>{u.nom} {u.prenom}</h4>
                <button onClick={() => sendFriendRequest(u.id)} className="add-btn">
                  Add Friend
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {!loading && users.length === 0 && <p className="empty-msg">No suggestions found.</p>}
    </div>
  );
};

export default FindFriends;