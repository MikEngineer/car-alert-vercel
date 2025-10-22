import { useEffect, useState } from "react";
import { api, supabase } from "../api/supabaseApi";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      const u = data?.user || null;
      setUser(u);
      if (u) {
        const userReports = await api.getUserReports(u.id);
        setReports(userReports);
      }
      setLoading(false);
    };

    loadUser();
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) =>
      setUser(session?.user || null)
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return <p className="container py-5">Caricamento...</p>;
  if (!user) return <p className="container py-5">Accedi per visualizzare il profilo.</p>;

  return (
    <div className="container py-5">
      <h3>Profilo utente</h3>
      <p>Email: <b>{user.email}</b></p>

      <hr />
      <h5>Le mie segnalazioni</h5>
      {reports.length ? (
        <ul className="list-group">
          {reports.map((r) => (
            <li key={r.id} className="list-group-item">
              <b>{r.plate}</b> – {r.make} {r.model} ({r.color})
            </li>
          ))}
        </ul>
      ) : (
        <p>Nessuna segnalazione presente.</p>
      )}
    </div>
  );
}
