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
