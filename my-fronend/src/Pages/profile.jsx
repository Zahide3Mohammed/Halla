import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../Elementes/LanguageContext";
import { translationsLayout } from "../Elementes/translations/translationsLayout";
import axios from "axios"; // Zadna axios
import "./Profile.Module.css";
import { Link } from "react-router";

export default function Profile() {
  const { user, token } = useAuth(); // Zadna token hna
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [t3t,setT3t] =useState();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [myPosts, setMyPosts] = useState([]); // State jdid l-posts
  const t = translationsLayout[language];

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/my-posts", {
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
      // Simulation dyal t-charjil dyalk l-asliya
      const timer = setTimeout(() => setLoading(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [token]);

  // --- FUNCTION L-MSA7 ---
  const handleDeletePost = async (postId) => {
    const confirmMsg = language === "ar" ? "هل أنت متأكد من حذف هذا المنشور؟" : "Voulez-vous vraiment supprimer ce post ?";
    if (!window.confirm(confirmMsg)) return;

    try {
      await axios.delete(`http://localhost:8000/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyPosts(myPosts.filter(p => p.id !== postId));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const sidebarLinks = [
     { name:`${t.name_purple}`,color: "purple", image: "./images/purple-back.jpg" ,text:`${t.text_purple}` ,A_T: "80%", I_I: "90%", S_I: "50%", A: "70%"},
    { name:`${t.name_green}`,color: "green", image: "./images/green-back.jpg",text:`${t.text_green}`,A_T:"90%", I_I: "60%", S_I: "40%", A: "80%" },
    { name:`${t.name_yellow}`,color: "yellow", image: "./images/yellow-back.jpg",text:`${t.text_yellow}` ,A_T:"50%", I_I:"80%", S_I: "90%", A:"70%"  },
      { name:`${t.name_red}`,color:"red", image: "./images/red-back.jpg",text:`${t.text_red}`,A_T:"70%", I_I:"50%", S_I:"30%", A:"60%"  },
      { name:`${t.name_blue}`,color:"blue",image: "./images/blue-back.jpg",text:`${t.text_blue}`,A_T: "60%", I_I: "40%", S_I:"80%", A:"70%" }
];

  const ress = sidebarLinks.find((e)=>e.color===user?.color) || sidebarLinks;

  // --- 1. SKELETON LOADING VIEW ---
  if (loading) {
    return (
      <div className="profile-page-wrapper">
        <div className={`${language === "ar" ? "profile-container" : "profile-container ssh"}`}>
          <div className="profile-main">
            <header className="profile-header">
              <div className="cover-wrapper skeleton" style={{ height: '220px' }}></div>
              <div className="profile-intro">
                <div className="skeleton" style={{ width: '200px', height: '30px', marginBottom: '15px' }}></div>
                <div className="skeleton" style={{ width: '100%', height: '15px', marginBottom: '10px' }}></div>
                <div className="skeleton" style={{ width: '80%', height: '15px' }}></div>
              </div>
            </header>
            <div className="posts-grid">
              {myPosts.map((n) => (
                <div key={n} className="post-card skeleton" style={{ height: '250px' }}></div>
              ))}
            </div>
          </div>
          <aside className="profile-sidebar">
             <div className="stats-card skeleton" style={{ height: '300px' }}></div>
             <div className="stats-card skeleton" style={{ height: '300px' }}></div>
          </aside>
        </div>
      </div>
    );
  }

  // --- 2. ACTUAL PROFILE VIEW ---
  return (
    <div className={`profile-page-wrapper ${language === "ar" ? "right159" : "left159"}`}>
      <div className={`${language === "ar" ? "profile-container" : "profile-container ssh"}`}>
        
        <div className="profile-main">
          <header className="profile-header">
            <div className="cover-wrapper">
              <img src={
                user?.color
                ? ress.image
                : "./images/purple-back.jpg"
                } alt="Cover" className="cover-img" />
              <div className={language === "ar" ? "avatar-wrapper-ar" : "avatar-wrapper"}>
                <div className="avatar-ring" style={{ borderColor: `white` }}>
                  <img src={
                    !user?.photo 
                      ? "./icons/Nonprofilelight.jpg"
                      : `http://localhost:8000/storage/${user?.photo}`
                  } alt="" className="profile-img"/>
                  <label htmlFor="photo-upload" className="upload-btn" style={{ backgroundColor: ress.color }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
                  </label>
                  <input id="photo-upload" type="file" hidden />
                </div>
              </div>
            </div>

            <div className={language === "ar" ? "profile-intro text-right" : "profile-intro text-left"}>
              <h1 className="user-name">{user?.nom} {user?.prenom}</h1>
              {user?.color
                ? <div className="badge-wrapper">
                    <span className="label-text">{t.present} :</span>
                    <span className="personality-badge" style={{ backgroundColor: `${ress.color} `, color: "white" }}>
                      {ress.color}
                    </span>
                  </div>
                : <div className="badge-wrapper">
                  <span className="label-text">Passer le teste pour avoir une couleur !!</span>
                  <Link to="/Questions" >clicker ici !</Link>  
                </div>
                  
                  }
              <p className="personality-desc">{ress.text}</p>
            </div>

            <nav className="profile-tabs">
              <button className="tab-item active" style={{ '--active-color': ress.color }}>Posts ({myPosts.length})</button>
              <button className="tab-item">About</button>
              <button className="tab-item">Media</button>
            </nav>
          </header>

          <section className="posts-grid">
            {myPosts.length > 0 ? (
              myPosts.map((post) => (
                <article key={post.id} className="profile-post-card">
                  <div className="post-header-actions">
                    <button className="del-btn" onClick={() => handleDeletePost(post.id)}>🗑️</button>
                  </div>
                  
                  {post.media_url && (
                    <div className="post-media-wrapper">
                      <img src={`http://localhost:8000/storage/${post.media_url}`} alt="Post" />
                    </div>
                  )}
                  
                  <div className="post-body-content">
                    <p>{post.id}</p>
                    <p className="post-text">{post.content}</p>
                    <div className="post-footer-meta">
                      <span className="post-date-tag">{new Date(post.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-state-msg">
                <img src="./icons/empty-box.png" alt="Empty" />
                <p>{language === "ar" ? "لم تقم بنشر أي شيء بعد" : "Aucune publication pour le moment"}</p>
              </div>
            )}
          </section>
        </div>

        <aside className="profile-sidebar">
          <div className="stats-card">
            <h3 className="stats-title">{t.title}</h3>
            <div className="metric">
              <span className="metric-info">Analytical Thinking</span>
              <div className="bar">
                <div className="progress-bg" style={{ width: ress.A_T ,backgroundColor:ress.color}}></div>
              </div>
            </div>

            <div className="metric">
              <span className="metric-info">Innovative Ideas</span>
              <div className="bar">
                <div className="progress-bg" style={{ width: ress.I_I ,backgroundColor:ress.color}}></div>
              </div>
            </div>

            <div className="metric">
              <span className="metric-info">Social Influence</span>
              <div className="bar">
                <div className="progress-bg" style={{ width: ress.S_I ,backgroundColor:ress.color}}></div>
              </div>
            </div>

            <div className="metric">
              <span className="metric-info">Adaptability</span>
              <div className="bar">
                <div className="progress-bg" style={{ width: ress.A ,backgroundColor:ress.color}}></div>
              </div>
            </div>
          </div>

          <div className="stats-card">
            <h3 className="stats-title">{t.title}</h3>
            <div className="metric">
              <span className="metric-info">Analytical Thinking</span>
              <div className="bar">
                <div className="progress-bg" style={{ width: ress.A_T ,backgroundColor:ress.color}}></div>
              </div>
            </div>

            <div className="metric">
              <span className="metric-info">Innovative Ideas</span>
              <div className="bar">
                <div className="progress-bg" style={{ width: ress.I_I ,backgroundColor:ress.color}}></div>
              </div>
            </div>

            <div className="metric">
              <span className="metric-info">Social Influence</span>
              <div className="bar">
                <div className="progress-bg" style={{ width: ress.S_I ,backgroundColor:ress.color}}></div>
              </div>
            </div>

            <div className="metric">
              <span className="metric-info">Adaptability</span>
              <div className="bar">
                <div className="progress-bg" style={{ width: ress.A ,backgroundColor:ress.color}}></div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}