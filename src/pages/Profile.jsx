import { useEffect, useState } from "react";
import { supabase } from "../api/supabaseApi";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("reporter_id", user.id)
        .order("created_at", { ascending: false });

      if (!error) setReports(data);
    };
    fetchReports();
  }, [user]);

  if (!user)
    return (
      <div className="container text-center py-5">
        <h4>Devi effettuare l'accesso per visualizzare il profilo.</h4>
      </div>
    );

  return (
    <div className="container py-5">
      <h3 className="text-center mb-4">Profilo Utente</h3>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title">Email</h5>
          <p className="card-text">{user.email}</p>
        </div>
      </div>

      <h5 className="mb-3">Le tue segnalazioni</h5>
      {reports.length === 0 ? (
        <p className="text-muted">Nessuna segnalazione presente.</p>
      ) : (
        <div className="list-group">
          {reports.map((r) => (
            <div
              key={r.id}
              className="list-group-item list-group-item-action mb-2 shadow-sm"
            >
              <h6 className="fw-bold text-danger">{r.plate}</h6>
              <p className="mb-1">{r.description}</p>
              <small className="text-muted">
                Inserito il {new Date(r.created_at).toLocaleString()}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
