import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../api/supabaseApi";
import axios from "axios";

export default function Scanner() {
  const videoRef = useRef(null);
  const [detected, setDetected] = useState("");
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const reportsRef = useRef(new Set());
  const timeoutRef = useRef(null);
  const loadingRef = useRef(false);
  const pausedRef = useRef(false);
  const alertAudioRef = useRef(null);

  // Carica targhe segnalate dal DB
  useEffect(() => {
    let active = true;

    const loadReports = async () => {
      const { data, error } = await supabase.from("reports").select("plate");
      if (error) {
        console.error("Errore caricamento targhe:", error.message);
        return;
      }

      if (!active || !data) return;

      reportsRef.current = new Set(
        data
          .map((r) => r.plate?.toUpperCase())
          .filter((plate) => Boolean(plate))
      );
    };

    const channel = supabase.channel("reports-changes");

    const subscription = channel
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reports" },
        (payload) => {
          const next = new Set(reportsRef.current);
          const oldPlate = payload.old?.plate?.toUpperCase();
          const newPlate = payload.new?.plate?.toUpperCase();

          if (oldPlate) {
            next.delete(oldPlate);
          }
          if (newPlate) {
            next.add(newPlate);
          }

          reportsRef.current = next;
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.error("Errore sottoscrizione realtime reports");
        }
      });

    loadReports();

    return () => {
      active = false;
      subscription
        .unsubscribe()
        .catch((err) => console.error("Errore disiscrizione reports:", err));
    };
  }, []);

  useEffect(() => {
    alertAudioRef.current = new Audio("/alert.mp3");
    return () => {
      if (alertAudioRef.current) {
        alertAudioRef.current.pause();
        alertAudioRef.current.currentTime = 0;
      }
      alertAudioRef.current = null;
    };
  }, []);

  // Avvia fotocamera
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      console.error("API MediaDevices non disponibile nel browser corrente");
      return () => {};
    }

    const stopActiveStream = () => {
      const currentStream = videoRef.current?.srcObject;
      if (currentStream instanceof MediaStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    if (paused) {
      stopActiveStream();
      return stopActiveStream;
    }

    let activeStream;
    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } }) // <-- usa fotocamera posteriore
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        activeStream = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch((err) => console.error("Errore fotocamera:", err));

    return () => {
      cancelled = true;
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
      stopActiveStream();
    };
  }, [paused]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(
    () => () => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    },
    []
  );

  // Analizza frame periodicamente
  const captureFrame = useCallback(async () => {
    const queueNextCapture = (delay = 4000) => {
      if (pausedRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
        return;
      }
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        captureFrame();
      }, delay);
    };

    if (pausedRef.current || !videoRef.current) {
      queueNextCapture();
      return;
    }

    if (loadingRef.current) {
      queueNextCapture();
      return;
    }

    const canvas = document.createElement("canvas");
    const video = videoRef.current;

    if (!video.videoWidth || !video.videoHeight) {
      queueNextCapture(500);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const image = canvas.toDataURL("image/jpeg").split(",")[1];

    const now = typeof performance !== "undefined" ? performance.now() : Date.now();

    try {
      loadingRef.current = true;
      setLoading(true);
      const res = await axios.post("/api/plate-proxy", { image });
      const plate = res.data?.results?.[0]?.plate?.toUpperCase();

      if (plate) {
        console.log("Targa riconosciuta:", plate);

        if (reportsRef.current.has(plate)) {
          // ⚠️ Blocco scanner
          setDetected(`⚠️ Targa segnalata: ${plate}`);
          pausedRef.current = true;
          setPaused(true);

          // Allarme sonoro
          alertAudioRef.current?.play().catch(() => {});
        } else {
          setDetected(`Targa rilevata: ${plate}`);
        }
      } else {
        setDetected("");
      }
    } catch (err) {
      console.error("Errore riconoscimento:", err);
    } finally {
      loadingRef.current = false;
      setLoading(false);
      const end = typeof performance !== "undefined" ? performance.now() : Date.now();
      const elapsed = end - now;
      const delay = Math.max(0, 4000 - (Number.isFinite(elapsed) ? elapsed : 0));
      queueNextCapture(delay);
    }
  }, []);

  useEffect(() => {
    if (paused) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      return;
    }

    captureFrame();

    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [paused, captureFrame]);

  const handleResume = () => {
    pausedRef.current = false;
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