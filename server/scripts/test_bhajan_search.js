import CryptoJS from 'crypto-js';

function decryptUrl(enc) {
  if (!enc) return null;
  try {
    const key = CryptoJS.enc.Utf8.parse('38346591');
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(enc) },
      key,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );
    const url = decrypted.toString(CryptoJS.enc.Utf8);
    if (!url) return null;
    return url.replace('_96.mp4', '_320.mp4');
  } catch (e) {
    return null;
  }
}

async function fetchJson(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const text = await res.text();
    const clean = text.replace(/^[^{]*/, '').replace(/[^}]*$/, '');
    return JSON.parse(clean);
  } catch (err) {
    return null;
  }
}

async function searchSongs(q) {
  const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&cc=in&q=${encodeURIComponent(q)}&p=1&n=5`;
  const data = await fetchJson(url);
  if (!data || !data.results) return [];
  const pids = data.results.map(r => r.id);
  const detUrl = `https://www.jiosaavn.com/api.php?__call=song.getDetails&cc=in&_marker=0%3F_marker%3D0&_format=json&pids=${pids.join(',')}`;
  const detData = await fetchJson(detUrl);
  if (!detData) return [];
  
  return pids.map(id => {
    const s = detData[id];
    if (!s) return null;
    const audio = decryptUrl(s.encrypted_media_url);
    return {
      id: s.id,
      title: s.song,
      singers: s.primary_artists,
      album: s.album,
      duration: s.duration,
      audioUrl: audio,
      hasAudio: !!audio
    };
  }).filter(Boolean);
}

async function run() {
  const queries = [
    'Yashomati Maiya Se Bole Nandlala Lata Mangeshkar',
    'Shri Krishna Govind Hare Murari Ravindra Jain',
    'Radhe Radhe Barsane Wali Radhe Gaurav Krishna',
    'Govind Bolo Hari Gopal Bolo',
    'Bhaja Govindam M S Subbulakshmi'
  ];

  for (const q of queries) {
    const res = await searchSongs(q);
    console.log(`\n=== "${q}" ===`);
    for (const s of res) {
      console.log(`  "${s.title}" by ${s.singers} (${s.duration}s) [Audio: ${s.hasAudio ? 'OK' : 'FAIL'}]`);
    }
  }
}

run();
