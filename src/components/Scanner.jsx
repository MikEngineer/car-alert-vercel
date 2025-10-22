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
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
        });
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

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      const ctx = canvas.getContext("2d");
      // Disegna con risoluzione più alta per evitare base64 vuote
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // JPEG di qualità alta per Plate Recognizer
      const base64Image = canvas.toDataURL("image/jpeg", 0.9).split(",")[1];

      try {
        const res = await axios.post("/api/plate-proxy", { image: base64Image });

        const plate = res.data?.results?.[0]?.plate?.toUpperCase();
        if (plate) {
          console.log("Targa riconosciuta:", plate);

          const matches = await api.searchPlate(plate);
          if (matches.length) {
            setDetected(`⚠️ Targa segnalata: ${matches[0].plate}`);
            setPaused(true);

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
        setDetected("⚠️ Nessuna targa rilevata o immagine non valida");
      } finally {
        setLoading(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [paused, loading]);

  return (
    <div className="container text-center py-5">
      <h2 className="mb-4">Scanner targhe</h2>

      <div className="ratio ratio-16x9 border rounded overflow-hidden shadow-sm mb-3">
        <video ref={videoRef} autoPlay muted playsInline />
        <canvas ref={canvasRef} width={1280} height={720} hidden />
      </div>

      {detected && (
        <div
          className={`alert ${
            detected.includes("⚠️") ? "alert-danger" : "alert-success"
          } mt-3`}
        >
          {detected}
        </div>
      )}

      {loading && (
        <div className="spinner-border text-primary mt-3" role="status">
          <span className="visually-hidden">Analisi in corso...</span>
        </div>
      )}

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
