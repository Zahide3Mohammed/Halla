import { useState } from 'react';
import axios from 'axios';
import './Questions.Module.css';
import Header from '../../Elementes/header';
import Footer from '../../Elementes/footer';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router';
import { useLanguage } from '../../Elementes/LanguageContext';
import { translationsQuestions } from '../../Elementes/translations/translationsQuestions';

export default function Questions() {
  const [currentPage, setCurrentPage] = useState(0); 
  const questionsPerPage = 5;
  const { language } = useLanguage();
  const t = translationsQuestions[language];
  
  // 1. Kan-jibu l-user w l-function li kat-update l-context
  const { user, loginContext ,token} = useAuth(); 

  const [scores, setScores] = useState({ red: 0, green: 0, yellow: 0, blue: 0, purple: 0 });
  const [answers, setAnswers] = useState({});
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
const questions = [
    { id: 1, text: `${t.Q1}` , color: "red", reselta: [-3, -2, -1, 0, 1, 2, 3] },
    { id: 2, text:  `${t.Q2}` , color: "green", reselta: [-3, -2, -1, 0, 1, 2, 3] },
    { id: 3, text: `${t.Q3}`, color: "yellow", reselta: [-3, -2, -1, 0, 1, 2, 3] },
    { id: 4, text:`${t.Q4}`, color: "blue", reselta: [-3, -2, -1, 0, 1, 2, 3] },
    { id: 5, text:`${t.Q5}`, color: "purple", reselta: [-3, -2, -1, 0, 1, 2, 3] },
    { id: 6, text:`${t.Q6}`, color: "red", reselta: [-3, -2, -1, 0, 1, 2, 3] },
    { id: 7, text: `${t.Q7}`, color: "green", reselta: [-3, -2, -1, 0, 1, 2, 3] },
    { id: 8, text:`${t.Q8}`, color: "yellow", reselta: [-3, -2, -1, 0, 1, 2, 3] },
    { id: 9, text: `${t.Q9}`, color: "blue", reselta: [-3, -2, -1, 0, 1, 2, 3] },
    { id: 10, text: `${t.Q10}`, color: "purple", reselta: [-3, -2, -1, 0, 1, 2, 3] },
     { id: 11, text: `${t.Q11}`, color: "blue", reselta: [-3, -2, -1, 0, 1, 2, 3] },
    { id: 12, text:`${t.Q12}`, color: "red", reselta: [-3, -2, -1, 0, 1, 2, 3] },
    { id: 13, text: `${t.Q13}`, color: "yellow", reselta: [-3, -2, -1, 0, 1, 2, 3] },
    { id: 14, text: `${t.Q14}`, color: "green", reselta: [-3, -2, -1, 0, 1, 2, 3] },
    { id: 15, text: `${t.Q15}`, color: "purple", reselta: [-3, -2, -1, 0, 1, 2, 3] }
  ];

  const startIndex = currentPage * questionsPerPage;
  const currentQuestions = questions.slice(startIndex, startIndex + questionsPerPage);

  const handleSelect = (questionId, color, value) => {
    const oldValue = answers[questionId] || 0;
    setScores(prev => ({
      ...prev,
      [color]: prev[color] + value - oldValue,
    }));
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const nextStep = () => {
    if (startIndex + questionsPerPage < questions.length) {
      setCurrentPage(currentPage + 1);
      window.scrollTo(0, 0); 
    } else {
      submitResults();
    }
  };

  const prevStep = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      window.scrollTo(0, 0); 
    }
  };

  const submitResults = async () => {
    console.log("TOKEN FROM CONTEXT:", token);
    if (Object.keys(answers).length < questions.length) {
      alert("يرجى الإجابة على جميع الأسئلة قبل المتابعة");
      return;
    }
    
    setLoading(true);
    const topColor = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    try {
      const res = await axios.post("http://localhost:8000/api/personalitytest", 
        { color: topColor }, 
        {
          headers: {Authorization: `Bearer ${token}`,
          'Accept': "application/json",
        'Content-Type': 'application/json',
        },
        });
      if (loginContext) {
        loginContext(res.data.user,res.data.token);
      }
      navigate("/Profile");
    } catch (error) {
      console.error("Update Error:", error.response?.data);
      alert("حدث خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto p-8 bg-white ">
        
        <article className="steps"> 
          <h1 style={{ flexShrink:"0 " }}>أهلاً {user?.nom || 'المستخدم'}</h1>
          <div className="card"><h1>الخطوة 1</h1><h3>أكمل الاختبار</h3></div> 
          <div className="card"><h1>الخطوة 2</h1><h3>النتائج</h3></div>
          <div className="card"><h1>الخطوة 3</h1><h3>تطوير الذات</h3></div> 
        </article>

        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${((startIndex + currentQuestions.length) / questions.length) * 100}%` }}></div>
        
        </div>

        {currentQuestions.map((q) => (
          <div key={q.id} className={`qus ${language==="ar"?"text-right":"text-left"}`}>
            <p className="text-xl">{q.text}</p>
            <div className="container-ijabat">
              <span style={{color: 'red',fontSize:"18px"}}>{t.non}</span>
              {q.reselta.map((val) => (
                <button
                  key={val} className='buttijaba'
                  type="button"
                  onClick={() => handleSelect(q.id, q.color, val)}
                  style={{
                    width: `${50 + Math.abs(val) * 5}px`,
                    height: `${50 + Math.abs(val) * 5}px`,
                    borderRadius: '50%',
                    border: '1px solid #cfb8b8',
                    backgroundColor: answers[q.id] === val ? (val == 0 ? '#6f00e6' : (val>0 ? "#01d57c" : "#fb0000")) : 'white'
                  }}
                />
              ))}
              <span style={{color: 'green',fontSize:"18px"}}>{t.oui}</span>
            </div>
          </div>
        ))}

        <div className="flex justify-between items-center mt-10">
          {currentPage > 0 && <button onClick={prevStep} className="btn-back">{t.sabi9}</button>}
          <button onClick={nextStep} className="btnn" disabled={loading}>
            {loading ? `${t.jari}` : (startIndex + questionsPerPage < questions.length ? `${t.tali}` : `${t.nata2ij}`)}
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}