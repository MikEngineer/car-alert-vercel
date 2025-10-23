import { useState } from "react";
import { supabase } from "../api/supabaseApi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NewReport() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    plate: "",
    brand: "",
    model: "",
    color: "",
    location: "",
    description: "",
    image_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("Devi essere loggato per inserire un annuncio.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.from("reports").insert([
        {
          plate: form.plate.trim().toUpperCase(),
          brand: form.brand.trim(),
          model: form.model.trim(),
          color: form.color.trim(),
          location: form.location.trim(),
          description: form.description.trim(),
          image_url: form.image_url.trim(),
          reporter_id: user.id,
        },
      ]);

      if (error) throw error;
      navigate("/annunci");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 500 }}>
      <h2 className="mb-4 text-center">Nuovo Annuncio</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <input
          name="plate"
          placeholder="Targa (es. AB123CD)"
          className="form-control mb-3"
          value={form.plate}
          onChange={handleChange}
          required
        />

        <input
          name="brand"
          placeholder="Marca"
          className="form-control mb-3"
          value={form.brand}
          onChange={handleChange}
        />

        <input
          name="model"
          placeholder="Modello"
          className="form-control mb-3"
          value={form.model}
          onChange={handleChange}
        />

        <input
          name="color"
          placeholder="Colore"
          className="form-control mb-3"
          value={form.color}
          onChange={handleChange}
        />

        <input
          name="location"
          placeholder="Località"
          className="form-control mb-3"
          value={form.location}
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Descrizione (es. data, particolari, ecc.)"
          className="form-control mb-3"
          rows={3}
          value={form.description}
          onChange={handleChange}
        />

        <input
          name="image_url"
          placeholder="URL immagine (facoltativo)"
          className="form-control mb-4"
          value={form.image_url}
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={loading}
          className="btn btn-warning w-100"
        >
          {loading ? "Salvataggio..." : "Pubblica annuncio"}
        </button>
      </form>
    </div>
  );
}
