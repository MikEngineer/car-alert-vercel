import { useEffect, useState } from "react";
import { api, supabase } from "../api/supabaseApi";

export default function AdminPanel() {
  const [reports, setReports] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // email o dominio autorizzato
  const adminEmails = ["admin@caralert.it"];

  useEffect(() => {
    const load = async () => {
      // recupera utente
      const { data, error } = await supabase.auth.getUser();
      if (error) console.error(error);

      const currentUser = data?.user || null;
      console.log("User:", currentUser);
      setUser(currentUser);

      // carica segnalazioni
      const reportsData = await api.getReports();
      setReports(reportsData);
      setLoading(false);
    };

    load();

    // aggiorna utente in tempo reale
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // mentre carica
  if (loading) return <p className="container py-5">Caricamento...</p>;
  if (!user) return <p className="container py-5">Accedi come admin.</p>;

  // controllo robusto (case-insensitive)
  const isAdmin = adminEmails.some(
    (email) => email.toLowerCase() === user.email?.toLowerCase()
  );

  if (!isAdmin) {
    console.warn("Accesso negato per:", user.email);
    return (
      <p className="container py-5 text-danger">
        Accesso negato. Solo per amministratori.
      </p>
    );
  }

  const handleVerify = async (id) => {
    await api.verifyReport(id);
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, verified: true } : r))
    );
  };

  const handleDelete = async (id) => {
    if (!confirm("Eliminare la segnalazione?")) return;
    await api.deleteReport(id);
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="container py-5">
      <h3>Pannello Amministratore</h3>

      {reports.length === 0 && <p>Nessuna segnalazione presente.</p>}

      {reports.map((r) => (
        <div key={r.id} className="list-group-item my-2 border rounded p-3">
          <h5>
            {r.plate} – {r.make} {r.model} <small>({r.color})</small>
            {r.verified && (
              <span className="badge bg-primary ms-2">Verificato</span>
            )}
          </h5>
          <p>{r.notes}</p>
          <div className="d-flex gap-2">
            {!r.verified && (
              <button
                className="btn btn-sm btn-success"
                onClick={() => handleVerify(r.id)}
              >
                Verifica
              </button>
            )}
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => handleDelete(r.id)}
            >
              Elimina
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
