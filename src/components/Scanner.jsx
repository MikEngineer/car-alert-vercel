import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { supabase } from "../api/supabaseApi";

export default function Scanner() {
  const videoRef = useRef(null);
  const [detected, setDetected] = useState("");
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Errore accesso fotocamera:", err);
      }
    };
    startCamera();
  }, []);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(async () => {
      if (!videoRef.current) return;

      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const image = canvas.toDataURL("image/jpeg").split(",")[1];

      try {
        const res = await axios.post("/api/plate-proxy", { image });
        const plate = res.data?.results?.[0]?.plate?.toUpperCase();

        if (plate) {
          console.log("Targa riconosciuta:", plate);

          const { data: reports } = await supabase
            .from("reports")
            .select("*")
            .ilike("plate", `%${plate}%`);

          if (reports.length > 0) {
            setDetected(`⚠️ Targa segnalata: ${plate}`);
            setPaused(true);
            const audio = new Audio("/alert.mp3");
            audio.play().catch(() => {});
          } else {
            setDetected(`Targa rilevata: ${plate}`);
          }
        }
      } catch (err) {
        console.error("Errore riconoscimento:", err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [paused]);

  return (
    <div className="container text-center mt-4">
      <h3 className="mb-3">Scanner Targhe</h3>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-100 rounded shadow"
      />
      <p
        className={`mt-3 p-2 fw-bold rounded ${
          detected.includes("⚠️") ? "bg-danger text-white" : "bg-light"
        }`}
      >
        {detected}
      </p>
      {paused && (
        <button
          className="btn btn-warning mt-2"
          onClick={() => setPaused(false)}
        >
          Riprendi scansione
        </button>
      )}
    </div>
  );
}
