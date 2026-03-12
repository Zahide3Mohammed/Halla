import axios from "axios";
import { useState } from "react";
import "./settings.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Settings2tghf() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [show, setShow] = useState(false);
  const [password, setPassword] = useState("");

  const confirmDelete = async () => {
    try {
      await axios.post(
        "http://localhost:8000/api/delete-account",
        { password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      logout();
      navigate("/login");
      alert("Compte supprimé ✅");

    } catch (err) {
      alert("Password incorrect ...❌");
    }
  };

  return (
    <>
    <div className="AuthX_SettingsMain_Container_44">
      <h1 className="AuthX_SettingTitle_Text_44">Gestion de compte</h1><br></br>
      <Link to="" onClick={() => setShow(true)} className="AuthX_DeleteAcc_Link_44"> 
        Supprimer mon compte
      </Link>
    
      {show && (
        <div className="AuthX_PopupOverlay_Layer_44">
          <div className="AuthX_ConfirmPopup_Box_44">
            <h3>Confirmez la suppression de votre compte :</h3>
            <input
              type="password"
              placeholder="Votre password"
              value={password}
              className="AuthX_PopupInput_Field_44"
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="AuthX_PopupActions_Row_44">
              <button className="AuthX_Btn_Danger_44" onClick={confirmDelete}>Confirmer</button>
              <button className="AuthX_Btn_Cancel_44" onClick={() => setShow(false)}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}