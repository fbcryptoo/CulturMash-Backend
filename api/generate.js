
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
  console.log("🧠 Prompt received:", prompt);

  try {
    const prediction = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: "8e59c284ce2e64c8da83ec73a2d49ff4a0ae5b3e507b4f1f3bfaabdb021c377a",
        input: {
          prompt: prompt,
          aspect_ratio: "1:1", // or "4:3", "3:2", "16:9"
          safety_filter_level: "block_medium_and_above", // keeps it PG-13
          output_format: "png"
        }
      })
    }).then(r => r.json());

    if (!prediction || !prediction.id) {
      console.error("❌ No prediction returned:", prediction);
      return res.status(500).json({ error: "Failed to start prediction", detail: prediction });
    }

    console.log("⏳ Prediction ID:", prediction.id);
    let finalPrediction = prediction;
    let checks = 0;

    while (finalPrediction.status !== "succeeded" && finalPrediction.status !== "failed" && checks < 60) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      checks++;
      const check = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`
        }
      }).then(r => r.json());

      finalPrediction = check;
      console.log(`🔁 Status check ${checks}: ${finalPrediction.status}`);
    }

    if (finalPrediction.status === "succeeded") {
      const imageUrl = finalPrediction.output[0];
      console.log("✅ Image generated:", imageUrl);
      const imageRes = await fetch(imageUrl);
      const imageBuffer = await imageRes.arrayBuffer();
      res.setHeader("Content-Type", "image/png");
      return res.send(Buffer.from(imageBuffer));
    } else {
      console.error("❌ Final status:", finalPrediction.status, finalPrediction.error || "");
      return res.status(500).json({ error: "Image generation failed", detail: finalPrediction.error || "" });
    }
  } catch (err) {
    console.error("🔥 Unhandled error:", err);
    return res.status(500).json({ error: "Unhandled error", detail: err.message });
  }
}
