import { useRef, useEffect, useState } from "react";
import axios from "axios";

export default function Scanner() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [plate, setPlate] = useState("");
  const [loading, setLoading] = useState(false);

  // Avvia la fotocamera posteriore
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
        });
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      } catch (err) {
        console.error("Errore accesso fotocamera:", err);
      }
    };
    startCamera();
  }, []);

  // Cattura frame e invia a PlateRecognizer
  const captureFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) return;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, width, height);
    const image = canvas.toDataURL("image/jpeg");

    setLoading(true);
    try {
      const res = await axios.post("/api/plate-proxy", { image });
      const results = res.data?.results;
      if (results && results.length > 0) {
        const detectedPlate = results[0].plate.toUpperCase();
        console.log("Targa rilevata:", detectedPlate);
        setPlate(detectedPlate);
      }
    } catch (err) {
      console.error("Errore riconoscimento:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval;
    if (scanning) interval = setInterval(captureFrame, 1500);
    return () => clearInterval(interval);
  }, [scanning]);

  return (
    <div className="text-center py-4">
      <video
        ref={videoRef}
        style={{ width: "100%", borderRadius: "8px" }}
        playsInline
        muted
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div className="mt-3">
        <button
          className={`btn ${scanning ? "btn-danger" : "btn-warning"}`}
          onClick={() => setScanning((s) => !s)}
        >
          {scanning ? "Ferma scanner" : "Avvia scanner"}
        </button>
      </div>

      {loading && (
        <p className="text-muted mt-3">Elaborazione in corso...</p>
      )}

      {plate && (
        <div className="alert alert-success mt-3">
          Targa riconosciuta: <strong>{plate}</strong>
        </div>
      )}
    </div>
  );
}
