import { useState } from "react";
 // تأكدي من المسار الصحيح للملف
import "./security.css";
import { useAuth } from "../../context/AuthContext";

export default function Security() {
  const { token, logout } = useAuth()
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");

  const changePassword = async () => {
    if (!token) {
      setMsg("Session expirée. Veuillez vous reconnecter.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`, // التوكن جاي من الـ Context ديريكت
        },
        body: JSON.stringify({
          current_password: current,
          new_password: newPass,
          new_password_confirmation: confirm,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMsg("✅ Password changé avec succès");
        setCurrent(""); setNewPass(""); setConfirm("");
      } else if (res.status === 401) {
        // إذا السيرفر قال التوكن مابقاش خدام، كنخرجو المستخدم
        setMsg("Session invalide. Déconnexion...");
        setTimeout(() => logout(), 2000); 
      } else {
        setMsg(data.message || "Erreur lors du changement");
      }
    } catch (err) {
      setMsg("Erreur de connexion au serveur");
    }
  };

  return (
    <div className="container">
      <section className="content">
        <h2>Password</h2>
        <p>Please enter your current password to change your password.</p>

        {msg && <p style={{ color: msg.startsWith("✅") ? "green" : "red" }}>{msg}</p>}

        <label>Current Password</label>
        <input
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />

        <label>New Password</label>
        <input
          type="password"
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
        />

        <label>Confirm Password</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <div className="buttons">
          <button
            className="cancel"
            onClick={() => {
              setCurrent("");
              setNewPass("");
              setConfirm("");
              setMsg("");
            }}
          >
            Cancel
          </button>

          <button className="update1" onClick={changePassword}>
            Update
          </button>
        </div>
      </section>

      {/* RIGHT PANEL */}
      <aside className="right">
        <h3>Vérification emai</h3>
        <p>This means the site is checking that your email address is correct.</p>
        <button className="disable">Disable</button>

        <h4>Change your password via email</h4>
        <p>mrssihelacals@digitalspace.com</p>

        
        <button>Setup</button>
      </aside>
    </div>
  );
}