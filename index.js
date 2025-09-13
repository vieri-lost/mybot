const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  generateWAMessageFromContent,
  proto
} = require("@whiskeysockets/baileys");
const P = require("pino");
const qrcode = require("qrcode-terminal");
const { ai, hd, gsearch } = require("./api");
const fs = require("fs");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("session");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    logger: P({ level: "silent" }),
    printQRInTerminal: true,
    auth: state,
    version
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, qr } = update;
    if (qr) qrcode.generate(qr, { small: true });
    if (connection === "open") console.log("✅ Bot sudah konek!");
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const type = Object.keys(msg.message)[0];
    const text = type === "conversation"
      ? msg.message.conversation
      : type === "extendedTextMessage"
      ? msg.message.extendedTextMessage.text
      : "";

    if (!text) return;

    // ✅ MENU
    if (text === ".menu") {
      const menu = `
*🤖 BOT MENU SIMPLE*
1. .sticker (balas foto/vid)
2. .brat
3. .bratvid
4. .ai [prompt]
5. .hd [url gambar]
6. .search [query]
`;
      await sock.sendMessage(from, { text: menu });
    }

    // ✅ STICKER
    if (text === ".sticker" && (msg.message.imageMessage || msg.message.videoMessage)) {
      const buffer = await sock.downloadMediaMessage(msg);
      await sock.sendMessage(from, { sticker: buffer }, { quoted: msg });
    }

    // ✅ BRAT
    if (text === ".brat") {
      await sock.sendMessage(from, { audio: { url: "https://files.catbox.moe/4r1s6j.mp3" }, mimetype: "audio/mp4", ptt: true }, { quoted: msg });
    }

    // ✅ BRAT VIDEO
    if (text === ".bratvid") {
      await sock.sendMessage(from, { video: { url: "https://files.catbox.moe/lb6s6x.mp4" }, caption: "Brat Video!" }, { quoted: msg });
    }

    // ✅ AI
    if (text.startsWith(".ai")) {
      const prompt = text.split(".ai ")[1];
      const res = await ai(prompt);
      await sock.sendMessage(from, { text: res }, { quoted: msg });
    }

    // ✅ HD
    if (text.startsWith(".hd")) {
      const url = text.split(".hd ")[1];
      const res = await hd(url);
      await sock.sendMessage(from, { image: { url: res.url }, caption: "HD Result" }, { quoted: msg });
    }

    // ✅ Google Search
    if (text.startsWith(".search")) {
      const query = text.split(".search ")[1];
      const results = await gsearch(query);
      let teks = "*🔍 Google Search Result:*\n\n";
      results.forEach((r, i) => {
        teks += `${i + 1}. ${r.title}\n${r.link}\n\n`;
      });
      await sock.sendMessage(from, { text: teks }, { quoted: msg });
    }
  });
}

startBot();
