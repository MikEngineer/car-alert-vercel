import { useEffect, useState } from "react";
import { supabase } from "../api/supabaseApi";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) setReports(data);
      setLoading(false);
    };
    loadReports();
  }, []);

  if (loading) return <p className="text-center mt-4">Caricamento...</p>;

  return (
    <div className="container py-4">
      <h3 className="mb-4 text-center">Annunci di Auto Rubate</h3>
      {reports.length === 0 ? (
        <p className="text-center text-muted">Nessun annuncio presente.</p>
      ) : (
        <div className="list-group">
          {reports.map((r) => (
            <div
              key={r.id}
              className="list-group-item list-group-item-action mb-2 shadow-sm"
            >
              <h5 className="mb-1 text-danger fw-bold">{r.plate}</h5>
              <p className="mb-1">{r.description}</p>
              <small className="text-muted">
                Inserito da: {r.reporter_email || "anonimo"}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
