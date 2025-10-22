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
    let ready = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
        });
        videoRef.current.srcObject = stream;
        videoRef.current.onloadeddata = () => {
          ready = true;
          console.log("📸 Webcam pronta");
        };
      } catch {
        setDetected("⚠️ Impossibile accedere alla fotocamera");
      }
    }
    startCamera();

    const interval = setInterval(async () => {
      if (!ready || paused || loading) return;
      setLoading(true);

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const base64 = canvas.toDataURL("image/jpeg", 1.0).split(",")[1];
      console.log("📏 Dimensione base64:", base64.length);
      if (base64.length < 50000) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.post("/api/plate-proxy", { image: base64 });
        const plate = res.data?.results?.[0]?.plate?.toUpperCase();
        if (!plate) {
          setDetected("Nessuna targa trovata");
        } else {
          console.log("Targa:", plate);
          const match = await api.searchPlate(plate);
          if (match.length) {
            setDetected(`⚠️ Targa segnalata: ${plate}`);
            setPaused(true);
            new Audio("/alert.mp3").play().catch(() => {});
          } else setDetected(`Targa rilevata: ${plate}`);
        }
      } catch (e) {
        console.error("Errore riconoscimento:", e);
        setDetected("⚠️ Errore nel riconoscimento");
      } finally {
        setLoading(false);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [paused, loading]);

  return (
    <div className="container text-center py-5">
      <h2>Scanner targhe</h2>
      <div className="ratio ratio-16x9 border rounded overflow-hidden shadow-sm mb-3">
        <video ref={videoRef} autoPlay muted playsInline />
        <canvas ref={canvasRef} width={1280} height={720} hidden />
      </div>

      {detected && (
        <div
          className={`alert ${
            detected.includes("⚠️") ? "alert-danger" : "alert-success"
          }`}
        >
          {detected}
        </div>
      )}

      {loading && (
        <div className="spinner-border text-primary" role="status" />
      )}

      <button
        className={`btn ${paused ? "btn-success" : "btn-warning"} mt-3`}
        onClick={() => {
          setPaused(!paused);
          if (!paused) setDetected("");
        }}
      >
        {paused ? "Riavvia" : "Pausa"}
      </button>
    </div>
  );
}
