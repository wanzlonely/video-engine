/**
 * Generate narasi audio (TTS) untuk sebuah naskah dan tulis hasilnya
 * ke field `narasiAudio` pada file naskah/<id>.json.
 *
 * Pakai ElevenLabs API (cocok untuk suara Bahasa Indonesia yang natural).
 * Set ELEVENLABS_API_KEY di environment sebelum menjalankan ini.
 *
 * Sumber teks narasi diambil dari field top-level `narasiText` pada
 * naskah (teks penuh, bukan per-kata) - bukan dari `subtitles`, karena
 * subtitles sudah dipecah per-kata untuk keperluan caption, bukan untuk
 * dikirim ke TTS.
 *
 * Pemakaian:
 *   ELEVENLABS_API_KEY=xxx node tts.js --naskah alexandria
 *   node tts.js --naskah alexandria --voice <voiceId>
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

const DEFAULT_VOICE_ID = "pNInz6obpgDQGcFmaJgB"; // "Adam" - suara netral, cocok untuk narasi

function parseArgs(argv) {
  const args = { naskah: "alexandria", voice: DEFAULT_VOICE_ID };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--naskah") args.naskah = argv[++i];
    if (argv[i] === "--voice") args.voice = argv[++i];
  }
  return args;
}

function requestTTS({ apiKey, voiceId, text }) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    });

    const req = https.request(
      {
        hostname: "api.elevenlabs.io",
        path: `/v1/text-to-speech/${voiceId}`,
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        if (res.statusCode !== 200) {
          let errBody = "";
          res.on("data", (chunk) => (errBody += chunk));
          res.on("end", () =>
            reject(new Error(`ElevenLabs API error ${res.statusCode}: ${errBody}`))
          );
          return;
        }
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      }
    );

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  const { naskah: naskahId, voice: voiceId } = parseArgs(process.argv.slice(2));
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    console.error(
      "ELEVENLABS_API_KEY belum diset. Contoh: ELEVENLABS_API_KEY=xxx node tts.js --naskah alexandria"
    );
    process.exit(1);
  }

  const naskahPath = path.join(__dirname, "naskah", `${naskahId}.json`);
  if (!fs.existsSync(naskahPath)) {
    console.error(`File naskah tidak ditemukan: ${naskahPath}`);
    process.exit(1);
  }

  const naskah = JSON.parse(fs.readFileSync(naskahPath, "utf-8"));

  const narasiText =
    naskah.narasiText ||
    (naskah.subtitles || []).map((w) => w.text).join(" ");

  if (!narasiText.trim()) {
    console.error(
      "Tidak ada teks narasi. Tambahkan field `narasiText` (string penuh) di naskah, atau pastikan `subtitles` terisi."
    );
    process.exit(1);
  }

  console.log(`Membuat narasi audio untuk naskah: ${naskahId}`);
  console.log(`Teks (${narasiText.length} karakter): "${narasiText.slice(0, 80)}${narasiText.length > 80 ? "..." : ""}"`);

  const audioBuffer = await requestTTS({ apiKey, voiceId, text: narasiText });

  const audioDir = path.join(__dirname, "public", "audio");
  fs.mkdirSync(audioDir, { recursive: true });
  const audioFileName = `${naskahId}-narasi.mp3`;
  const audioPath = path.join(audioDir, audioFileName);
  fs.writeFileSync(audioPath, audioBuffer);

  naskah.narasiAudio = `public/audio/${audioFileName}`;
  fs.writeFileSync(naskahPath, JSON.stringify(naskah, null, 2));

  console.log(`Audio tersimpan di: ${audioPath}`);
  console.log(`Field narasiAudio pada ${naskahId}.json sudah diperbarui.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
