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
    description: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let imageUrl = null;

      // Upload immagine su Supabase Storage (bucket "reports")
      if (file) {
        const fileName = `${Date.now()}_${file.name}`;
        const { data, error: uploadError } = await supabase.storage
          .from("reports")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("reports")
          .getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }

      // Inserisci annuncio nel DB
      const { error: insertError } = await supabase.from("reports").insert([
        {
          plate: form.plate.toUpperCase(),
          brand: form.brand,
          model: form.model,
          color: form.color,
          description: form.description,
          image_url: imageUrl,
          reporter_id: user?.id || null,
        },
      ]);

      if (insertError) throw insertError;

      navigate("/annunci");
    } catch (err) {
      console.error("Errore salvataggio:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4 text-center">Nuovo Annuncio</h2>

      <form onSubmit={handleSubmit} className="mx-auto" style={{ maxWidth: 500 }}>
        <div className="mb-3">
          <label className="form-label">Targa</label>
          <input
            type="text"
            name="plate"
            className="form-control"
            required
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Marca</label>
          <input
            type="text"
            name="brand"
            className="form-control"
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Modello</label>
          <input
            type="text"
            name="model"
            className="form-control"
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Colore</label>
          <input
            type="text"
            name="color"
            className="form-control"
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Descrizione</label>
          <textarea
            name="description"
            rows="3"
            className="form-control"
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Foto veicolo</label>
          <input
            type="file"
            accept="image/*"
            className="form-control"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? "Salvataggio..." : "Pubblica Annuncio"}
        </button>
      </form>
    </div>
  );
}