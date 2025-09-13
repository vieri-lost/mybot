const axios = require("axios");

// API AI sederhana
async function ai(prompt) {
  try {
    const res = await axios.get(`https://vihangayt.me/tools/chatgpt?q=${encodeURIComponent(prompt)}`);
    return res.data.data || "AI tidak merespon";
  } catch (e) {
    return "Error AI!";
  }
}

// API HD (upscale image)
async function hd(url) {
  try {
    const res = await axios.get(`https://vihangayt.me/tools/hd?url=${encodeURIComponent(url)}`);
    return res.data || "Gagal memperbesar gambar";
  } catch (e) {
    return "Error HD!";
  }
}

// API Search Google
async function gsearch(query) {
  try {
    const res = await axios.get(`https://vihangayt.me/tools/google?query=${encodeURIComponent(query)}`);
    return res.data.result || [];
  } catch (e) {
    return [];
  }
}

module.exports = { ai, hd, gsearch };
