import { useEffect, useRef, useState } from "react";
import { supabase } from "../api/supabaseApi";
import axios from "axios";

export default function Scanner() {
  const videoRef = useRef(null);
  const [detected, setDetected] = useState("");
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);

  // Carica targhe segnalate dal DB
  useEffect(() => {
    const loadReports = async () => {
      const { data, error } = await supabase.from("reports").select("plate");
      if (!error && data) setReports(data.map((r) => r.plate.toUpperCase()));
    };
    loadReports();
  }, []);

  // Avvia fotocamera
  useEffect(() => {
    if (paused) return;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } }) // <-- usa fotocamera posteriore
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch((err) => console.error("Errore fotocamera:", err));
  }, [paused]);

  // Analizza frame periodicamente
  useEffect(() => {
    if (paused) return;
    const interval = setInterval(captureFrame, 4000);
    return () => clearInterval(interval);
  }, [paused, reports]);

  const captureFrame = async () => {
    if (!videoRef.current || paused) return;

    const canvas = document.createElement("canvas");
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const image = canvas.toDataURL("image/jpeg").split(",")[1];

    try {
      setLoading(true);
      const res = await axios.post("/api/plate-proxy", { image });
      const plate = res.data?.results?.[0]?.plate?.toUpperCase();

      if (plate) {
        console.log("Targa riconosciuta:", plate);

        if (reports.includes(plate)) {
          // ⚠️ Blocco scanner
          setDetected(`⚠️ Targa segnalata: ${plate}`);
          setPaused(true);

          // Allarme sonoro
          const alertSound = new Audio("/alert.mp3");
          alertSound.play().catch(() => {});
        } else {
          setDetected(`Targa rilevata: ${plate}`);
        }
      } else {
        setDetected("");
      }
    } catch (err) {
      console.error("Errore riconoscimento:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResume = () => {
    setPaused(false);
    setDetected("");
  };

  return (
    <div className="container text-center py-5">
      <h2>Scanner Targhe</h2>

      <div className="ratio ratio-4x3 bg-dark rounded overflow-hidden mt-3">
        <video ref={videoRef} autoPlay playsInline muted />
      </div>

      {loading && <p className="text-muted mt-3">Analisi in corso...</p>}

      {detected && (
        <div
          className={`alert ${
            detected.includes("⚠️") ? "alert-danger" : "alert-info"
          } mt-3`}
        >
          {detected}
        </div>
      )}

      {paused && (
        <button onClick={handleResume} className="btn btn-warning mt-2">
          Riprendi scansione
        </button>
      )}
    </div>
  );
}
