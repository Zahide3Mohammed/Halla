import { useState } from "react";
import "./faq.css";
import { useLanguage } from "../../Elementes/LanguageContext";
import { translationsHome } from "../../Elementes/translations/translationsHome";

export default function Faq() {
  const [activeIndex, setActiveIndex] = useState(null);
  const { language } = useLanguage();
  const t = translationsHome[language];
  
  const faqs = [
    { question: `${t.q1}`, answer: `${t.a1}` },
    { question: `${t.q2}`, answer: `${t.a2}` },
    { question: `${t.q3}`, answer: `${t.a3}` },
    { question: `${t.q4}`, answer: `${t.a4}` },
    { question: `${t.q5}`, answer: `${t.a5}` },
    { question: `${t.q6}`, answer: `${t.a6}` }
  ];

  const toggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="AuthX_FaqSection_Wrapper_33">
      <div className="AuthX_FaqMain_Container_33">
        
        {/* Left Side */}
        <div className="AuthX_FaqIntro_Box_33">
          <h2>
            <span className="AuthX_Color_Pink_01">{t.gt1}</span>{t.gt4} <br />
            <span className="AuthX_Color_Blue_02">{t.gt2}</span>{t.gt5} <br />
            <span className="AuthX_Color_Orange_03">{t.gt3}</span>{t.gt6}
          </h2>
          <p>{t.faqqs}</p>
        </div>

        {/* Right Side */}
        <div className="AuthX_FaqList_Accord_33">
          {faqs.map((item, index) => (
            <div
              key={index}
              className={`AuthX_FaqItem_Row_33 ${activeIndex === index ? "AuthX_State_Active" : ""}`}
              onClick={() => toggle(index)}
            >
              <div className={`AuthX_FaqQuest_Header_33 ${language === "ar" ? "AuthX_RTL_Align" : "AuthX_LTR_Align"}`} >
                <h4>{item.question}</h4>
                <span>{activeIndex === index ? "−" : "+"}</span>
              </div>
              <div className={`AuthX_FaqAnsw_Body_33 ${language === "ar" ? "AuthX_RTL_Align" : "AuthX_LTR_Align"}`}>
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}