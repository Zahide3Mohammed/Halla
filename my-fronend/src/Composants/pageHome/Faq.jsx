import { useState } from "react";
import "./faq.Module.css";
import { useLanguage } from "../../Elementes/LanguageContext";
import { translationsHome } from "../../Elementes/translations/translationsHome";



export default function Faq() {
  const [activeIndex, setActiveIndex] = useState(null);
  const { language } = useLanguage();
  const t = translationsHome[language];
  const faqs = [
  {
    question: `${t.q1}`,
    answer:  `${t.a1}`
  },
  {
    question:  `${t.q2}`,
    answer: `${t.a2}`
  },
  {
    question:  `${t.q3}`,
    answer: `${t.a3}`
  },
  {
    question:  `${t.q4}`,
    answer: `${t.a4}`
  },
  {
    question:  `${t.q5}`,
    answer:`${t.a5}`
  },
  {
    question: `${t.q6}`,
    answer: `${t.a6}`
  }
];

  const toggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="faq">
      <div className="faq__container">
        
        {/* Left */}
        <div className="faq__intro">
          <h2>
            <span className="lwla">{t.gt1}</span>{t.gt4} <br />
            <span className="tania">{t.gt2}</span>{t.gt5} <br />
            <span className="Talta">{t.gt3}</span>{t.gt6}
          </h2>
          <p>{t.faqqs}</p>
        </div>

        {/* Right */}
        <div className="faq__list" >
          {faqs.map((item, index) => (
            <div
              key={index}
              className={`faq__item ${activeIndex === index ? "active" : ""}`}
              onClick={() => toggle(index)}
            >
              <div className={`faq__question ${language === "ar" ? "text-right" : "text-left"}`} >
                <h4>{item.question}</h4>
                <span>{activeIndex === index ? "−" : "+"}</span>
              </div>
              <div className={`faq__answer ${language === "ar" ? "text-right" : "text-left"}`}>
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
