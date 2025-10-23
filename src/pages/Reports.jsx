import { useEffect, useState } from "react";
import { supabase } from "../api/supabaseApi";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data, error } = await supabase
          .from("reports")
          .select(
            "id, plate, brand, model, color, description, image_url, created_at"
          )
          .order("created_at", { ascending: false });

        if (error) throw error;
        setReports(data || []);
      } catch (err) {
        console.error("Errore caricamento annunci:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="container text-center py-5">
        <p className="text-muted">Caricamento annunci in corso...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container text-center py-5">
        <div className="alert alert-danger">
          Errore nel caricamento: {error}
        </div>
      </div>
    );
  }

  if (!reports.length) {
    return (
      <div className="container text-center py-5">
        <p className="text-muted">Nessun annuncio presente nel database.</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h3 className="text-center mb-4">Annunci segnalati</h3>

      <div className="row">
        {reports.map((r) => (
          <div key={r.id} className="col-md-4 mb-4">
            <div className="card shadow-sm h-100">
              {r.image_url ? (
                <img
                  src={r.image_url}
                  className="card-img-top"
                  alt="Veicolo segnalato"
                  style={{ objectFit: "cover", height: "200px" }}
                  onError={(e) => (e.target.style.display = "none")}
                />
              ) : (
                <div
                  className="bg-light d-flex align-items-center justify-content-center"
                  style={{ height: "200px" }}
                >
                  <span className="text-muted">Nessuna immagine</span>
                </div>
              )}

              <div className="card-body d-flex flex-column">
                <h5 className="card-title">
                  {r.plate ? r.plate.toUpperCase() : "Senza targa"}
                </h5>

                {(r.brand || r.model || r.color) && (
                  <ul className="list-unstyled small text-muted mb-3">
                    {r.brand && (
                      <li>
                        <strong>Marca:</strong> {r.brand}
                      </li>
                    )}
                    {r.model && (
                      <li>
                        <strong>Modello:</strong> {r.model}
                      </li>
                    )}
                    {r.color && (
                      <li>
                        <strong>Colore:</strong> {r.color}
                      </li>
                    )}
                  </ul>
                )}

                <p className="card-text mb-3">
                  {r.description || "Nessuna descrizione"}
                </p>

                <small className="text-muted mt-auto">
                  {new Date(r.created_at).toLocaleString("it-IT")}
                </small>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}