import { useRef, useEffect, useState } from "react";
import axios from "axios";

export default function Scanner({ onResult }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      } catch (err) {
        console.error("Errore accesso fotocamera:", err);
      }
    };
    startCamera();
  }, []);

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

    try {
      const response = await axios.post("/api/plate-proxy", { image });
      if (response.data.results?.length > 0) {
        const plate = response.data.results[0].plate;
        onResult(plate);
      }
    } catch (error) {
      console.error("Errore riconoscimento:", error);
    }
  };

  useEffect(() => {
    let interval;
    if (scanning) {
      interval = setInterval(captureFrame, 1500);
    }
    return () => clearInterval(interval);
  }, [scanning]);

  return (
    <div className="text-center">
      <video
        ref={videoRef}
        style={{ width: "100%", borderRadius: "8px" }}
        playsInline
        muted
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <button
        className={`btn mt-3 ${scanning ? "btn-danger" : "btn-warning"}`}
        onClick={() => setScanning((s) => !s)}
      >
        {scanning ? "Ferma scanner" : "Avvia scanner"}
      </button>
    </div>
  );
}
