import { Link, useNavigate } from 'react-router';
import Features from './askfeatures';

import './AskTest.css';
import Header from '../../Elementes/header';
import Footer from '../../Elementes/footer';
import { useLanguage } from '../../Elementes/LanguageContext';
import { translationsQuestions } from '../../Elementes/translations/translationsQuestions';

const AskTest = () => {
    const navigate=useNavigate();
    const { language }=useLanguage()
    const t=translationsQuestions[language]

  const avatars = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBYByi-YidsTxW7RFxvV7XgfbuL49E55Dr_73HAbfVfRdiNlIds4O3WaM3TiGAZ9hbnxO__WQ7iaw_mg4Vh8ZNntiRDnlWcMnlrjUDaIsfHsdj-Hs2VlWoyepw8eJuQ2jEdY7NIiOJKV3CF-PurnlBft23_KWKk-CJ0qGcJ16POQmXUSoyVZH7-zNYEvcg2XmRN-fLFEa4NUNTgxdsd6s-S9KsOrm6qxVeblzu8V4FuKj3v_IPjI1X0QVD0dr_bWtfsntzONxk0UQHm",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCb_ct8rAcXSD1DW2VjLBRRbGkllQyfbPYal8X3I6aE4Z6Fu10NWYNY19ippYHY_XYnaafxx_CVlUZMQwkuG_yoy4zYOGQiZ_qQMSBxg1GfMswktDrH0CrTMOI1PefKWWw-Mw0EFygko0J-xMzoJJxEB4M8d1CxnuH_yyEa7XIUzP1QI-m2Gzk7IOlb7Ca0t7WcooW6b0dGmqwim7-3POTW4v12g1-YMDRDwKSVovE8WwPFJQEw2V73c5elmiWmKH3X7H6wfkENaKkJ",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDboysMngDU__pIfLUTeNVJCJ4OLLGVTJ8FrEEBzUYLge6mdLXTY8gIS7l6JJO1W4JO7IpXVlXNm3I6NLxlSqOcDfvp8sBB_bfzAqM4OtUakD3FUzAOY2L1duKRzfwLrDbmbHHMWlUuy3-7PBzFOPvPabcAAyLYkQTjXxT_ZS_4XnH8_l0THkqdejHQiNGxGsrGp7WZ-edwekXtkmfBw9ARdcPI32OTaeOIP9VAWgk9g3Xwc07r5eEb-JVA_99MQGPqTEoA8yxFuO2K"
  ];
  const PassToTest = () =>{
    navigate('/Questions')
  }
  return <>
    <Header />
    <section className="asktest-section">
      <div className={`asktest-container ${language==="ar"?"text-right":"text-left"}`}>

        {/* Left */}
        <div className="asktest-left">

          <div className="badge-ask">
            <span className="material-symbols-outlined-ask">
              {t.personalgro}
            </span>
          </div>

          <h1 className="asktest-title">
           {t.discover} <br />
            <span className="primary italic">{t.discover2}</span>
          </h1>

          <p className="asktest-desc">
            {t.descrAsk}
          </p>

          <div className="asktest-buttons">
            <button className="btn-primary-ask" onClick={()=>PassToTest()}>
             {t.startbtn} </button>

            <Link to="/Profile" className="btn-secondary">
              {t.btn2}
            </Link>
          </div>

          <div className="asktest-users">
            <div className="avatars">
              {avatars.map((url, i) => (
                <div
                  key={i}
                  className="avatar"
                  style={{ backgroundImage: `url(${url})` }}
                />
              ))}
            </div>
            <p>
              {t.join}
            </p>
          </div>

          <div className="asktest-time">
            <span className="material-symbols-outlined">
              {t.timetest}
            </span>
          </div>

        </div>

        {/* Right */}
        <div className="asktest-right">

          <div className="image-box">
            <div
              className="image-inner"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCx4VKeasS_OCbK0llZ9ppH4Lz9Sd2aMxDvmOkOL6koJh3Fk3uD_NFmGxD48K93ppTiOMF_talEARk_Gb4FetcYymplJ9KfKvdpk0No8xTBGi5LewrqYzJZe7sPOfA6Ux9BAE4FbgzAmF52gSA7e5e1cmDkPcR7L64fvXYBUQ5bsBkUwU0es5UXyOkTAVOnng1ENPdgKR8ViB7v_KpXERyj62xHZT2EU5PUUrVPZJJuD_MPCfOGo8WmSAFUFTfoOk3Grdg7TLa0S9Lu")'
              }}>
              <span className="material-symbols-outlined icon-big">
                insights
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
    <Features />
    <Footer />
  </>;
};

export default AskTest;
