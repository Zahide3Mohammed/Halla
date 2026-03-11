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
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  const sendFriendRequest = async (userId) => {
    try {
      await axios.post(`http://localhost:8000/api/friend-request/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Men b3d ma nsifto request, n-7iydou had l-user mn l-list
      setUsers(users.filter(u => u.id !== userId));
      alert("Friend request sent!");
    } catch (err) {
      console.error("Error sending request", err);
    }
  };

  if (loading) return <div>Loading suggestions...</div>;

  return (
    <div className="find-friends-container">
      <h2>Find New Friends</h2>
      <div className="friends-grid">
        {users.map(u => (
          <div key={u.id} className="user-card">
            <img 
              src={u.photo ? `http://localhost:8000/storage/${u.photo}` : '/default-avatar.png'} 
              alt={u.nom} 
            />
            <h4>{u.nom} {u.prenom}</h4>
            <button onClick={() => sendFriendRequest(u.id)} className="add-btn">
              Add Friend
            </button>
          </div>
        ))}
        {users.length === 0 && <p>No new suggestions found.</p>}
      </div>
    </div>
  );
};

export default FindFriends;