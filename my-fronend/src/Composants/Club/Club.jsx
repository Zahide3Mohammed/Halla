import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Club.css';
import { useAuth } from '../../context/AuthContext';
import ClubSkeleton from './ClubSkeleton';
import { Link } from 'react-router-dom';

const API_URL = "http://localhost:8000/api";
const STORAGE_URL = "http://localhost:8000/storage";

const Club = () => {
  // --- Icons Toolkit ---
  const Icons = {
    Feed: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    Explore: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
    Clubs: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    Settings: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    Media: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
    Heart: ({ filled }) => <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "#f43f5e" : "none"} stroke={filled ? "#f43f5e" : "currentColor"} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    Comment: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.1a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>,
  };

  const [posts, setPosts] = useState([]);
  const [activeComments, setActiveComments] = useState({});
  const [commentTexts, setCommentTexts] = useState({}); 
  const [loading, setLoading] = useState(true);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token, user } = useAuth();

  // --- Fetching Logic ---
  const fetchPosts = async (url = `${API_URL}/posts`) => {
    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const incomingData = response.data.data;
      if (url === `${API_URL}/posts`) {
        setPosts(incomingData);
      } else {
        setPosts(prev => [...prev, ...incomingData]);
      }
      setNextPageUrl(response.data.next_page_url);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // --- Profile Helpers ---
  const getProfileIcon = (variant, userPhoto) => {
    if (userPhoto) {
      return <img src={`${STORAGE_URL}/${userPhoto}`} alt="Profile" className="AuthX_AvatarImg_Main_55" />;
    }
    const icons = {
      Femme: (<svg viewBox="0 0 24 24" fill="#e2ab97"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>),
      Homme: (<svg viewBox="0 0 24 24" fill="#4a5568"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>),
    };
    return icons[variant] || icons.Homme;
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

  // --- Interaction Logic ---
  const handleLike = async (postId) => {
    try {
        const response = await axios.post(`${API_URL}/posts/${postId}/toggle-like`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setPosts(prevPosts => prevPosts.map(post => 
            post.id === postId 
            ? { ...post, is_liked: response.data.liked, likes_count: response.data.count }
            : post
        ));
    } catch (error) { console.error("Error liking post", error); }
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
    } catch (e) { console.error("Error fetching comments", e); }
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
      setActiveComments({
        ...activeComments,
        [postId]: [newComment, ...(activeComments[postId] || [])]
      });
      setCommentTexts({ ...commentTexts, [postId]: '' });
      setPosts(prev => prev.map(p => p.id === postId ? {...p, comments_count: p.comments_count + 1} : p));
    } catch (e) { console.error("Error sending comment", e); }
  };

  // --- Create Post Logic ---
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
      console.error("Post error:", error);
    } finally { setIsSubmitting(false); }
  };

  if (loading && posts.length === 0) return <ClubSkeleton />;

  return (
    <div className="AuthX_ClubApp_Wrapper_55 AuthX_ThemeLight_55">
      <div className="AuthX_MainGrid_Layout_55">

        {/* --- Left Sidebar --- */}
        <aside className="AuthX_LeftNav_Aside_55">
          <nav className="AuthX_SideNav_Menu_55">
            <div className="AuthX_NavItem_Link_55 active"><Icons.Feed /> <span>Feed</span></div>
            <div className="AuthX_NavItem_Link_55"><Icons.Explore /><span>Explore</span></div>
            <Link to='/Find-Friends' className="AuthX_NavItem_Link_55"><Icons.Clubs /> <span>Find Friends</span></Link>
            <div className="AuthX_NavItem_Link_55"><Icons.Settings /><span>Settings</span></div>
          </nav>
        </aside>

        {/* --- Main Feed --- */}
        <main className="AuthX_FeedSection_Core_55">
          
          {/* Create Post Area */}
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

          {/* Posts List */}
          <div className="AuthX_PostsList_Stack_55">
            {posts.map((post) => (
              <article key={post.id} className="AuthX_PostItem_Card_55">
                <div className="AuthX_PostItem_Head_55">
                  <div className="AuthX_Avatar_Wrap_55 AuthX_SizeMd_55">
                    {getProfileIcon(post.user?.sexe, post.user?.photo)}
                  </div>
                  <div className="AuthX_PostItem_Info_55">
                    <div className="AuthX_Meta_Row_55">
                      <span className="AuthX_AuthorName_Txt_55">{post.user?.nom} {post.user?.prenom}</span>
                      <span className="AuthX_Dots_Menu_55">...</span>
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
                      <img src={`${STORAGE_URL}/${post.media_url}`} alt="Post Media" />
                    </div>
                  )}
                </div> 

                <div className="AuthX_PostActions_Wrapper_55">
                  <div className="AuthX_PostActions_Flex_55">
                    <button className={`AuthX_Action_Btn_55 ${post.is_liked ? 'liked' : ''}`} onClick={() => handleLike(post.id)}>
                      <span className="AuthX_HeartIcon_Wrap_55"><Icons.Heart filled={post.is_liked}/></span>
                      <span>{post.likes_count || 0}</span>
                    </button>
                    <button className="AuthX_Action_Btn_55" onClick={() => toggleComments(post.id)}>
                      <Icons.Comment /> <span>{post.comments_count || 0}</span>
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
                        {activeComments[post.id].map(c => (
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
            ))}

            {nextPageUrl && (
              <button className="AuthX_ShowMore_Btn_55" onClick={() => fetchPosts(nextPageUrl)} disabled={loading}>
                {loading ? 'Loading...' : 'Show More Posts'}
              </button>
            )}
          </div>
        </main>

        {/* --- Right Sidebar --- */}
        <aside className="AuthX_RightWidgets_Aside_55">
          <div className="AuthX_WidgetCard_Box_55">
            <h4>Suggested Clubs</h4>
            <div className="AuthX_WidgetList_Stack_55">
              <div className="AuthX_ClubItem_Row_55">
                 <div className="AuthX_Avatar_Wrap_55 AuthX_SizeMd_55" style={{background: '#e0e7ff', color: '#6366f1', fontWeight: 'bold'}}>M</div>
                 <div className="AuthX_ItemInfo_Col_55">
                    <span className="AuthX_ItemName_Txt_55">Maroc Trip</span>
                    <span className="AuthX_ItemSub_Txt_55">1.9k members</span>
                 </div>
                 <button className="AuthX_JoinInline_Btn_55">Join</button>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default Club;