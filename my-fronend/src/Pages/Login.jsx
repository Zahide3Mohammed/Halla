import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './login.Module.css';
import { useLanguage } from '../Elementes/LanguageContext';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { translationsLogin } from '../Elementes/translations/translationsLogin';

const image = ["./chta.png"];

export default function Login() {
  // parte logout
const location = useLocation();
useEffect(() => {
  if (location.state?.signin) {
    setStep(3);
  }
}, [location.state]);


  const { language } = useLanguage();
  const t = translationsLogin[language];
  
  const [showPassword, setShowPassword] = useState(false);
  const toggleVisibility = () => {
    setShowPassword(!showPassword);
  };

  const [loading, setLoading] = useState(false);
  const { loginContext } = useAuth();
  const [step, setStep] = useState(1);
  const navigate =useNavigate();
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    age: '',
    paye: '',
    sexe: '',
    email: '',
    tel: '',
    password: '',
    confirmPassword: '',
    photo: null,
    default_img:''
  });
  const [credentials, setCredentials] = useState({
  email: '',
  password: ''
});

  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);

//================== Handle Change =====================
  const handleChangeSignIn = (e) => {
  setCredentials(prev => ({
    ...prev,
    [e.target.name]: e.target.value
  }));
};

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };
//================hadi dyal affichage dyal tswira li selectioniti===============
  useEffect(() => {
    if (!formData.photo) { setPreview(null); return; }
    const objectUrl = URL.createObjectURL(formData.photo);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [formData.photo]);

//======================= Validate Step 1 =================
  const validateStep1 = async () => {
    let newErrors = {};
    if (!formData.nom.trim()) newErrors.nom = t.errorNom || `${t.errnom}`;
    if (!formData.prenom.trim()) newErrors.prenom = t.errorPrenom || `${t.errprenom}`;
    //VALIDATION AGE
    if (!formData.age) {
    newErrors.age = `${t.errage}`;
    } else {
      const birthDate = new Date(formData.age); 
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--; 
      }
      if (age < 18) {
        newErrors.age18 = `${t.errage18}`;
      }
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {newErrors.email = `${t.erremail}`;}
    else{
      try {
            setLoading(true);
            const res = await axios.post("http://localhost:8000/api/check-email", { 
                email: formData.email 
            });
            if (res.data.exists) {
                newErrors.email = `${t.erremail2}`;
            }
        } catch (err) {
            console.error("Error checking email", err);
        } finally {
            setLoading(false);
        }
    }
    if (formData.tel.length < 10) newErrors.tel = `${t.errtel}`;
    if (!formData.sexe) newErrors.sexe = `${t.errsexe}`;
    if (!formData.paye) newErrors.paye = `${t.errpaye}`;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  ////////////////////////////////////////////////////////
  const handleSubmitSignIn = async (e) => {
  e.preventDefault();
  setLoading(true);
  setErrors({}); // مسح أي error سابق

  // validation بسيطة
  if (!credentials.email || !credentials.password) {
    setErrors({ signin: "Email et Password obligatoires !!!!" });
    return;
  }

  try {
    const res = await axios.post("http://localhost:8000/api/login", credentials);
    loginContext(res.data.user, res.data.token);
    console.log("LOGIN OK 👉", res.data);
    navigate('/Profile');

  } catch (err) {
    console.log("LOGIN ERROR 👉", err.response?.data);
    setErrors({ signin: err.response?.data?.message || "Erreur login" });
  }
  finally {
        setLoading(false);
    }
};
//============================ Signup =====================================
  const handleSubmitSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords ma mtafaqinch" });
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key,value])=>{
      if(value) data.append(key,value);
    });

    try {
      const res = await axios.post("http://localhost:8000/api/register",data);
      if (res.data.token){
      loginContext(res.data.user, res.data.token);}
      console.log("SUCCESS");
        navigate("/intro-test");
    } catch (err) {
      console.log("ERROR 👉", err.response?.data);
    }finally {
    setLoading(false);
  }
  };
