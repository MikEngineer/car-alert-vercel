import { useEffect, useState } from "react";
import { api, supabase } from "../api/supabaseApi";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
      const all = await api.getReports();
      setReports(all);
      setLoading(false);
    };
    load();

    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) =>
      setUser(session?.user || null)
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    await api.deleteReport(id);
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  if (loading) return <p className="container py-5">Caricamento...</p>;

  return (
    <div className="container py-4">
      <h3 className="mb-3">Annunci auto rubate</h3>
      {reports.length ? (
        <div className="list-group">
          {reports.map((r) => (
            <div key={r.id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h5>
                    <span className="badge bg-dark me-2">{r.plate}</span>
                    {r.make} {r.model} <small>({r.color})</small>
                    {r.verified && <span className="badge bg-primary ms-2">Verificato</span>}
                  </h5>
                  <small className="text-muted">
                    {new Date(r.created_at).toLocaleString()}
                  </small>
                  <p className="mb-1 mt-2">{r.notes}</p>
                </div>

                {user && r.reporter_id === user.id && (
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(r.id)}
                  >
                    Elimina
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>Nessuna segnalazione presente.</p>
      )}
    </div>
  );
}
