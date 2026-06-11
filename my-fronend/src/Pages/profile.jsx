import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../Elementes/LanguageContext";
import { translationsLayout } from "../Elementes/translations/translationsLayout";
import axios from "axios"; 
import "./Profile.Module.css";
import { Link } from "react-router";

export default function Profile() {
  const { user, token } = useAuth();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [myPosts, setMyPosts] = useState([]); 
  const t = translationsLayout[language];

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const response = await axios.get("/api/my-posts", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMyPosts(response.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchMyPosts();
    } else {
      const timer = setTimeout(() => setLoading(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [token]);

  const handleDeletePost = async (postId) => {
    const confirmMsg = language === "ar" ? "هل أنت متأكد من حذف هذا المنشور؟" : "Voulez-vous vraiment supprimer ce post ?";
    if (!window.confirm(confirmMsg)) return;

    try {
      await axios.delete(`/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyPosts(myPosts.filter(p => p.id !== postId));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const sidebarLinks = [
    { name: `${t.name_purple}`, color: "purple", image: "./images/purple-back.jpg", text: `${t.text_purple}`, A_T: "80%", I_I: "90%", S_I: "50%", A: "70%" },
    { name: `${t.name_green}`, color: "green", image: "./images/green-back.jpg", text: `${t.text_green}`, A_T: "90%", I_I: "60%", S_I: "40%", A: "80%" },
    { name: `${t.name_yellow}`, color: "yellow", image: "./images/yellow-back.jpg", text: `${t.text_yellow}`, A_T: "50%", I_I: "80%", S_I: "90%", A: "70%" },
    { name: `${t.name_red}`, color: "red", image: "./images/red-back.jpg", text: `${t.text_red}`, A_T: "70%", I_I: "50%", S_I: "30%", A: "60%" },
    { name: `${t.name_blue}`, color: "blue", image: "./images/blue-back.jpg", text: `${t.text_blue}`, A_T: "60%", I_I: "40%", S_I: "80%", A: "70%" }
  ];

  const ress = sidebarLinks.find((e) => e.color === user?.color) || sidebarLinks[0];

  if (loading) {
    return (
      <div className="profile-page-wrapper">
        <div className={`${language === "ar" ? "profile-container" : "profile-container ssh"}`}>
          <div className="profile-main">
            <header className="profile-header">
              <div className="cover-wrapper skeleton" style={{ height: '220px' }}></div>
              <div className="profile-intro">
                <div className="skeleton" style={{ width: '200px', height: '30px', marginBottom: '15px' }}></div>
                <div className="skeleton" style={{ width: '100%', height: '15px' }}></div>
              </div>
            </header>
            <div className="fb-posts-feed">
              {[1, 2].map((n) => <div key={n} className="fb-post-card skeleton" style={{ height: '200px', marginBottom: '20px' }}></div>)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const userAvatarSrc = !user?.photo ? "./icons/Nonprofilelight.jpg" : `/storage/${user?.photo}`;

  return (
    <div className={`profile-page-wrapper ${language === "ar" ? "right159" : "left159"}`}>
      <div className={`${language === "ar" ? "profile-container" : "profile-container ssh"}`}>
        
        <div className="profile-main">
          <header className="profile-header">
            <div className="cover-wrapper">
              <img src={user?.color ? ress.image : "./images/purple-back.jpg"} alt="Cover" className="cover-img" />
              <div className={language === "ar" ? "avatar-wrapper-ar" : "avatar-wrapper"}>
                <div className="avatar-ring" style={{ borderColor: `white` }}>
                  <img src={userAvatarSrc} alt="" className="profile-img"/>
                  <label htmlFor="photo-upload" className="upload-btn" style={{ backgroundColor: ress.color }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
                  </label>
                  <input id="photo-upload" type="file" hidden />
                </div>
              </div>
            </div>

            <div className={language === "ar" ? "profile-intro text-right" : "profile-intro text-left"}>
              <h1 className="user-name">{user?.nom} {user?.prenom}</h1>
              {user?.color ? (
                <div className="badge-wrapper">
                  <span className="label-text">{t.present} :</span>
                  <span className="personality-badge" style={{ backgroundColor: ress.color, color: "white" }}>
                    {ress.color}
                  </span>
                </div>
              ) : (
                <div className="badge-wrapper">
                  <span className="label-text">Passer le teste pour avoir une couleur !!</span>
                  <Link to="/Questions">clicker ici !</Link>  
                </div>
              )}
              <p className="personality-desc">{ress.text}</p>
            </div>

            <nav className="profile-tabs">
              <button className="tab-item active" style={{ '--active-color': ress.color }}>Posts ({myPosts.length})</button>
              <button className="tab-item">About</button>
              <button className="tab-item">Media</button>
            </nav>
          </header>

          {/* ⚡ PREMIUM FB-STYLE FEED */}
          <section className="fb-posts-feed">
            {myPosts.length > 0 ? (
              myPosts.map((post) => (
                <article key={post.id} className="fb-post-card">
                  
                  {/* Post Header */}
                  <div className="fb-post-header">
                    <div className="fb-post-author-info">
                      <img src={userAvatarSrc} alt="Author" className="fb-post-avatar" />
                      <div className="fb-post-meta-text">
                        <span className="fb-post-author-name">{user?.nom} {user?.prenom}</span>
                        <span className="fb-post-time">
                          {new Date(post.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    
                    {/* Modern Clean Delete Button */}
                    <button className="fb-del-btn" onClick={() => handleDeletePost(post.id)} title="Delete post">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>

                  {/* Post Content */}
                  <div className="fb-post-body">
                    <p className="fb-post-text">{post.content}</p>
                  </div>

                  {/* Post Media Area */}
                  {post.media_url && (
                    <div className="fb-post-media-container">
                      <img src={`/storage/${post.media_url}`} alt="Post Attachment" className="fb-post-img" />
                    </div>
                  )}

                  {/* Dynamic Counters Display Bar */}
                  <div className="fb-post-metrics-display">
                    <div className="metric-item-counter">
                      <div className="mini-icon-circle" style={{ backgroundColor: ress.color }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                      </div>
                      <span>{post.likes_count ?? 12} likes</span>
                    </div>
                    <div className="metric-comment-counter">
                      <span>{post.comments_count ?? 4} comments</span>
                    </div>
                  </div>

                  {/* Post Interaction Actions Bar */}
                  <div className="fb-post-actions-bar">
                    <button className="fb-action-btn">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                      Like
                    </button>
                    <button className="fb-action-btn">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                      Comment
                    </button>
                    <button className="fb-action-btn">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                      Share
                    </button>
                  </div>

                </article>
              ))
            ) : (
              <div className="empty-state-msg">
                <p>{language === "ar" ? "لم تقم بنشر أي شيء بعد" : "Aucune publication pour le moment"}</p>
              </div>
            )}
          </section>
        </div>

        <aside className="profile-sidebar">
          <div className="stats-card">
            <h3 className="stats-title">{t.title}</h3>
            {['Adaptability','Analytical Thinking','Social Influence', 'Innovative Ideas', 'Social Influence', 'Adaptability','Social Influence'].map((stat, i) => (
              <div className="metric" key={i}>
                <span className="metric-info">{stat}</span>
                <div className="bar">
                  <div className="progress-bg" style={{ 
                    width: i === 0 ? ress.A_T : i === 1 ? ress.I_I : i === 2 ? ress.S_I : ress.A, 
                    backgroundColor: ress.color 
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        </aside>

      </div>
    </div>
  );
}