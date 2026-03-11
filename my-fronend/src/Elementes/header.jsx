import React, { useState, useEffect } from 'react';
import './header-style.Module.css';
import LanguageSelect from './LanguageSelect';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="header-wrapperr">
      <header className={`floating-headerr ${isScrolled ? 'scrolledr' : ''}`}>
        <div className="header-containerr">
          
          
          <div className="header-logor">
            <a href="/">Halla<span>Maghreb</span></a>
          </div>

          {/* Actions - Left Side */}
          <div className="header-actionsr">
            <a href="#contact" className="contact-linkr">اتصل بنا</a>
            <LanguageSelect />
            
            <div className="burger-menur">
              <div className="line"></div>
              <div className="line short"></div>
            </div>
          </div>

        </div>
      </header>
    </div>
  );
}