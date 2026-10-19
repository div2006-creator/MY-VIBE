import CryptoJS from 'crypto-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function searchJioSaavn(query) {
  try {
    const searchUrl = `https://www.jiosaavn.com/api.php?__call=autocomplete.get&_format=json&_marker=0&cc=in&includeMetaTags=1&query=${encodeURIComponent(query)}`;
    const res = await fetch(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const text = await res.text();
    const clean = text.replace(/^[^{]*/, '').replace(/[^}]*$/, '');
    const data = JSON.parse(clean);
    const songs = data.songs?.data || [];
    if (songs.length === 0) return null;
    
    const pid = songs[0].id;
    const detailUrl = `https://www.jiosaavn.com/api.php?__call=song.getDetails&cc=in&_marker=0%3F_marker%3D0&_format=json&pids=${pid}`;
    const detailRes = await fetch(detailUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const detailText = await detailRes.text();
    const cleanDetail = detailText.replace(/^[^{]*/, '').replace(/[^}]*$/, '');
    const detailData = JSON.parse(cleanDetail);
    const song = detailData[pid];
    if (!song) return null;

    const fullUrl = decryptUrl(song.encrypted_media_url);
    if (!fullUrl) return null;

    return {
      title: song.song.replace(/&quot;/g, '"').replace(/&#039;/g, "'"),
      artist: song.primary_artists.split(',')[0].trim(),
      album: song.album.replace(/&quot;/g, '"').replace(/&#039;/g, "'"),
      durationSec: Number(song.duration) || 180,
      coverUrl: (song.image || '').replace('150x150', '500x500'),
      audioUrl: fullUrl,
      year: Number(song.year) || 2022
    };
  } catch (err) {
    return null;
  }
}

const targetTracks = [
  // Punjabi Full Songs
  { q: 'Sidhu Moose Wala 295', genre: 'Punjabi Hip Hop', bio: 'Iconic Punjabi rapper and cultural legend known for revolutionary lyrics and fearless anthems.', avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80' },
  { q: 'Sidhu Moose Wala Famous', genre: 'Punjabi Hip Hop', fallbackAudio: 'https://archive.org/download/famousidhumoosewala/Famous.mp3' },
  { q: 'Diljit Dosanjh Lover', genre: 'Punjabi Pop', bio: 'Global Punjabi music icon, Coachella performer, and celebrated actor.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80' },
  { q: 'Diljit Dosanjh Born to Shine', genre: 'Punjabi Pop' },
  { q: 'Diljit Dosanjh Kinni Kinni', genre: 'Punjabi Pop' },
  { q: 'Diljit Dosanjh GOAT', genre: 'Punjabi Pop' },
  { q: 'Karan Aujla Tauba Tauba', genre: 'Punjabi Dance Pop', bio: 'Prolific Punjabi singer, lyricist, and global chart-topper with infectious rhythmic hooks.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80' },
  { q: 'Karan Aujla Softly', genre: 'Punjabi R&B' },
  { q: 'Karan Aujla 52 Bars', genre: 'Punjabi Hip Hop' },
  { q: 'AP Dhillon Brown Munde', genre: 'Punjabi Wave', bio: 'Pioneering Indo-Canadian artist who took Punjabi wave global with melodic trap productions.', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80' },
  { q: 'AP Dhillon Excuses', genre: 'Punjabi Melodic' },
  { q: 'AP Dhillon Insane', genre: 'Punjabi Wave' },
  { q: 'Shubh Baller', genre: 'Punjabi Hip Hop', bio: 'Canadian-Indian breakout sensation known for chart-topping viral hip-hop tracks.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80' },
  { q: 'Shubh Cheques', genre: 'Punjabi Hip Hop' },
  { q: 'Shubh No Love', genre: 'Punjabi Hip Hop' },

  // Bollywood / Hindi Full Songs
  { q: 'Arijit Singh Kesariya', genre: 'Bollywood Romantic', bio: "India's premier playback singer with unmatched emotive depth and melodic grace.", avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80' },
  { q: 'Arijit Singh Tum Hi Ho', genre: 'Bollywood Romantic', fallbackAudio: 'https://archive.org/download/hindinepalisongs/01.%20Tum%20Hi%20Ho%20-%20Aashiqui%202.mp3' },
  { q: 'Arijit Singh Channa Mereya', genre: 'Sufi Romantic', fallbackAudio: 'https://archive.org/download/india-channa-mereya/India%20Channa%20Mereya.mp3' },
  { q: 'Arijit Singh Apna Bana Le', genre: 'Bollywood Melodic', fallbackAudio: 'https://archive.org/download/y-2mate.com-apna-bana-le-bhediya-varun-dhawan-kriti-sanon-sachin-jigar-arijit-si/y2mate.com%20-%20Apna%20Bana%20Le%20Bhediya%20Varun%20Dhawan%20Kriti%20Sanon%20Sachin%20Jigar%20Arijit%20Singh.mp3' },
  { q: 'Atif Aslam Jeene Laga Hoon', genre: 'Bollywood Pop', bio: 'South Asian rock & playback legend celebrated for transcendent high registers.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80' },
  { q: 'Atif Aslam Tu Jaane Na', genre: 'Bollywood Romantic' },
  { q: 'Atif Aslam Tera Hone Laga Hoon', genre: 'Bollywood Pop' },
  { q: 'KK Zara Sa', genre: 'Classic Bollywood Rock', bio: 'Legendary Indian playback artist whose evergreen ballads defined an entire generation.', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80' },
  { q: 'KK Kya Mujhe Pyaar Hai', genre: 'Bollywood Rock' },
  { q: 'Anuv Jain Husn', genre: 'Indie Acoustic', bio: 'Lyrical acoustic storyteller celebrated for raw, heartfelt indie melodies.', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80' },
  { q: 'Vishal Mishra Pehle Bhi Main', genre: 'Bollywood Melodic' },
  { q: 'Jasleen Royal Ranjha', genre: 'Bollywood Acoustic' },

  // English & Global Full Songs
  { q: 'The Weeknd Blinding Lights', genre: 'Synthwave / R&B', bio: 'Canadian superstar defining modern dark pop, synthwave, and neo-R&B.', avatar: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80' },
  { q: 'The Weeknd Starboy', genre: 'Electropop' },
  { q: 'Taylor Swift Cruel Summer', genre: 'Synthpop', bio: 'Global cultural icon known for narrative songcraft across multiple genres.', avatar: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80' },
  { q: 'Ed Sheeran Shape of You', genre: 'Pop', bio: 'Multi-Grammy winning singer-songwriter famed for acoustic and modern pop anthems.', avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80' },
  { q: 'Dua Lipa Levitating', genre: 'Nu-Disco / Pop', bio: 'British-Albanian pop queen bringing 80s disco revival to dancefloors worldwide.', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80' },
  { q: 'Post Malone Sunflower', genre: 'Hip Hop / Pop', bio: 'Genre-blending artist known for introspective lyrics and soaring melodic hooks.', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80' },
  { q: 'Coldplay Yellow', genre: 'Indie Alternative', bio: "One of the world's biggest stadium rock bands renowned for uplifting anthems.", avatar: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80' }
];

async function run() {
  console.log('🚀 Extracting 30+ Full Length Punjabi, Hindi & English Songs (320kbps)...');
  const verified = [];
  
  for (const t of targetTracks) {
    const s = await searchJioSaavn(t.q);
    if (s && s.audioUrl) {
      verified.push({
        title: s.title,
        artist: s.artist,
        artistBio: t.bio,
        artistAvatar: t.avatar,
        artistGenre: t.genre,
        album: s.album,
        releaseYear: s.year,
        durationSec: s.durationSec,
        coverUrl: s.coverUrl,
        audioUrl: s.audioUrl,
        genre: t.genre
      });
      console.log(`✅ [FULL SONG] ${s.title} by ${s.artist} (${s.durationSec}s)`);
    } else if (t.fallbackAudio) {
      verified.push({
        title: t.q.split(' ').slice(1).join(' '),
        artist: t.q.split(' ')[0],
        artistBio: t.bio,
        artistAvatar: t.avatar,
        artistGenre: t.genre,
        album: 'Single',
        releaseYear: 2022,
        durationSec: 260,
        coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
        audioUrl: t.fallbackAudio,
        genre: t.genre
      });
      console.log(`✅ [ARCHIVE FULL SONG] ${t.q}`);
    }
  }

  const outPath = path.join(__dirname, '../verified_songs.json');
  fs.writeFileSync(outPath, JSON.stringify(verified, null, 2));
  console.log(`\n🎉 Extracted ${verified.length} pristine full-length songs to ${outPath}!`);
}

run();
