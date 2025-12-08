import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const GOOGLE_API_KEY = process.env.GOOGLE_TTS_KEY;

app.post("/tts", async (req, res) => {
  const { text } = req.body;
  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_API_KEY}`;

  const body = {
    input: { text },
    voice: { languageCode: "ja-JP", name: "ja-JP-Wavenet-B" }, // Nam: B, Nữ: A
    audioConfig: { audioEncoding: "MP3", speakingRate: 1 },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (data.audioContent) {
    res.json({ audio: `data:audio/mp3;base64,${data.audioContent}` });
  } else {
    res.status(500).json({ error: "TTS failed", details: data });
  }
});

app.listen(3001, () => console.log("TTS server running on port 3001"));