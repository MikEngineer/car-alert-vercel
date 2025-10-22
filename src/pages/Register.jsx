import { useState } from "react";
import { api } from "../api/supabaseApi";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await api.register(email, password);
      alert("Registrazione completata");
      navigate("/login");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 400 }}>
      <h3>Registrazione</h3>
      <input className="form-control mb-3" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="form-control mb-3" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="btn btn-success w-100" onClick={handleRegister}>Registrati</button>
    </div>
  );
}
