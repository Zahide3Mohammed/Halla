import "./language-select.css";
import { useLanguage } from "./LanguageContext";

export default function LanguageSelect() {
  const { language, setLanguage } = useLanguage("en");

  return (
    <select className="language-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
      <option value="en">English</option>
      <option value="fr">Français</option>
      <option value="ar">العربية</option>
    </select>
  );
}
