import React, { useState, useEffect } from 'react';
import './Hero.Module.css';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../Elementes/LanguageContext';
import { translationsHome } from '../../Elementes/translations/translationsHome';
import PricingModal from './PricingModal';
import Header from '../../Elementes/header';

export default function PremiumHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPricing, setShowPricing] = useState(false);
   const bgSlides = [
    "/images/img1.png", 
    "/images/img2.jpg",
    "/images/img3.png",
    "/images/img4.jpg",
    "/images/img5.png",
    "/images/img6.jpg",
    "/images/img7.png",
  ];
  const { language }=useLanguage();
  const t =translationsHome[language];
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === bgSlides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [bgSlides.length]);

  return (<>
  <Header />
    <div className="premium-page-container">
        <div className="marquee">
                <div className="marquee-track">
                    <span>Hello</span>
                    <span>Bonjour</span>
                    <span>Hola</span>
                    <span>مرحبا</span>
                    <span>ⴰⵣⵓⵍ</span>
                    <span>Olá</span>
                    <span>नमस्ते</span>
                    <span>你好</span>
                    <span>Ciao</span>
                    <span>Merhaba</span>
                    <span>Hei</span>
                    <span >Hej</span>
                    <span>Hello</span>
                    <span>Bonjour</span>
                    <span>Hola</span>
                    <span>مرحبا</span>
                    <span>ⴰⵣⵓⵍ</span>
                    <span>Olá</span>
                    <span>नमस्ते</span>
                    <span>你好</span>
                    <span>Ciao</span>
                    <span>Merhaba</span>
                    <span>Hei</span>
                    <span>Hej</span>
                    <span>Hello</span>
                    <span>Bonjour</span>
                    <span>Hola</span>
                    <span>مرحبا</span>
                    <span>ⴰⵣⵓⵍ</span>
                    <span>Olá</span>
                    <span>नमस्ते</span>
                    <span>你好</span>
                    <span>Ciao</span>
                    <span>Merhaba</span>
                    <span>Hei</span>
                    <span>Hej</span>
                </div>
            </div>
         
      <section className={`activity-hero-section ${language==="ar"?"text-right":"text-left"}`} >
        <div className="hero-bg-slider">
          {bgSlides.map((slide, index) => (
            <div 
              key={index}
              className={`slide-img ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${slide})` }}
            />
          ))}
          <div className="hero-overlay-dark"></div>
        </div>
          <section className="hero-split-asymmetric">
              <div className="hero-container">
                
                {/* الجهة اليمنى: العنوان الكبير فقط */}
                <div className="hero-title-side">
                  <h1 className={`hero-main-title ${language==="ar"?"raharab":"rahla"}`}> 
                    <span className="glow-text"> {t.heroone} </span><br />
                    {t.herotwo}<br />
                     <span className="glow-text">{t.herothre}  </span> 
                  </h1>
                </div>

                {/* الجهة اليسرى: الوصف، الزر، والإحصائيات */}
                <div className="hero-info-side">
                  <p className="hero-description">{t.paradesc}</p>
                  
                  <div className="hero-actions">
                    <button onClick={()=>setShowPricing(true)} className="cta-primary">{t.start}</button>
                    <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />
                    <div className="user-proof">
                      <div className="avatar-stack">
                        <img src={`https://i.pravatar.cc/100?u=${Math.floor(Math.random() * 200)}`} alt="user" />
                        <img src={`https://i.pravatar.cc/100?u=${Math.floor(Math.random() * 201)}`} alt="user" />
                        <img src={`https://i.pravatar.cc/100?u=${Math.floor(Math.random() * 201)}`} alt="user" />
                      </div>
                      <span className="user-count-text">{t.usersnum}</span>
                    </div>
                  </div>
                </div>

              </div>
            </section>
            <svg className="wave" viewBox="0 0 1440 120"  preserveAspectRatio="none">
              <path d="M0,60 C120,100 240,20 360,40 C480,60 600,100 720,80 C840,60 960,20 1080,40 C1200,60 1320,100 1440,80 L1440,120 L0,120 Z" fill="white"/>
            </svg>
      </section>
      
    </div>
    </>
  );
}