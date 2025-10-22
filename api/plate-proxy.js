import axios from "axios";
import FormData from "form-data";
import { Buffer } from "node:buffer";
import process from "node:process";

export default async function handler(req, res) {
  console.log("✅ Proxy attivato:", req.method);

  // accetta solo POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Parsing del body JSON
    const body = JSON.parse(req.body || "{}");
    const { image } = body;

    // Controllo immagine ricevuta
    const imgLength = image?.length || 0;
    console.log("📷 Lunghezza immagine ricevuta:", imgLength);

    if (!image || imgLength < 1000) {
      return res.status(400).json({ error: "Invalid or empty image data" });
    }

    // Conversione base64 → buffer
    const buffer = Buffer.from(image, "base64");
    const form = new FormData();
    form.append("upload", buffer, { filename: "frame.jpg" });

    const token = process.env.VITE_PLATE_TOKEN;
    if (!token) {
      console.error("❌ Token API mancante. Impostalo in Vercel → Environment Variables");
      return res.status(500).json({ error: "Missing API token" });
    }

    // Chiamata a Plate Recognizer
    console.log("🚀 Invio immagine a Plate Recognizer...");
    const response = await axios.post(
      "https://api.platerecognizer.com/v1/plate-reader/?regions=eu",
      form,
      {
        headers: {
          Authorization: token,
          ...form.getHeaders(),
        },
        timeout: 15000, // 15 secondi
      }
    );

    console.log("✅ Risposta ricevuta:", response.status);
    res.status(200).json(response.data);

  } catch (error) {
    console.error(
      "❌ Proxy error:",
      error.response?.status || 500,
      error.message
    );

    // Log dettagliato lato server (visibile in Function Logs)
    if (error.response?.data) {
      console.error("🔍 Dettagli errore API:", error.response.data);
    }

    res.status(error.response?.status || 500).json({
      error: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
}
