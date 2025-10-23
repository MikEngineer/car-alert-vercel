import { useEffect, useState } from "react";
import { supabase } from "../api/supabaseApi";

export default function Reports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      const { data, error } = await supabase.from("reports").select("*").order("created_at", { ascending: false });
      if (!error) setReports(data);
      else console.error("Errore caricamento annunci:", error);
    };
    fetchReports();
  }, []);

  return (
    <div className="container py-5">
      <h3 className="text-center mb-4">Annunci segnalati</h3>

      {reports.length === 0 ? (
        <p className="text-center text-muted">Nessun annuncio presente</p>
      ) : (
        <div className="row">
          {reports.map((r) => (
            <div key={r.id} className="col-md-4 mb-4">
              <div className="card shadow-sm">
                {r.image_url && (
                  <img src={r.image_url} className="card-img-top" alt="Veicolo segnalato" />
                )}
                <div className="card-body">
                  <h5 className="card-title">{r.plate?.toUpperCase()}</h5>
                  <p className="card-text">{r.description}</p>
                  <small className="text-muted">
                    {new Date(r.created_at).toLocaleString()}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