///////////////////////////////////////////////////////////////////////////////////////////
 
  return (
    <div className="app-layout">
      {/* LEFT SIDE */}
      <div className="slider-side">
        <div className="led-border"></div>
        <div className="slider-content">
          {image.map((img,i)=>(
            <img key={i} src={img} className="bg-img active" alt="slide"/>
          ))}
          <div className="dark-overlay"></div>
          <div className="hero-text">
            <h1>{step===1 ? t.loginlisr1 : step===3 ? t.loginlisr2 : t.loginlisr5}</h1>
            <p>{step===1 ? t.loginlisr3 : step===3 ? t.loginlisr4 : t.loginlisr6}</p>
          </div>
        </div>
      </div>
      {/* RIGHT SIDE */}
      <div className={`form-side ${language==="ar"?"text-right":"text-left"}`}>
        {/* ===== STEP 1 ===== */}
        {step===1 && (
          <form className="form-container">
            <div className="form-header">
              <h2 className={language==="ar"?"text-right":"text-left"}>{t.loguplimn1}</h2>
              <h4 className={language==="ar"?"text-right":"text-left"}>{t.loguplimn2}</h4>
            </div>

            <div className="input-row">
              <div>
                <input type="text" name="nom" placeholder={t.inp1} onChange={handleChange}  className={errors.nom ? 'input-error' : ''}/>
              {errors.nom && <span className="error-msg">{errors.nom}</span>}
              </div>
              <div>
                 <input type="text" name="prenom" placeholder={t.inp2} onChange={handleChange} className={errors.prenom ? 'input-error' : ''}/>
              {errors.prenom && <span className="error-msg">{errors.prenom}</span>}
              </div>
            </div>
            <div className="input-row">
              <div>
                <input type="date" name="age" placeholder={t.inp3} alt='hdd'
              className={errors.age?'input-error':''} onChange={handleChange} />
              {errors.age && <span className="error-msg">{errors.age}</span>}<br />
              {errors.age18 && <span className="error-msg">{errors.age18}</span>}
              </div>
              <div>
                <input type="text" name="paye" placeholder={t.inp4}
                className={errors.paye?'input-error':''} onChange={handleChange} />
              {errors.paye && <span className="error-msg">{errors.paye}</span>}
              </div>
            </div>

            <div className="radio-container">
              <label><input type="radio" name="sexe" value="Homme" onChange={handleChange}/> {t.inpsexeH}</label>
              <label><input type="radio" name="sexe" value="Femme" onChange={handleChange}/> {t.inpsexeF}</label>
            </div>
            {errors.sexe && <span className="error-msg">{errors.sexe}</span>}
            <div>
            <input type="email" name="email" placeholder={t.inp5} onChange={handleChange} style={{width:'100%'}} 
             className={errors.email?'input-error':''}  id='hend'/>
            {errors.email && <span className="error-msg">{errors.email}</span>}

            <input type="tel" name="tel" placeholder={t.inp6} onChange={handleChange} style={{width:'100%'}}
            className={`errors.tel ? 'input-error':'' ${language==="ar"?"text-right":"text-left"}`} id='hend'/>
            {errors.tel && <span className="error-msg">{errors.tel}</span>}
            </div>
            <div className="file-upload-wrapper">
              {preview && <div className="img-preview text-left "><img src={preview} alt="preview" /></div>}
              <label htmlFor="photo" className={`file-label-modern ${errors.photo?'label-error':''}`}>
                <span>{formData.photo ? `${t.inpphoto2}` : `${t.inpphoto}`}</span>
              </label>
              <input id="photo" type="file" hidden name="photo" onChange={handleChange} className={errors.photo?'input-error':''}/>
              {errors.photo && <span className="error-msg">{errors.photo}</span>}
            </div>
            <button onClick={async (e) => {
                e.preventDefault(); 
                const isValid = await validateStep1();
                if (isValid) {setStep(2);}}}
              className="submit-botona" type="button" disabled={loading}>
              {loading ? `${t.btnsuivant2}` : `${t.btnsuivant}`}
            </button>

            <div className="toggle-auth">
              <span>{t.check1} </span>
              <button className="login-link-btn" onClick={()=>setStep(3)}>{t.check2}</button>
            </div>
          </form>
        )}

        {/* ===== STEP 2 ===== */}
        {step===2 && (
          <form className="form-container vvs" onSubmit={handleSubmitSignup}>
            <h2 style={{marginBottom:"5%"}}>{t.creepass}</h2>
            <input type="password" name="password" placeholder={t.placepass} onChange={handleChange} />
            <input type="password" name="confirmPassword" placeholder={t.placepass2}  onChange={handleChange} />
            <div className="terms-row">
                      <label className="terms-row ">
                        <input type="checkbox" required/>
                        <span className="checkmark"></span>
                        {t.nesslwl} <Link to="/terms">{t.nesstani}</Link>
                      </label>
                    </div>

            <button  className="submit-botona" disabled={loading}>{loading ? <div className="spinner">Loading...</div> : "Create account"}</button>
          </form>
        )}
        {/* ===== SIGN IN ===== */}
        {step===3 && (
          <form className="form-container signin-mode" onSubmit={handleSubmitSignIn}>
            <h2>{t.check2}</h2>
            <input type="email" name="email" placeholder={t.inp5} onChange={handleChangeSignIn}/>
            <div className="password-wrapper">
              <input type={showPassword ? "text" : "password"} id="inputStyle" name="password" placeholder={t.inppass}
                onChange={handleChangeSignIn} className="password-input"/>
              <span
                className={`password-toggle-icon ${language==="ar"?"eyeright":"eyeleft"}`}
                onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                    fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                    fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C5 20 1 12 1 12a21.77 21.77 0 0 1 5.06-7.94"/>
                    <path d="M1 1l22 22"/>
                  </svg>
                )}
              </span>
            </div>
                {errors.signin && <span className="error-msg">{errors.signin}</span>}
            <button className="submit-botona" disabled={loading}>
              {loading ? `${t.signinbtn}` : `${t.signinbtn2}`}
            </button>

            <div className="toggle-auth">
              <span>{t.check3}</span>
              <button className="login-link-btn" onClick={()=>setStep(1)}>
                {t.check4}
              </button>
            </div>
          </form>

        )}
         

      </div>
    </div>
  );
}
