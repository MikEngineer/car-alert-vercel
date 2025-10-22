import axios from "axios";
import FormData from "form-data";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const API_URL = "https://api.platerecognizer.com/v1/plate-reader/";
  const TOKEN = process.env.VITE_PLATE_TOKEN;

  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: "No image data" });

    const buffer = Buffer.from(image, "base64");
    const form = new FormData();
    form.append("upload", buffer, { filename: "frame.jpg" });

    const response = await axios.post(API_URL, form, {
      headers: { Authorization: TOKEN, ...form.getHeaders() },
    });

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
