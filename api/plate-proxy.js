import axios from "axios";
import FormData from "form-data";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: "No image provided" });

    const buffer = Buffer.from(image, "base64");
    const form = new FormData();
    form.append("upload", buffer, { filename: "frame.jpg" });

    const response = await axios.post(
      "https://api.platerecognizer.com/v1/plate-reader/",
      form,
      {
        headers: {
          Authorization: `Token ${process.env.PLATE_RECOGNIZER_TOKEN}`,
          ...form.getHeaders(),
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Proxy error:", error.message);
    res.status(400).json({ error: error.message });
  }
}
