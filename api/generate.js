export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { prompt } = req.body;

  try {
    const response = await fetch("https://hf.space/embed/stabilityai/stable-diffusion-2-1/+/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [prompt]
      })
    });

    const result = await response.json();

    if (!result || !result.data || !result.data[0]) {
      console.error("❌ HF Space Error:", result);
      return res.status(500).json({ error: "Image generation failed" });
    }

    const imageUrl = result.data[0];

    // Return the image URL (for the frontend to display)
    return res.status(200).json({ image: imageUrl });

  } catch (err) {
    console.error("❌ Unexpected Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
