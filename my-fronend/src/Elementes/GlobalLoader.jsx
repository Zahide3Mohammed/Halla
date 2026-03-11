import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Bach njibou lon l-user
import './GlobalLoader.css';

const GlobalLoader = () => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  // Déterminer le couleur (Profile color vs Global color)
  const activeColor = user?.color;

  useEffect(() => {
    setVisible(true);
    setProgress(20);

    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
    }, 150);

    // Mnin t-tcharja l-page kamla (Window Load)
    const handleLoad = () => {
      setProgress(100);
      setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 400);
    };

    // F had l-hal dyal navigation d React
    const navigationTimeout = setTimeout(handleLoad, 500);

    return () => {
      clearInterval(timer);
      clearTimeout(navigationTimeout);
    };
  }, [location]);

  if (!visible) return null;

  return (
    <div className="global-progress-container">
      <div 
        className="global-progress-bar" 
        style={{ 
          width: `${progress}%`,
          backgroundColor: activeColor, // Lon dynamic!
          boxShadow: `0 0 10px ${activeColor}80` 
        }}>
     </div>
    </div>
  );
};

export default GlobalLoader;