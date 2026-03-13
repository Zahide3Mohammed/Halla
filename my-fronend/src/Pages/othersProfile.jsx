import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useLanguage } from "../Elementes/LanguageContext";
import { translationsLayout } from "../Elementes/translations/translationsLayout";
import axios from "axios";
import "./Profile.Module.css";

export default function UserProfile() {
  const { id } = useParams(); 
  const { language } = useLanguage();
  const [targetUser, setTargetUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const t = translationsLayout[language];

  const sidebarLinks = [
    { name: `${t.name_purple}`, color: "purple", image: "/images/purple-back.jpg", text: `${t.text_purple}`, A_T: "80%", I_I: "90%", S_I: "50%", A: "70%" },
    { name: `${t.name_green}`, color: "green", image: "/images/green-back.jpg", text: `${t.text_green}`, A_T: "90%", I_I: "60%", S_I: "40%", A: "80%" },
    { name: `${t.name_yellow}`, color: "yellow", image: "/images/yellow-back.jpg", text: `${t.text_yellow}`, A_T: "50%", I_I: "80%", S_I: "90%", A: "70%" },
    { name: `${t.name_red}`, color: "red", image: "/images/red-back.jpg", text: `${t.text_red}`, A_T: "70%", I_I: "50%", S_I: "30%", A: "60%" },
    { name: `${t.name_blue}`, color: "blue", image: "/images/blue-back.jpg", text: `${t.text_blue}`, A_T: "60%", I_I: "40%", S_I: "80%", A: "70%" }
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // 1. جلب بيانات المستخدم لآخر
        const resUser = await axios.get(`http://localhost:8000/api/user-profile/${id}`);
        setTargetUser(resUser.data);
        
        // 2. جلب منشورات هاد المستخدم
        const resPosts = await axios.get(`http://localhost:8000/api/user-posts/${id}`);
        setPosts(resPosts.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUserData();
  }, [id]);

  const ress = sidebarLinks.find((e) => e.color === targetUser?.color) || sidebarLinks[0];

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
            <div className="posts-grid">
              {[1, 2].map((n) => <div key={n} className="post-card skeleton" style={{ height: '250px' }}></div>)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`profile-page-wrapper ${language === "ar" ? "right159" : "left159"}`}>
      <div className={`${language === "ar" ? "profile-container" : "profile-container ssh"}`}>
        
        <div className="profile-main">
          <header className="profile-header">
            <div className="cover-wrapper">
              <img src={targetUser?.color ? ress.image : "/images/purple-back.jpg"} alt="Cover" className="cover-img" />
              <div className={language === "ar" ? "avatar-wrapper-ar" : "avatar-wrapper"}>
                <div className="avatar-ring" style={{ borderColor: `white` }}>
                  <img src={!targetUser?.photo ? "/icons/Nonprofilelight.jpg" : `http://localhost:8000/storage/${targetUser?.photo}`} alt="" className="profile-img"/>
                </div>
              </div>
            </div>

            <div className={language === "ar" ? "profile-intro text-right" : "profile-intro text-left"}>
              <h1 className="user-name">{targetUser?.nom} {targetUser?.prenom}</h1>
              <div className="badge-wrapper">
                <span className="label-text">{t.present} :</span>
                <span className="personality-badge" style={{ backgroundColor: ress.color, color: "white" }}>
                  {targetUser?.color || "No Color"}
                </span>
              </div>
              <p className="personality-desc">{ress.text}</p>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                 <button className="btn primary1" style={{ backgroundColor: ress.color, width: '160px' }}>Message</button>
                 <button className="btn secondary" style={{ width: '160px', marginTop: 0 }}>Follow</button>
              </div>
            </div>

            <nav className="profile-tabs">
              <button className="tab-item active" style={{ '--active-color': ress.color }}>Posts ({posts.length})</button>
              <button className="tab-item">About</button>
              <button className="tab-item">Media</button>
            </nav>
          </header>

          <section className="posts-grid">
            {posts.length > 0 ? (
              posts.map((post) => (
                <article key={post.id} className="profile-post-card">
                  {post.media_url && (
                    <div className="post-media-wrapper">
                      <img src={`http://localhost:8000/storage/${post.media_url}`} alt="Post" />
                    </div>
                  )}
                  <div className="post-body-content">
                    <p className="post-text">{post.content}</p>
                    <div className="post-footer-meta">
                      <span className="post-date-tag">{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-state-msg">
                <p>{language === "ar" ? "لا توجد منشورات" : "Aucune publication"}</p>
              </div>
            )}
          </section>
        </div>

        <aside className="profile-sidebar">
          <div className="stats-card">
            <h3 className="stats-title">{t.title}</h3>
            {['Analytical Thinking', 'Innovative Ideas', 'Social Influence', 'Adaptability'].map((stat, i) => (
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