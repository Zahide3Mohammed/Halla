import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Club.css';
import { useAuth } from '../../context/AuthContext';
import ClubSkeleton from './ClubSkeleton';
import { Link } from 'react-router-dom';

const API_URL = "/api";
const STORAGE_URL = "/storage";

const Club = () => {
  const Icons = {
    Feed: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    Explore: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
    Clubs: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    Settings: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    Media: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
    Heart: ({ filled }) => <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    Comment: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.1a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>,
    Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    Trash: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>,
    Check: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  };

  const [currentTab, setCurrentTab] = useState('feed'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false); 
  
  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]); 
  const [requestedUsers, setRequestedUsers] = useState([]); 
  const [activeComments, setActiveComments] = useState({});
  const [commentTexts, setCommentTexts] = useState({}); 
  const [loading, setLoading] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(false); 
  const [nextPageUrl, setNextPageUrl] = useState(null);
  
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { token, user } = useAuth();
  const userBrandColor = user?.color || user?.brand_color || "#6366f1";

  // ==========================================
  // FETCH FRIEND SUGGESTIONS
  // ==========================================
  const fetchFriendSuggestions = async () => {
    try {
      setLoadingFriends(true);
      const response = await axios.get(`${API_URL}/friend-suggestions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const users = Array.isArray(response.data) ? response.data : response.data.data || [];
      setSuggestedUsers(users);

      // ✨ Kan flltriw gher nas li 3ndhom pending status yb9aw baynin direct mn database
      const alreadyRequested = users
        .filter(u => u.request_sent || u.follow_status === 'pending' || u.is_pending || u.status === 'pending')
        .map(u => u.id);
      setRequestedUsers(alreadyRequested);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoadingFriends(false);
    }
  };
//==========================================
  const handleFollowRequest = async (targetUserId) => {
    const isCurrentlyRequested = requestedUsers.includes(targetUserId);
    if (isCurrentlyRequested) {
      setRequestedUsers(prev => prev.filter(id => id !== targetUserId));
    } else {
      setRequestedUsers(prev => [...prev, targetUserId]);
    }
    try {
      const response = await axios.post(`${API_URL}/users/${targetUserId}/follow`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.status === 'cancelled') {
        setRequestedUsers(prev => prev.filter(id => id !== targetUserId));
      } else if (response.data && response.data.status === 'success') {
        if (!requestedUsers.includes(targetUserId)) {
          setRequestedUsers(prev => [...prev, targetUserId]);
        }
      }
    } catch (error) {
      console.error("Error toggling follow request:", error);
      if (isCurrentlyRequested) {
        setRequestedUsers(prev => [...prev, targetUserId]);
      } else {
        setRequestedUsers(prev => prev.filter(id => id !== targetUserId));
      }
    }
  };
//=========================================
  const fetchPosts = async (url = `${API_URL}/posts`, search = '') => {
    try {
      setLoading(true);
      let targetUrl = url;
      if (search) {
        const urlObj = new URL(url, window.location.origin);
        urlObj.searchParams.set('search', search);
        targetUrl = urlObj.pathname + urlObj.search;
      }
      const response = await axios.get(targetUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const incomingData = response.data.data || response.data;
      if (url === `${API_URL}/posts`) {
        setPosts(Array.isArray(incomingData) ? incomingData : []);
      } else {
        setPosts(prev => [...prev, ...(Array.isArray(incomingData) ? incomingData : [])]);
      }
      setNextPageUrl(response.data.next_page_url || null);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };
// ==========================================
  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${API_URL}/groups`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data.data || response.data;
      setGroups(Array.isArray(data) ? data.slice(0, 5) : []);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };
  useEffect(() => {
    fetchPosts();
    fetchGroups();
    fetchFriendSuggestions(); 
  }, []);

  const executeSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (searchQuery.trim() !== '') {
        setHasSearched(true);
        fetchPosts(`${API_URL}/posts`, searchQuery);
      } else {
        setHasSearched(false);
        setPosts([]);
      }
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Voulez-vous supprimer ce post ?")) return;
    try {
      await axios.delete(`${API_URL}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(posts.filter(p => p.id !== postId));
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };
  const handleLike = async (postId) => {
    let previousPostState = null;
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        previousPostState = { ...post }; 
        const willBeLiked = !post.is_liked;
        return {
          ...post,
          is_liked: willBeLiked,
          likes_count: willBeLiked ? (post.likes_count || 0) + 1 : Math.max(0, (post.likes_count || 0) - 1)
        };
      }
      return post;
    }));
    try {
      const response = await axios.post(`${API_URL}/posts/${postId}/toggle-like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(prevPosts => prevPosts.map(post => 
        post.id === postId 
          ? { ...post, is_liked: response.data.liked, likes_count: response.data.count }
          : post
      ));
    } catch (error) {
      if (previousPostState) {
        setPosts(prevPosts => prevPosts.map(post => post.id === postId ? previousPostState : post));
      }
    }
  };
  const toggleComments = async (postId) => {
    if (activeComments[postId]) {
      setActiveComments({ ...activeComments, [postId]: null });
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/posts/${postId}/comments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveComments({ ...activeComments, [postId]: res.data });
    } catch (e) { console.error(e); }
  };

  const handleSendComment = async (postId) => {
    const text = commentTexts[postId];
    if (!text?.trim()) return;
    try {
      const res = await axios.post(`${API_URL}/posts/${postId}/comments`, 
        { body: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newComment = { ...res.data, user: { nom: user.nom, prenom: user.prenom, photo: user.photo, sexe: user.sexe } };
      
      const currentComments = Array.isArray(activeComments[postId]) 
        ? activeComments[postId] 
        : (activeComments[postId]?.data || []);

      setActiveComments({
        ...activeComments,
        [postId]: [newComment, ...currentComments]
      });
      setCommentTexts({ ...commentTexts, [postId]: '' });
      setPosts(prev => prev.map(p => p.id === postId ? {...p, comments_count: (p.comments_count || 0) + 1} : p));
    } catch (e) { console.error(e); }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim() && !selectedImage) return;
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('content', newPostContent);
    if (selectedImage) { formData.append('image', selectedImage); }
    try {
      const response = await axios.post(`${API_URL}/posts`, formData, {
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      const newCreatedPost = {
        ...response.data,
        user: { nom: user.nom, prenom: user.prenom, photo: user.photo, sexe: user.sexe },
        likes_count: 0,
        comments_count: 0,
        created_at: new Date().toISOString()
      };
      setPosts([newCreatedPost, ...posts]);
      setNewPostContent('');
      setSelectedImage(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error(error);
    } finally { setIsSubmitting(false); }
  };

  const getProfileIcon = (variant, userPhoto) => {
    if (userPhoto) {
      return <img src={`${STORAGE_URL}/${userPhoto}`} alt="Profile" className="AuthX_AvatarImg_Main_55" />;
    }
    return (
      <svg viewBox="0 0 24 24" fill={variant === "Femme" ? "#e2ab97" : "#4a5568"}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
      </svg>
    );
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return "A l'instant";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return "A l'instant";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 84600) return `${Math.floor(diffInSeconds / 3600)} h`;
    return date.toLocaleDateString('fr-FR');
  };

  const commentsArray = (postId) => {
    const raw = activeComments[postId];
    if (!raw) return [];
    return Array.isArray(raw) ? raw : (raw.data || []);
  };

  return (
    <>
      <style>{`
        :root { --user-brand-color: ${userBrandColor} !important; }
        .AuthX_LeftNav_Aside_55 { position: sticky; top: 80px; height: calc(100vh - 100px); }
        .explore-search-container_55 { background: white; border-radius: 14px; padding: 16px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #eef1f6; display: flex; align-items: center; gap: 12px; }
        .explore-search-container_55 input { border: none; outline: none; width: 100%; font-size: 0.95rem; color: #1e293b; }
        .premium-del-action { background: #fef2f2; border: none; color: #ef4444; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; opacity: 0; }
        .AuthX_PostItem_Card_55:hover .premium-del-action { opacity: 1; }
        .premium-del-action:hover { background: #fee2e2; transform: scale(1.05); }
        .post-metrics-row_55 { display: flex; justify-content: space-between; padding: 10px 4px 4px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b; margin-bottom: 4px; }
        .explore-placeholder-box_55 { padding: 60px 20px; text-align: center; color: #94a3b8; display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .friends-embedded-container_55 { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #eef1f6; }
        .friend-card_55 { display: flex; align-items: center; justify-content: space-between; padding: 12px; border-bottom: 1px solid #f1f5f9; }
        .btn-follow-action_55 { padding: 6px 14px; font-size: 0.85rem; font-weight: 600; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
        .btn-follow-action_55.pending { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; cursor: pointer; }
        .btn-follow-action_55.pending:hover { background: #fee2e2; color: #ef4444; border-color: #fca5a5; }
      `}</style>

      <div className="AuthX_ClubApp_Wrapper_55 AuthX_ThemeLight_55">
        <div className="AuthX_MainGrid_Layout_55">

          {/* --- SIDEBAR --- */}
          <aside className="AuthX_LeftNav_Aside_55">
            <nav className="AuthX_SideNav_Menu_55">
              <div className={`AuthX_NavItem_Link_55 ${currentTab === 'feed' ? 'active' : ''}`} onClick={() => { setCurrentTab('feed'); fetchPosts(`${API_URL}/posts`, ''); }}>
                <Icons.Feed /> <span>Feed</span>
              </div>
              <div className={`AuthX_NavItem_Link_55 ${currentTab === 'explore' ? 'active' : ''}`} onClick={() => { setCurrentTab('explore'); setHasSearched(false); setPosts([]); setSearchQuery(''); }}>
                <Icons.Explore /><span>Explore</span>
              </div>
              <div className={`AuthX_NavItem_Link_55 ${currentTab === 'friends' ? 'active' : ''}`} onClick={() => { setCurrentTab('friends'); fetchFriendSuggestions(); }}>
                <Icons.Clubs /> <span>Find Friends</span>
              </div>
              <div className="AuthX_NavItem_Link_55">
                <Icons.Settings /><span>Settings</span>
              </div>
            </nav>
          </aside>

          {/* --- MAIN INTERACTIVE VIEW AREA --- */}
          <main className="AuthX_FeedSection_Core_55">
            
            {/* 🔍 Explore View */}
            {currentTab === 'explore' && (
              <div className="explore-search-container_55">
                <span style={{ color: '#94a3b8', cursor: 'pointer' }} onClick={executeSearch}><Icons.Search /></span>
                <input 
                  type="text" 
                  placeholder="Tapez un mot-clé ou #hashtag + cliquez sur Entrée..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={executeSearch}
                />
              </div>
            )}

            {/* Feed Create Card */}
            {currentTab === 'feed' && (
              <div className="AuthX_CreatePost_Card_55">
                <div className="AuthX_CreatePost_Header_55">
                  <div className="AuthX_Avatar_Wrap_55 AuthX_SizeMd_55">
                    {getProfileIcon(user?.sexe, user?.photo)}
                  </div>
                  <input 
                    className='AuthX_PostInput_Control_55'
                    placeholder={`What's on your mind, ${user?.prenom || 'Friend'}?`}
                    value={newPostContent} 
                    onChange={(e) => setNewPostContent(e.target.value)} />
                </div>

                {previewUrl && (
                  <div className="AuthX_PostPreview_Media_55">
                    <img src={previewUrl} alt="Preview" />
                    <button className="AuthX_RemoveMedia_Btn_55" onClick={() => {setSelectedImage(null); setPreviewUrl(null);}}>✕</button>
                  </div>
                )}

                <div className="AuthX_CreatePost_Footer_55">
                  <label className="AuthX_Option_Btn_55">
                    <Icons.Media /> Media
                    <input type="file" hidden onChange={handleImageChange} accept="image/*" />
                  </label>
                  <button 
                    className="AuthX_PostSubmit_Btn_55" 
                    onClick={handleCreatePost}
                    disabled={isSubmitting || (!newPostContent && !selectedImage)}>
                    {isSubmitting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            )}

            {/* 👥 Find Friends Tab */}
            {currentTab === 'friends' && (
              <div className="friends-embedded-container_55">
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: 700 }}>Suggestions d'amis</h3>
                {loadingFriends ? (
                  <ClubSkeleton count="3" />
                ) : suggestedUsers.length > 0 ? (
                  suggestedUsers.map(u => {
                    const isRequested = requestedUsers.includes(u.id);
                    return (
                      <div key={u.id} className="friend-card_55">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="AuthX_Avatar_Wrap_55 AuthX_SizeMd_55">
                            {getProfileIcon(u.sexe, u.photo)}
                          </div>
                          <b>{u.nom} {u.prenom}</b>
                        </div>
                        
                        <button 
                          className={`btn-follow-action_55 ${isRequested ? 'pending' : ''}`}
                          style={!isRequested ? { background: 'var(--user-brand-color)', color: 'white' } : {}}
                          onClick={() => handleFollowRequest(u.id)}
                        >
                          {isRequested ? (
                            <>
                              <Icons.Check />
                              <span>Demandé</span>
                            </>
                          ) : (
                            'Suivre'
                          )}
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Aucune suggestion pour le moment.</p>
                )}
              </div>
            )}

            {/* POSTS LIST */}
            {currentTab !== 'friends' && (
              <div className="AuthX_PostsList_Stack_55">
                {currentTab === 'explore' && !hasSearched ? (
                  <div className="explore-placeholder-box_55">
                    <Icons.Explore />
                    <p style={{ fontWeight: 600, fontSize: '15px' }}>Découvrez de nouveaux contenus</p>
                    <span style={{ fontSize: '13px' }}>Écrivez quelque chose ci-dessus pour lancer la recherche globale.</span>
                  </div>
                ) : posts.length > 0 ? (
                  posts.map((post) => (
                    <article key={post.id} className="AuthX_PostItem_Card_55">
                      <div className="AuthX_PostItem_Head_55">
                        <div className="AuthX_Avatar_Wrap_55 AuthX_SizeMd_55">
                          <Link to={`/profile/${post.user_id}`} className="user-avatar-link">
                            {getProfileIcon(post.user?.sexe, post.user?.photo)}
                          </Link>
                        </div>
                        <div className="AuthX_PostItem_Info_55">
                          <div className="AuthX_Meta_Row_55">
                            <span className="AuthX_AuthorName_Txt_55">{post.user?.nom} {post.user?.prenom}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}> 
                              {user?.id === post.user_id && (
                                <button className="premium-del-action" onClick={() => handleDeletePost(post.id)}>
                                  <Icons.Trash />
                                </button>
                              )}
                              <span className="AuthX_Dots_Menu_55">...</span>
                            </div>
                          </div>
                          <div className="AuthX_Meta_Row_55 AuthX_MetaSub_55">
                            <span>{formatRelativeTime(post.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="AuthX_PostItem_Content_55">
                        <p>{post.content}</p>
                        {post.media_url && (
                          <div className="AuthX_PostItem_Media_55">
                            <img src={`${STORAGE_URL}/${post.media_url}`} alt="Attachment" />
                          </div>
                        )}
                      </div> 

                      <div className="post-metrics-row_55">
                        <span>{post.likes_count || 0} likes</span>
                        <span>{post.comments_count || 0} comments</span>
                      </div>

                      <div className="AuthX_PostActions_Wrapper_55">
                        <div className="AuthX_PostActions_Flex_55">
                          <button className={`AuthX_Action_Btn_55 ${post.is_liked ? 'liked' : ''}`} onClick={() => handleLike(post.id)}>
                            <span className="AuthX_HeartIcon_Wrap_55"><Icons.Heart filled={post.is_liked}/></span>
                            <span>Like</span>
                          </button>
                          <button className="AuthX_Action_Btn_55" onClick={() => toggleComments(post.id)}>
                            <Icons.Comment /> <span>Comment</span>
                          </button>
                        </div>
         
                        {activeComments[post.id] && (
                          <div className="AuthX_CommentsSection_Box_55">
                            <div className="AuthX_CommentInput_Wrap_55">
                              <input 
                                placeholder="Write a comment..." 
                                value={commentTexts[post.id] || ''}
                                onChange={(e) => setCommentTexts({...commentTexts, [post.id]: e.target.value})}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendComment(post.id)}
                              />
                            </div>
                            <div className="AuthX_CommentsList_Stack_55">
                              {commentsArray(post.id).map(c => (
                                <div key={c.id} className="AuthX_CommentItem_Row_55">
                                  <div className="AuthX_Avatar_Wrap_55 AuthX_SizeSm_55">
                                    {getProfileIcon(c.user?.sexe, c.user?.photo)}
                                  </div>
                                  <div className="AuthX_CommentBubble_Txt_55">
                                    <b>{c.user?.nom} {c.user?.prenom}</b>
                                    <p>{c.body}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </article>
                  ))
                ) : (
                  hasSearched && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', background: 'white', borderRadius: '16px' }}>
                      Aucune publication correspondante
                    </div>
                  )
                )}

                {nextPageUrl && !loading && (
                  <button className="AuthX_ShowMore_Btn_55" onClick={() => fetchPosts(nextPageUrl, searchQuery)}>
                    Show More Posts
                  </button>
                )}
              </div>
            )}
          </main>

          {/* --- RIGHT SIDEBAR SUGGESTIONS --- */}
          <aside className="AuthX_RightWidgets_Aside_55">
            <div className="AuthX_WidgetCard_Box_55">
              <h4>Suggested Groups</h4>
              <div className="AuthX_WidgetList_Stack_55">
                {groups.length > 0 ? (
                  groups.map((group) => (
                    <div key={group.id} className="AuthX_ClubItem_Row_55">
                      <div className="AuthX_Avatar_Wrap_55 AuthX_SizeMd_55" style={{ overflow: 'hidden' }}>
                        {group.image ? (
                          <img src={`${STORAGE_URL}/${group.image}`} alt={group.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ background: 'color-mix(in srgb, var(--user-brand-color), transparent 85%)', color: 'var(--user-brand-color)', fontWeight: 'bold', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {group.nom ? group.nom.charAt(0).toUpperCase() : 'G'}
                          </div>
                        )}
                      </div>
                      <div className="AuthX_ItemInfo_Col_55">
                        <span className="AuthX_ItemName_Txt_55">{group.nom}</span>
                        <span className="AuthX_ItemSub_Txt_55">{group.users_count || group.membres_count || 0} members</span>
                      </div>
                      <button className="AuthX_JoinInline_Btn_55">Join</button>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '12px 0', fontSize: '0.9rem', color: '#64748b', textAlign: 'center' }}>Aucun groupe suggéré</div>
                )}
              </div>
            </div>
          </aside>

        </div>
      </div>
    </>
  );
};

export default Club;