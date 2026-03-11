import { useLanguage } from "../../Elementes/LanguageContext";
import { translationsHome } from "../../Elementes/translations/translationsHome";
import "./Card.Module.css";

function Cards() {
  const { language } = useLanguage();
  const t = translationsHome[language];
  return (
    <>
    <section className="canva-section">
       <div className={`canva-card gradient-purple ${language === "ar" ? "text-right" : "text-left"}`}>
        <h2>{t.card1t}</h2>
        <p>
          {t.card1}
        </p>
      </div>
      <div className={`canva-card gradient-orange ${language === "ar" ? "text-right" : "text-left"}`}>
        <h2>{t.card2t}</h2>
        <p>
          {t.card2}
        </p>
      </div>
      <div className={`canva-card gradient-blue ${language === "ar" ? "text-right" : "text-left"}`}>
        <h2>{t.card3t}</h2>
        <p>
          {t.card3}
        </p>
      </div>
      <div className={`canva-card gradient-teal ${language === "ar" ? "text-right" : "text-left"}`}>
        <h2>{t.card4t}</h2>
        <p>
          {t.card4}
        </p>
      </div>

    </section>
    </>
  );
}

export default Cards;
