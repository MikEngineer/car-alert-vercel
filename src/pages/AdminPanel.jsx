import { useEffect, useState } from "react";
import { supabase } from "../api/supabaseApi";

export default function AdminPanel() {
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

  const handleDelete = async (id) => {
    const { error } = await supabase.from("reports").delete().eq("id", id);
    if (!error) setReports((prev) => prev.filter((r) => r.id !== id));
  };

  if (loading)
    return <p className="text-center mt-4">Caricamento segnalazioni...</p>;

  return (
    <div className="container py-5">
      <h3 className="mb-4 text-center">Pannello Admin</h3>
      {reports.length === 0 ? (
        <p className="text-center text-muted">Nessuna segnalazione presente.</p>
      ) : (
        <div className="list-group">
          {reports.map((r) => (
            <div
              key={r.id}
              className="list-group-item d-flex justify-content-between align-items-center shadow-sm mb-2"
            >
              <div>
                <h6 className="fw-bold text-danger mb-1">{r.plate}</h6>
                <p className="mb-1">{r.description}</p>
                <small className="text-muted">
                  Inserito da {r.reporter_email || "anonimo"} il{" "}
                  {new Date(r.created_at).toLocaleString()}
                </small>
              </div>
              <button
                onClick={() => handleDelete(r.id)}
                className="btn btn-sm btn-outline-danger"
              >
                Elimina
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
