export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const { icon1, icon2, vibe } = req.body;

  if (!icon1 || !icon2 || !vibe) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const prompt = `${icon1} + ${icon2} in a ${vibe} setting, anime style, vibrant, chaotic, high quality`;

  console.log("🧠 Hugging Face prompt:", prompt);

  try {
    const response = await fetch("https://api-inference.huggingface.co/models/prompthero/openjourney", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt })
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("❌ HF API Error:", err);
      return res.status(500).json({ error: "Image generation failed" });
    }

    const buffer = await response.arrayBuffer();
    res.setHeader("Content-Type", "image/png");
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
}
