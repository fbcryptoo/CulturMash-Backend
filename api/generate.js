
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST requests allowed" });

  const { icon1, icon2, vibe } = req.body;
  if (!icon1 || !icon2 || !vibe) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const prompt = `${icon1} + ${icon2} in a ${vibe} setting, vibrant, chaotic, meme, dreamlike, high-res digital art`;

  console.log("🧠 Hugging Face prompt:", prompt);

  try {
    const hfResponse = await fetch("https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`
      },
      body: JSON.stringify({ inputs: prompt })
    });

    if (!hfResponse.ok) {
      const error = await hfResponse.text();
      console.error("❌ HF API Error:", error);
      return res.status(500).json({ error: "Hugging Face generation failed", detail: error });
    }

    const imageBuffer = await hfResponse.arrayBuffer();
    res.setHeader("Content-Type", "image/png");
    return res.send(Buffer.from(imageBuffer));
  } catch (err) {
    console.error("🔥 Unhandled HF error:", err);
    return res.status(500).json({ error: "Unhandled error", detail: err.message });
  }
}
