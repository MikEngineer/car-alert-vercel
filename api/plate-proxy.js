import axios from "axios";
import FormData from "form-data";
import { Buffer } from "node:buffer";
import process from "node:process";

export const config = {
  api: {
    bodyParser: false, // disabilita il parser automatico di Vercel
  },
};

export default async function handler(req, res) {
  console.log("✅ Proxy PlateRecognizer attivo");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Legge il corpo raw come stringa
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const rawBody = Buffer.concat(chunks).toString();

    let image;
    try {
      const body = JSON.parse(rawBody);
      image = body.image;
    } catch {
      console.error("❌ Corpo JSON non valido");
      return res.status(400).json({ error: "Invalid JSON body" });
    }

    if (!image || image.length < 1000) {
      console.error("❌ Nessuna immagine valida ricevuta");
      return res.status(400).json({ error: "Invalid or empty image data" });
    }

    const buffer = Buffer.from(image, "base64");
    const form = new FormData();
    form.append("upload", buffer, { filename: "frame.jpg" });

    const token = process.env.VITE_PLATE_TOKEN;
    if (!token) {
      console.error("❌ Token API mancante");
      return res.status(500).json({ error: "Missing API token" });
    }

    console.log("🚀 Invio a Plate Recognizer...");
    const response = await axios.post(
      "https://api.platerecognizer.com/v1/plate-reader/?regions=eu",
      form,
      {
        headers: {
          Authorization: token,
          ...form.getHeaders(),
        },
      }
    );

    console.log("✅ Risposta OK:", response.status);
    res.status(200).json(response.data);
  } catch (err) {
    console.error("❌ Errore proxy:", err.message);
    res.status(500).json({
      error: err.message,
      details: err.response?.data || null,
    });
  }
}
