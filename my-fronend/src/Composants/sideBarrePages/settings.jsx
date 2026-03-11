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
    <div className="sup">
    <h1>Gistion de compter</h1><br></br>
    <Link to="" onClick={() => setShow(true)}  className="link"> Supprimer mon compte</Link>
    
      {show && (
        <div className="popup">
          <h3>Confirmez la suppression de votre compte :</h3>
          <input
            type="password"
            placeholder="Votre password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={confirmDelete}>Confirmer</button>
          <button onClick={() => setShow(false)}>Annuler</button>
        </div>
      )}
      </div>
    </>
  );
}