import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './login.css';
import { useLanguage } from '../Elementes/LanguageContext';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { translationsLogin } from '../Elementes/translations/translationsLogin';

const image = ["./chta.png"];

// لستة البلدان باش نتفاداو مشاكل الـ API
const countriesList = [
  "Morocco", "France", "Spain", "USA", "Algeria", "Tunisia", "Germany", 
  "Canada", "United Kingdom", "Italy", "Belgium", "Saudi Arabia", "UAE", "Egypt"
].sort();

export default function Login() {

  const location = useLocation();
  useEffect(() => {
    if (location.state?.signin) {
      setStep(3);
    }
  }, [location.state]);

  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);
  const { language } = useLanguage();
  const t = translationsLogin[language];
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { loginContext } = useAuth();
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    age: '', // Date of Birth
    paye: '',
    sexe: '',
    role: 'user', // الحقل الجديد
    email: '',
    tel: '',
    password: '',
    confirmPassword: '',
    photo: null,
    default_img: ''
  });

  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

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

  useEffect(() => {
    if (!formData.photo) { setPreview(null); return; }
    const objectUrl = URL.createObjectURL(formData.photo);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [formData.photo]);

  const validateStep1 = async () => {
    let newErrors = {};
    if (!formData.nom.trim()) newErrors.nom = t.errorNom || `${t.errnom}`;
    if (!formData.prenom.trim()) newErrors.prenom = t.errorPrenom || `${t.errprenom}`;
    
    // VALIDATION AGE (Date of Birth)
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
    if (!emailRegex.test(formData.email)) { newErrors.email = `${t.erremail}`; }
    else {
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

  const handleSubmitSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    if (!credentials.email || !credentials.password) {
      setErrors({ signin: "Email et Password obligatoires !!!!" });
      setLoading(false);
      return;
    }
    try {
      const res = await axios.post("http://localhost:8000/api/login", credentials);
      loginContext(res.data.user, res.data.token);
      navigate('/Profile');
    } catch (err) {
      setErrors({ signin: err.response?.data?.message || "Erreur login" });
    }
    finally {
      setLoading(false);
    }
  };

  const handleSubmitSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords ma mtafaqinch" });
      setLoading(false);
      return;
    }
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) data.append(key, value);
    });
    try {
      const res = await axios.post("http://localhost:8000/api/register", data);
      if (res.data.token) {
        loginContext(res.data.user, res.data.token);
      }
      navigate("/intro-test");
    } catch (err) {
      console.log("ERROR 👉", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="AuthX_MainLayout_77">
      <div className="AuthX_SliderWrapper_12">
        <div className="AuthX_NeonEdge_88"></div>
        <div className="AuthX_InnerSlider_45">
          {image.map((img, i) => (
            <img key={i} src={img} className="AuthX_AssetImg_Active_09" alt="slide" />
          ))}
          <div className="AuthX_ShadowMask_21"></div>
          <div className="AuthX_HeroCaption_33">
            <h1>{step === 1 ? t.loginlisr1 : step === 3 ? t.loginlisr2 : t.loginlisr5}</h1>
            <p>{step === 1 ? t.loginlisr3 : step === 3 ? t.loginlisr4 : t.loginlisr6}</p>
          </div>
        </div>
      </div>
      <div className={`AuthX_FormSide_54 ${language === "ar" ? "AuthX_RTL_Align" : "AuthX_LTR_Align"}`}>
        {step === 1 && (
          <form className="AuthX_FormContainer_Core_62">
            <div className="AuthX_HeaderSection_11">
              <h2 className={language === "ar" ? "AuthX_RTL_Align" : "AuthX_LTR_Align"}>{t.loguplimn1}</h2>
              <h4 className={language === "ar" ? "AuthX_RTL_Align" : "AuthX_LTR_Align"}>{t.loguplimn2}</h4>
            </div>

            <div className="AuthX_InputGrid_Row_22">
              <div>
                <input type="text" name="nom" placeholder={t.inp1} onChange={handleChange} className={errors.nom ? 'AuthX_Input_Status_Error' : ''} />
                {errors.nom && <span className="AuthX_ErrorMsg_Label">{errors.nom}</span>}
              </div>
              <div>
                <input type="text" name="prenom" placeholder={t.inp2} onChange={handleChange} className={errors.prenom ? 'AuthX_Input_Status_Error' : ''} />
                {errors.prenom && <span className="AuthX_ErrorMsg_Label">{errors.prenom}</span>}
              </div>
            </div>
            <div className="AuthX_InputGrid_Row_22">
              <div>
                <input type="date" name="age" className={errors.age ? 'AuthX_Input_Status_Error' : ''} onChange={handleChange} />
                {errors.age && <span className="AuthX_ErrorMsg_Label">{errors.age}</span>}<br />
                {errors.age18 && <span className="AuthX_ErrorMsg_Label">{errors.age18}</span>}
              </div>
              <div>
                <select name="paye" className={errors.paye ? 'AuthX_Input_Status_Error' : ''} onChange={handleChange}>
                  <option value="">{t.inp4}</option>
                  {countriesList.map((country, idx) => (
                    <option key={idx} value={country}>{country}</option>
                  ))}
                </select>
                {errors.paye && <span className="AuthX_ErrorMsg_Label">{errors.paye}</span>}
              </div>
            </div>

            <div className="AuthX_RadioFlex_Container_91">
              <label><input type="radio" name="sexe" value="Homme" onChange={handleChange} /> {t.inpsexeH}</label>
              <label><input type="radio" name="sexe" value="Femme" onChange={handleChange} /> {t.inpsexeF}</label>
            </div>
            {errors.sexe && <span className="AuthX_ErrorMsg_Label">{errors.sexe}</span>}
            
            <div>
              <input type="email" name="email" placeholder={t.inp5} onChange={handleChange} style={{ width: '100%' }}
                className={errors.email ? 'AuthX_Input_Status_Error' : ''} id='hend' />
              {errors.email && <span className="AuthX_ErrorMsg_Label">{errors.email}</span>}

              <input type="tel" name="tel" placeholder={t.inp6} onChange={handleChange} style={{ width: '100%' }}
                className={`${errors.tel ? 'AuthX_Input_Status_Error' : ''} ${language === "ar" ? "AuthX_RTL_Align" : "AuthX_LTR_Align"}`} id='hend' />
              {errors.tel && <span className="AuthX_ErrorMsg_Label">{errors.tel}</span>}
            </div>

            {/* Select Role */}
            <div style={{marginTop: '10px'}}>
              <select name="role" onChange={handleChange} value={formData.role} style={{width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc'}}>
                <option value="user">Utilisateur normal</option>
                <option value="guide">Guide</option>
                <option value="cooperative">Coopérative</option>
              </select>
            </div>

            <div className="AuthX_UploadSection_44">
              {preview && <div className="AuthX_ImgCircle_Preview AuthX_LTR_Align"><img src={preview} alt="preview" /></div>}
              <label htmlFor="photo" className={`AuthX_Modern_FileLabel_71 ${errors.photo ? 'AuthX_Label_Invalid' : ''}`}>
                <span>{formData.photo ? `${t.inpphoto2}` : `${t.inpphoto}`}</span>
              </label>
              <input id="photo" type="file" hidden name="photo" onChange={handleChange} className={errors.photo ? 'AuthX_Input_Status_Error' : ''} />
              {errors.photo && <span className="AuthX_ErrorMsg_Label">{errors.photo}</span>}
            </div>
            <button onClick={async (e) => {
              e.preventDefault();
              const isValid = await validateStep1();
              if (isValid) { setStep(2); }
            }}
              className="AuthX_PrimaryBtn_Action_10" type="button" disabled={loading}>
              {loading ? `${t.btnsuivant2}` : `${t.btnsuivant}`}
            </button>

            <div className="AuthX_SwitcherLink_Container_19">
              <span>{t.check1} </span>
              <button type="button" className="AuthX_TextLink_Btn_04" onClick={() => setStep(3)}>{t.check2}</button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form className="AuthX_FormContainer_Core_62 AuthX_Variant_Compact" onSubmit={handleSubmitSignup}>
            <h2 style={{ marginBottom: "5%" }}>{t.creepass}</h2>
            <input type="password" name="password" placeholder={t.placepass} onChange={handleChange} />
            <input type="password" name="confirmPassword" placeholder={t.placepass2} onChange={handleChange} />
            <div className="AuthX_PolicyRow_Check_38">
              <label className="AuthX_PolicyRow_Check_38 ">
                <input type="checkbox" required />
                <span className="AuthX_CustomCheck_Box"></span>
                {t.nesslwl} <Link to="/terms">{t.nesstani}</Link>
              </label>
            </div>
            <button className="AuthX_PrimaryBtn_Action_10" disabled={loading}>{loading ? <div className="AuthX_LoadingSpinner_Small">Loading...</div> : "Create account"}</button>
          </form>
        )}

        {step === 3 && (
          <form className="AuthX_FormContainer_Core_62 AuthX_SignIn_Theme_02" onSubmit={handleSubmitSignIn}>
            <h2>{t.check2}</h2>
            <input type="email" name="email" placeholder={t.inp5} onChange={handleChangeSignIn} />
            <div className="AuthX_PassWrapper_Relative_82">
              <input type={showPassword ? "text" : "password"} id="AuthX_SpecialInput_Style" name="password" placeholder={t.inppass}
                onChange={handleChangeSignIn} className="AuthX_Password_Input_Field" />
              <span
                className={`AuthX_ToggleEye_Icon_63 ${language === "ar" ? "AuthX_Eye_Right" : "AuthX_Eye_Left"}`}
                onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "👁️" : "🙈"}
              </span>
            </div>
            {errors.signin && <span className="AuthX_ErrorMsg_Label">{errors.signin}</span>}
            <button className="AuthX_PrimaryBtn_Action_10" disabled={loading}>
              {loading ? `${t.signinbtn}` : `${t.signinbtn2}`}
            </button>
            <div className="AuthX_SwitcherLink_Container_19">
              <span>{t.check3}</span>
              <button type="button" className="AuthX_TextLink_Btn_04" onClick={() => setStep(1)}>
                {t.check4}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}