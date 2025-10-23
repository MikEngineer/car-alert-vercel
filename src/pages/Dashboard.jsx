import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  return (
    <div className="container py-5 text-center">
      <h2>Benvenuto {user ? user.email : "ospite"}</h2>
      <p>App per segnalare e cercare veicoli rubati</p>
    </div>
  );
}
