import React, { useState, useEffect } from 'react';
import axios from "axios";
import './Parametre.css';
import LanguageSelect from '../../Elementes/LanguageSelect';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router';

const Settings = () => {
  const { user, token, logout ,loginContext } = useAuth();
  const navigate = useNavigate();

  // 1. States dyal l-Infos
  const [isInfosOpen, setIsInfosOpen] = useState(false);
  const [firstName, setFirstName] = useState(user?.prenom || "");
  const [lastName, setLastName] = useState(user?.nom || "");
  const [isSaving, setIsSaving] = useState(false);

  // 2. States dyal l-Image
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  // 3. States dyal Delete Popup
  const [show, setShow] = useState(false);
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // --- 4. DARK MODE LOGIC (FINAL & FIXED) ---
  // كنقرأو الحالة من localStorage مباشرة فـ أول rendering
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    const theme = isDark ? 'dark' : 'light';
    // كنطبقو الـ theme على الـ root (html tag)
    document.documentElement.setAttribute('data-theme', theme);
    // كنسجلو الاختيار باش ميمشيش فـ Refresh
    localStorage.setItem('theme', theme);
  }, [isDark]);
  // ------------------------------------------

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(file));
      
      const formData = new FormData();
      formData.append('photo', file);
      try {
        setUploading(true);
        const res = await axios.post("http://localhost:8000/api/update-photo", formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        const updatedUser = { ...user, photo: res.data.path };
        loginContext(updatedUser,token)
        navigate('/Profile')
      } catch (err) {
        alert("Erreur d'upload ❌");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setIsSaving(true);
      await axios.post("http://localhost:8000/api/update-profile", 
        { nom: lastName, prenom: firstName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Profil mis à jour ✅");
    } catch (err) {
      alert("Erreur lors de la mise à jour ❌");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      await axios.post(
        "http://localhost:8000/api/delete-account",
        { password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Compte supprimé ✅");
      logout();
      navigate("/login");
    } catch (err) {
      alert("Password incorrect ❌");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="settings-wrapper">
      <div className="settings-container">
        <header className="settings-header">
          <h1>Paramètres du compte</h1>
          <p>Gérez vos préférences et la sécurité de votre profil</p>
        </header>

        <div className="settings-sections">
          
          {/* 1. Langue */}
          <div className="settings-row">
            <div className="info-side">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              <div>
                <h3>Langue</h3>
                <p>Langue de l'interface utilisateur</p>
              </div>
            </div>
            <LanguageSelect />
          </div>

          {/* 2. Infos Personnelles */}
          <div className={`settings-row-group ${isInfosOpen ? 'active' : ''}`}>
            <div className="settings-row clickable" onClick={() => setIsInfosOpen(!isInfosOpen)}>
              <div className="info-side">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <div>
                  <h3>Informations personnelles</h3>
                  <p>Modifier votre nom et prénom</p>
                </div>
              </div>
              <svg className={`arrow-icon ${isInfosOpen ? 'rotate' : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
            </div>
            
            <div className="collapsible-content">
              <div className="input-grid">
                <div className="input-group">
                  <label>Nom</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Prénom</label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
              </div>
              <button className="btn-save" onClick={handleUpdateProfile} disabled={isSaving}>
                {isSaving ? "Chargement..." : "Enregistrer les modifications"}
              </button>
            </div>
          </div>

          {/* 3. Photo de Profil */}
          <div className="settings-row">
            <div className="info-side">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              <div>
                <h3>Photo de profil</h3>
                <p>{uploading ? "Upload en cours..." : "Format JPG ou PNG recommandé"}</p>
              </div>
            </div>
            <label className="avatar-uploader">
              <input type="file" onChange={handleImageChange} hidden accept="image/*" />
              <div className={`avatar-preview ${uploading ? 'uploading-pulse' : ''}`}>
                {(preview || user?.photo) ? (
                  <img 
                    src={preview || `http://localhost:8000/storage/${user?.photo}`} 
                    alt="Profile" 
                    className='imgdyl'
                  />
                ) : (
                  <div className="initials-container">
                    {/* الحروف الأولى من السمية */}
                    <span className="plus-icon">+</span>
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* 4. Mode Sombre (Toggle Switch) */}
          <div className="settings-row">
            <div className="info-side">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                <div>
                  <h3>Mode sombre</h3>
                  <p>Passer au thème sombre pour la nuit</p>
                </div>
            </div>
            <label className="modern-switch">
                <input 
                  type="checkbox" 
                  checked={isDark} 
                  onChange={() => setIsDark(!isDark)} 
                />
                <span className="modern-slider"></span>
            </label>
          </div>

          {/* 5. Danger Zone (Suppression) */}
          <div className="settings-row danger-zone">
            <div className="info-side">
              <svg className="danger-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              <div>
                <h3 className="danger-text">Supprimer le compte</h3>
                <p>Cette action est irréversible</p>
              </div>
            </div>
            <button className="btn-delete" onClick={() => setShow(true)}>Supprimer</button>
            
            {show && (
              <div className="popup-overlay">
                <div className="popup-content">
                  <h3>Confirmez la suppression</h3>
                  <p>Veuillez saisir votre mot de passe pour confirmer.</p>
                  <input
                    type="password"
                    placeholder="Mot de passe"
                    className="popup-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="popup-actions">
                    <button className="confirm-btn" onClick={confirmDelete} disabled={isDeleting}>
                      {isDeleting ? "Suppression..." : "Confirmer"}
                    </button>
                    <button className="cancel-btn" onClick={() => setShow(false)}>Annuler</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;