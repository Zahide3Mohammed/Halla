import { useLanguage } from "../../Elementes/LanguageContext";
import { translationsHome } from "../../Elementes/translations/translationsHome";
import "./Card.css";

function Cards() {
  const { language } = useLanguage();
  const t = translationsHome[language];
  
  return (
    <>
    <section className="AuthX_CardSection_Grid_99">
        <div className={`AuthX_SingleCard_Box_99 AuthX_Grad_Purple_01 ${language === "ar" ? "AuthX_RTL_Align" : "AuthX_LTR_Align"}`}>
          <h2>{t.card1t}</h2>
          <p>{t.card1}</p>
        </div>
        
        <div className={`AuthX_SingleCard_Box_99 AuthX_Grad_Orange_02 ${language === "ar" ? "AuthX_RTL_Align" : "AuthX_LTR_Align"}`}>
          <h2>{t.card2t}</h2>
          <p>{t.card2}</p>
        </div>
        
        <div className={`AuthX_SingleCard_Box_99 AuthX_Grad_Blue_03 ${language === "ar" ? "AuthX_RTL_Align" : "AuthX_LTR_Align"}`}>
          <h2>{t.card3t}</h2>
          <p>{t.card3}</p>
        </div>
        
        <div className={`AuthX_SingleCard_Box_99 AuthX_Grad_Teal_04 ${language === "ar" ? "AuthX_RTL_Align" : "AuthX_LTR_Align"}`}>
          <h2>{t.card4t}</h2>
          <p>{t.card4}</p>
        </div>
    </section>
    </>
  );
}

export default Cards;