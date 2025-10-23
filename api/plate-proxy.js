import axios from "axios";
import FormData from "form-data";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: "No image data" });

    // Converte il base64 in buffer binario
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const form = new FormData();
    form.append("upload", buffer, { filename: "frame.jpg" });

    const response = await axios.post(
      "https://api.platerecognizer.com/v1/plate-reader/",
      form,
      {
        headers: {
          Authorization: `Token ${process.env.VITE_PLATE_TOKEN}`,
          ...form.getHeaders(),
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Proxy error:", error.response?.data || error.message);
    return res
      .status(error.response?.status || 500)
      .json({ error: error.response?.data || error.message });
  }
}
