import { useState } from "react";
import { supabase } from "../api/supabaseApi";
import { useAuth } from "../context/AuthContext";

export default function NewReport() {
  const { user } = useAuth();
  const [plate, setPlate] = useState("");
  const [description, setDescription] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!user) {
      setError("Devi essere loggato per inserire un annuncio.");
      return;
    }

    const { data, error } = await supabase.from("reports").insert([
      {
        plate: plate.toUpperCase(),
        description,
        reporter_id: user.id,
        reporter_email: user.email,
      },
    ]);

    if (error) setError(error.message);
    else {
      setSuccess(true);
      setPlate("");
      setDescription("");
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 500 }}>
      <h3 className="mb-4 text-center">Nuova Segnalazione</h3>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && (
        <div className="alert alert-success">
          Annuncio inserito correttamente!
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Targa</label>
          <input
            type="text"
            className="form-control"
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Descrizione</label>
          <textarea
            className="form-control"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Invia segnalazione
        </button>
      </form>
    </div>
  );
}
