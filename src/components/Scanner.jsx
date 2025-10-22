import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { api } from "../api/supabaseApi";

const API_URL = "https://api.platerecognizer.com/v1/plate-reader/";
const API_TOKEN = "Token 1fae05d784489623e8fa71674e4c4c261850f184";

export default function Scanner() {
  const [detected, setDetected] = useState("");
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Avvio fotocamera
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Errore fotocamera:", err);
      }
    };
    initCamera();
  }, []);

  // Scansione periodica
  useEffect(() => {
    if (paused || loading) return;

    const interval = setInterval(() => {
      if (!videoRef.current || !canvasRef.current) return;

      const ctx = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0);

      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        const formData = new FormData();
        formData.append("upload", blob);
        setLoading(true);

        try {
          const res = await axios.post(API_URL, formData, {
            headers: { Authorization: API_TOKEN },
          });

          const plate = res.data?.results?.[0]?.plate?.toUpperCase();
          if (plate) {
            console.log("Targa riconosciuta:", plate);
            const matches = await api.searchPlate(plate);

            if (matches && matches.length > 0) {
              setDetected(`⚠️ Targa segnalata: ${matches[0].plate}`);
              setPaused(true);
              new Audio("/alert.mp3").play().catch(() => {});
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
      }, "image/jpeg");
    }, 1500);

    return () => clearInterval(interval);
  }, [paused, loading]);

  return (
    <div className="text-center p-4">
      <h3 className="mb-3">Scanner Targhe</h3>

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "500px",
          aspectRatio: "4 / 3",
          margin: "0 auto",
          border: "3px solid #0d6efd",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 0 20px rgba(0,0,0,0.3)",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: "scaleX(-1)", // effetto specchio naturale
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "none",
          }}
        />
      </div>

      {loading && <p className="mt-3 text-muted small">Analisi in corso...</p>}

      {detected && (
        <div
          className={`alert ${
            detected.includes("⚠️") ? "alert-danger" : "alert-success"
          } mt-3`}
          role="alert"
        >
          {detected}
        </div>
      )}

      {paused && (
        <button
          className="btn btn-warning mt-3"
          onClick={() => {
            setPaused(false);
            setDetected("");
          }}
        >
          Riavvia Scansione
        </button>
      )}
    </div>
  );
}
