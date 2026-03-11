import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './PostDetails.css'; // Ila bghiti t-styliha

const PostDetails = () => {
  const { id } = useParams(); // Kat-ched "43" mn /post/43
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:8000/api/posts/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPost(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Post not found or server error");
        setLoading(false);
      }
    };

    if (token && id) {
      fetchPost();
    }
  }, [id, token]);

  if (loading) return <div className="loader">Loading post...</div>;
  if (error) return <div className="error-msg">{error}</div>;
  if (!post) return <div className="error-msg">No post found.</div>;

  return (
    <div className="post-details-container">
      <button onClick={() => navigate(-1)} className="back-btn">
        ← Back
      </button>

      <div className="post-card">
        <div className="post-header">
          {post.user?.photo && (
            <img 
              src={`http://localhost:8000/storage/${post.user.photo}`} 
              alt="author" 
              className="author-pic" 
            />
          )}
          <div className="author-info">
            <h4>{post.user?.nom} {post.user?.prenom}</h4>
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="post-content">
          <p>{post.content}</p>
          {post.image && (
            <img 
              src={`http://localhost:8000/storage/${post.image}`} 
              alt="post" 
              className="post-img" 
            />
          )}
        </div>

        <div className="post-footer">
          <span>❤️ {post.likes_count} Likes</span>
          <span>💬 {post.comments_count} Comments</span>
        </div>
      </div>
    </div>
  );
};

export default PostDetails;