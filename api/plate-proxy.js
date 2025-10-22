import axios from "axios";
import FormData from "form-data";
import { Buffer } from "node:buffer";
import process from "node:process";

export default async function handler(req, res) {
  console.log("✅ Proxy attivato, metodo:", req.method);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = JSON.parse(req.body || "{}");
    console.log("📦 Body ricevuto:", Object.keys(body));
    const { image } = body;
    if (!image) return res.status(400).json({ error: "No image data" });

    const token = process.env.VITE_PLATE_TOKEN;
    if (!token) {
      console.error("❌ Token mancante o non impostato");
      return res.status(500).json({ error: "Missing Plate Recognizer token" });
    }

    const buffer = Buffer.from(image, "base64");
    const form = new FormData();
    form.append("upload", buffer, { filename: "frame.jpg" });

    console.log("🚀 Inviando richiesta a Plate Recognizer...");
    const response = await axios.post(
      "https://api.platerecognizer.com/v1/plate-reader/",
      form,
      {
        headers: {
          Authorization: token,
          ...form.getHeaders(),
        },
      }
    );

    console.log("✅ Risposta ricevuta:", response.status);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("❌ Proxy error:", error.response?.status, error.message);
    res.status(error.response?.status || 500).json({
      error: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
}
