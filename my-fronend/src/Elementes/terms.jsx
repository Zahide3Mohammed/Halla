import { useState } from "react";
import "./TermsJourney.Module.css";
import { Link } from "react-router-dom";
import { useLanguage } from "../Elementes/LanguageContext.jsx";
import Header from "../Elementes/header.jsx";
import Footer from "../Elementes/footer.jsx";
import { translationsHome } from "./translations/translationsHome.js";

const termsSteps = [
  {
    title: "إنشاء البروفايل",
    content:
      "كتوافق أنك تعطي معلومات أساسية باش نعرفو شخصيتك ونساعدوك تلقى المجموعة المناسبة ليك.",
  },
  {
    title: "الخصوصية",
    content:
      "المعلومات ديالك كتكون محمية، وما كتشاركش مع أي طرف خارجي بلا موافقتك.",
  },
  {
    title: "المجموعات العشوائية",
    content:
      "غادي يتم إدماجك أوتوماتيكياً مع 5 أشخاص عندهم نفس الاهتمامات.",
  },
  {
    title: "الذكاء الاصطناعي",
    content:
      "AI كيقترح أنشطة وتجارب خلال التظاهرات الكروية، ولكن القرار النهائي ديالك.",
  },
  {
    title: "السلامة والاحترام",
    content:
      "أي سلوك غير محترم أو خطير يقدر يؤدي لإيقاف الحساب.",
  },
];

export default function TermsJourney({ onAccept }) {
  const { language } = useLanguage();
  const t = translationsHome[language];
  const [step, setStep] = useState(0);

  const progress = ((step + 1) / termsSteps.length) * 100;

  return (
    <>
    <Header />
    <div className={`terms-container  ${language === "ar" ? "text-right" : "text-left"}`}>
      <div className="progress-bar">
        <div className="progress" style={{ width: `${progress}%` }} />
      </div>

      <h2>{termsSteps[step].title}</h2>
      <p>{termsSteps[step].content}</p>

      <div className="actions">
        {step > 0 && (
          <button onClick={() => setStep(step - 1)}>رجوع</button>
        )}

        {step < termsSteps.length - 1 ? (
          <button onClick={() => setStep(step + 1)}>التالي</button>
        ) : (
            <Link to="/sign-up">
          <button className="accept" onClick={onAccept}>
            أوافق على الشروط
          </button></Link>
        )}
      </div>
    </div>
    <Footer />
    </>
  );
}
