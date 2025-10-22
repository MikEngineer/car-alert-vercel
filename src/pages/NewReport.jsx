import { useState } from "react";
import { api } from "../api/supabaseApi";

export default function NewReport() {
  const [plate, setPlate] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [color, setColor] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return alert("Accedi prima.");
    if (!plate) return alert("Inserisci la targa.");

    try {
      await api.addReport({ plate, make, model, color, notes, reporterId: user.id });
      alert("Segnalazione inviata.");
      setPlate(""); setMake(""); setModel(""); setColor(""); setNotes("");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 500 }}>
      <h3>Nuova segnalazione</h3>
      <input className="form-control mb-2" placeholder="Targa" value={plate} onChange={(e) => setPlate(e.target.value)} />
      <input className="form-control mb-2" placeholder="Marca" value={make} onChange={(e) => setMake(e.target.value)} />
      <input className="form-control mb-2" placeholder="Modello" value={model} onChange={(e) => setModel(e.target.value)} />
      <input className="form-control mb-2" placeholder="Colore" value={color} onChange={(e) => setColor(e.target.value)} />
      <textarea className="form-control mb-3" placeholder="Note" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <button className="btn btn-primary w-100" onClick={handleSubmit}>Salva</button>
    </div>
  );
}
