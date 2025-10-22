import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { api } from "../api/supabaseApi";

export default function Scanner() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [detected, setDetected] = useState("");
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Errore apertura fotocamera:", err);
        setDetected("⚠️ Impossibile accedere alla fotocamera");
      }
    };
    startCamera();

    const interval = setInterval(async () => {
      if (paused || loading) return;
      setLoading(true);

      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Converti immagine in base64 per il proxy
      const canvasData = canvas.toDataURL("image/jpeg");
      const base64Image = canvasData.split(",")[1];

      try {
        const res = await axios.post("/api/plate-proxy", { image: base64Image });

        const plate = res.data?.results?.[0]?.plate?.toUpperCase();
        if (plate) {
          console.log("Targa riconosciuta:", plate);

          const matches = await api.searchPlate(plate);
          if (matches.length) {
            setDetected(`⚠️ Targa segnalata: ${matches[0].plate}`);
            setPaused(true);

            // Avviso sonoro
            const audio = new Audio("/alert.mp3");
            audio.play().catch(() => {});
          } else {
            setDetected(`Targa rilevata: ${plate}`);
          }
        } else {
          setDetected("");
        }
      } catch (err) {
        console.error("Errore riconoscimento:", err);
        setDetected("⚠️ Errore nel riconoscimento");
      } finally {
        setLoading(false);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [paused, loading]);

  return (
    <div className="container text-center py-5">
      <h2 className="mb-4">Scanner targhe</h2>

      <div className="ratio ratio-16x9 border rounded overflow-hidden shadow-sm mb-3">
        <video ref={videoRef} autoPlay muted playsInline />
        <canvas ref={canvasRef} width={640} height={360} hidden />
      </div>

      {/* Avviso visivo */}
      {detected && (
        <div
          className={`alert ${
            detected.includes("⚠️")
              ? "alert-danger"
              : "alert-success"
          } mt-3`}
          role="alert"
        >
          {detected}
        </div>
      )}

      {/* Stato caricamento */}
      {loading && (
        <div className="spinner-border text-primary mt-3" role="status">
          <span className="visually-hidden">Analisi in corso...</span>
        </div>
      )}

      {/* Pulsante controllo scansione */}
      <div className="mt-4">
        <button
          className={`btn ${paused ? "btn-success" : "btn-warning"} px-4`}
          onClick={() => {
            setPaused(!paused);
            if (!paused) setDetected("");
          }}
        >
          {paused ? "Riavvia scansione" : "Metti in pausa"}
        </button>
      </div>
    </div>
  );
}
