export default async function handler(req, res) {
  // ✅ Allow CORS for frontend requests
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.status(200).end();
  }

  res.setHeader("Access-Control-Allow-Origin", "*");

  // ✅ Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { icon1, icon2, vibe } = req.body;

  if (!icon1 || !icon2 || !vibe) {
    return res.status(400).json({ error: "Missing icon1, icon2, or vibe" });
  }

  const prompt = `${icon1} + ${icon2} in a ${vibe} setting, vibrant, chaotic, meme, dreamlike, high quality anime art`;

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
    console.error("❌ Unexpected Error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
}
