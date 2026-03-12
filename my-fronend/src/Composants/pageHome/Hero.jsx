import React, { useState, useEffect } from 'react';
import './Hero.css'; 
import { useLanguage } from '../../Elementes/LanguageContext';
import { translationsHome } from '../../Elementes/translations/translationsHome';
import PricingModal from './PricingModal';
import Header from '../../Elementes/header';

export default function PremiumHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPricing, setShowPricing] = useState(false);
  const bgSlides = [
    "/images/img1.png", "/images/img2.jpg", "/images/img3.png",
    "/images/img4.jpg", "/images/img5.png", "/images/img6.jpg", "/images/img7.png",
  ];
  const { language } = useLanguage();
  const t = translationsHome[language];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === bgSlides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [bgSlides.length]);

  return (
    <>
      <Header />
      <div className="AuthX_PageWrapper_100">
        <div className="AuthX_Marquee_Container_88">
          <div className="AuthX_Marquee_Track_88">
            <span>Hello</span><span>Bonjour</span><span>Hola</span><span>مرحبا</span>
            <span>ⴰⵣⵓⵍ</span><span>Olá</span><span>नमस्ते</span><span>你好</span>
            <span>Ciao</span><span>Merhaba</span><span>Hei</span><span>Hej</span>
            {/* التكرار للتحريك المستمر */}
            <span>Hello</span><span>Bonjour</span><span>Hola</span><span>مرحبا</span>
            <span>ⴰⵣⵓⵍ</span><span>Olá</span><span>नमस्ते</span><span>你好</span>
            <span>Ciao</span><span>Merhaba</span><span>Hei</span><span>Hej</span>
          </div>
        </div>

        <section className={`AuthX_HeroSection_Main_55 ${language === "ar" ? "AuthX_RTL_Align" : "AuthX_LTR_Align"}`}>
          <div className="AuthX_Hero_BgSlider_22">
            {bgSlides.map((slide, index) => (
              <div
                key={index}
                className={`AuthX_SlideImg_Item_22 ${index === currentSlide ? 'AuthX_Active_Slide' : ''}`}
                style={{ backgroundImage: `url(${slide})` }}
              />
            ))}
            <div className="AuthX_Hero_DarkOverlay_22"></div>
          </div>

          <section className="AuthX_Asymmetric_Split_44">
            <div className="AuthX_HeroGrid_Container_44">
              {/* الجهة اليمنى: العنوان */}
              <div className="AuthX_HeroTitle_Side_11">
                <h1 className={`AuthX_MainTitle_Text_11 ${language === "ar" ? "AuthX_Font_Ar_Big" : "AuthX_Font_En_Big"}`}>
                  <span className="AuthX_GlowText_Red"> {t.heroone} </span><br />
                  {t.herotwo}<br />
                  <span className="AuthX_GlowText_Red">{t.herothre}</span>
                </h1>
              </div>

              {/* الجهة اليسرى: المعلومات */}
              <div className="AuthX_HeroInfo_Side_11">
                <p className="AuthX_HeroDesc_Text_09">{t.paradesc}</p>
                <div className="AuthX_HeroActions_Box_09">
                  <button onClick={() => setShowPricing(true)} className="AuthX_CtaBtn_White">
                    {t.start}
                  </button>
                  <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />
                  <div className="AuthX_UserProof_Stack_07">
                    <div className="AuthX_AvatarGroup_07">
                      <img src={`https://i.pravatar.cc/100?u=1`} alt="user" />
                      <img src={`https://i.pravatar.cc/100?u=2`} alt="user" />
                      <img src={`https://i.pravatar.cc/100?u=3`} alt="user" />
                    </div>
                    <span className="AuthX_UserCount_Label_07">{t.usersnum}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <svg className="AuthX_WaveDivider_Bottom" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,60 C120,100 240,20 360,40 C480,60 600,100 720,80 C840,60 960,20 1080,40 C1200,60 1320,100 1440,80 L1440,120 L0,120 Z" fill="white" />
          </svg>
        </section>
      </div>
    </>
  );
}