import CryptoJS from 'crypto-js';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

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

function cleanHtml(str) {
  if (!str) return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function normalizeTitle(rawTitle) {
  if (!rawTitle) return '';
  let t = cleanHtml(rawTitle);
  t = t.replace(/\s*\((From|from|Lyrical|Audio|Video|Official|Remix|Reprise|Unplugged|Duet|Film Version|Full Song)[^)]*\)/gi, '');
  t = t.replace(/\s*\[(From|from|Lyrical|Audio|Video|Official|Remix|Reprise|Unplugged)[^\]]*\]/gi, '');
  t = t.replace(/\s+/g, ' ').trim();
  return t;
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

async function searchSongs(q, maxCount = 4) {
  const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&cc=in&q=${encodeURIComponent(q)}&p=1&n=${maxCount * 2}`;
  const data = await fetchJson(url);
  if (!data || !data.results) return [];
  const pids = data.results.map((r) => r.id);
  const detUrl = `https://www.jiosaavn.com/api.php?__call=song.getDetails&cc=in&_marker=0%3F_marker%3D0&_format=json&pids=${pids.join(',')}`;
  const detData = await fetchJson(detUrl);
  if (!detData) return [];

  const found = [];
  for (const id of pids) {
    const s = detData[id];
    if (!s) continue;
    const audio = decryptUrl(s.encrypted_media_url);
    if (!audio) continue;

    found.push({
      id: s.id,
      title: normalizeTitle(s.song),
      rawTitle: cleanHtml(s.song),
      singers: cleanHtml(s.primary_artists || 'Traditional Devotional'),
      album: cleanHtml(s.album || 'Sacred Bhajans'),
      durationSec: Number(s.duration) || 240,
      coverUrl: (s.image || '').replace('150x150', '500x500'),
      audioUrl: audio,
      year: Number(s.year) || 2022,
    });
    if (found.length >= maxCount) break;
  }
  return found;
}

// Curated search list mapped to deity / category & primary singer
const SEARCH_TARGETS = [
  // --- 1. SHRI HANUMAN CHALISA & HANUMAN BHAJANS ---
  {
    query: 'Shree Hanuman Chalisa Hariharan',
    category: 'Hanuman',
    primaryArtist: 'Hariharan',
    album: 'Shree Hanuman Chalisa (Gulshan Kumar)',
    genre: 'Devotional - Hanuman',
  },
  {
    query: 'Bajrang Baan Hariharan',
    category: 'Hanuman',
    primaryArtist: 'Hariharan',
    album: 'Shree Hanuman Chalisa (Gulshan Kumar)',
    genre: 'Devotional - Hanuman',
  },
  {
    query: 'Sankatmochan Hanuman Ashtak Hariharan',
    category: 'Hanuman',
    primaryArtist: 'Hariharan',
    album: 'Shree Hanuman Chalisa (Gulshan Kumar)',
    genre: 'Devotional - Hanuman',
  },
  {
    query: 'Jai Jai Hanuman Gusai Hariharan',
    category: 'Hanuman',
    primaryArtist: 'Hariharan',
    album: 'Shree Hanuman Chalisa (Gulshan Kumar)',
    genre: 'Devotional - Hanuman',
  },
  {
    query: 'Aarti Keeje Hanuman Lalla Ki Hariharan',
    category: 'Hanuman',
    primaryArtist: 'Hariharan',
    album: 'Shree Hanuman Chalisa (Gulshan Kumar)',
    genre: 'Devotional - Hanuman',
  },
  {
    query: 'Hanuman Chalisa Shekhar Ravjiani',
    category: 'Hanuman',
    primaryArtist: 'Shekhar Ravjiani',
    album: 'Hanuman Chalisa Acoustic',
    genre: 'Devotional - Hanuman',
  },

  // --- 2. MAHADEV & NAMAMI SHAMISHAN ---
  {
    query: 'Namami Shamishan',
    category: 'Mahadev',
    primaryArtist: 'Agam Aggarwal',
    album: 'Shri Rudrashtakam & Shiv Stutis',
    genre: 'Devotional - Mahadev',
  },
  {
    query: 'Shiv Tandav Stotram Shankar Mahadevan',
    category: 'Mahadev',
    primaryArtist: 'Shankar Mahadevan',
    album: 'Shiv Tandav Stotram',
    genre: 'Devotional - Mahadev',
  },
  {
    query: 'Shiv Kailasho Ke Vasi Hansraj Raghuwanshi',
    category: 'Mahadev',
    primaryArtist: 'Hansraj Raghuwanshi',
    album: 'Shiv Kailasho Ke Vasi',
    genre: 'Devotional - Mahadev',
  },
  {
    query: 'Mera Bhola Hai Bhandari Hansraj Raghuwanshi',
    category: 'Mahadev',
    primaryArtist: 'Hansraj Raghuwanshi',
    album: 'Mera Bhola Hai Bhandari',
    genre: 'Devotional - Mahadev',
  },
  {
    query: 'Har Har Shambhu Shiv Mahadeva Jeetu Sharma',
    category: 'Mahadev',
    primaryArtist: 'Jeetu Sharma & Abhilipsa Panda',
    album: 'Har Har Shambhu',
    genre: 'Devotional - Mahadev',
  },
  {
    query: 'Kaalbhairav Ashtakam Agam Aggarwal',
    category: 'Mahadev',
    primaryArtist: 'Agam Aggarwal',
    album: 'Kaal Bhairav Ashtakam',
    genre: 'Devotional - Mahadev',
  },
  {
    query: 'Karpur Gauram Karunavataram Ravikant Sinha',
    category: 'Mahadev',
    primaryArtist: 'Agam Aggarwal',
    album: 'Shiv Stutis',
    genre: 'Devotional - Mahadev',
  },
  {
    query: 'Mahamrityunjaya Mantra Harish Bhimadi Anuradha Paudwal',
    category: 'Mahadev',
    primaryArtist: 'Anuradha Paudwal',
    album: 'Maha Mrityunjaya Mantra',
    genre: 'Devotional - Mahadev',
  },
  {
    query: 'Jai Shiv Omkara Anuradha Paudwal',
    category: 'Mahadev',
    primaryArtist: 'Anuradha Paudwal',
    album: 'Aartiyan Sangrah',
    genre: 'Devotional - Mahadev',
  },

  // --- 3. SHRI KRISHNA BHAJANS ---
  {
    query: 'Achyutam Keshavam Krishna Damodaram Pratiksha Vashishtha',
    category: 'Krishna',
    primaryArtist: 'Pratiksha Vashishtha',
    album: 'Achyutam Keshavam',
    genre: 'Devotional - Krishna',
  },
  {
    query: 'Achyutam Keshavam Kaushal Kishore Palak Muchhal',
    category: 'Krishna',
    primaryArtist: 'Palak Muchhal',
    album: 'Achyutam Keshavam Melodies',
    genre: 'Devotional - Krishna',
  },
  {
    query: 'Shri Krishna Govind Hare Murari Jubin Nautiyal',
    category: 'Krishna',
    primaryArtist: 'Jubin Nautiyal',
    album: 'Shri Krishna Govind Hare Murari',
    genre: 'Devotional - Krishna',
  },
  {
    query: 'Shri Krishna Govind Hare Murari Ravindra Jain',
    category: 'Krishna',
    primaryArtist: 'Ravindra Jain',
    album: 'Shri Krishna Bhajan Sandhya',
    genre: 'Devotional - Krishna',
  },
  {
    query: 'Radhe Radhe Hansraj Raghuwanshi',
    category: 'Krishna',
    primaryArtist: 'Hansraj Raghuwanshi',
    album: 'Radhe Radhe',
    genre: 'Devotional - Krishna',
  },
  {
    query: 'Woh Kisna Hai Sukhwinder Singh',
    category: 'Krishna',
    primaryArtist: 'Sukhwinder Singh',
    album: 'Kisna - The Sound of Divine',
    genre: 'Devotional - Krishna',
  },
  {
    query: 'Mithe Ras Se Bharyo Radha Rani Lage Maanya Arora',
    category: 'Krishna',
    primaryArtist: 'Maanya Arora',
    album: 'Radha Rani Bhajans',
    genre: 'Devotional - Krishna',
  },
  {
    query: 'Chhoti Chhoti Gaiya Chhote Chhote Gwal Mridul Krishan Shastri',
    category: 'Krishna',
    primaryArtist: 'Mridul Krishan Shastri',
    album: 'Gopal Bhajans',
    genre: 'Devotional - Krishna',
  },
  {
    query: 'Yashomati Maiya Se Bole Nandlala Rashmi',
    category: 'Krishna',
    primaryArtist: 'Rashmi',
    album: 'Krishna Janmashtami Bhajans',
    genre: 'Devotional - Krishna',
  },
  {
    query: 'Aarti Kunj Bihari Ki Hariharan',
    category: 'Krishna',
    primaryArtist: 'Hariharan',
    album: 'Aarti Sangrah',
    genre: 'Devotional - Krishna',
  },

  // --- 4. SHRI RAM & SACRED CHANTS (ETC) ---
  {
    query: 'Ram Aayenge Swasti Mehul',
    category: 'Ram',
    primaryArtist: 'Swasti Mehul',
    album: 'Ram Aayenge',
    genre: 'Devotional - Ram',
  },
  {
    query: 'Shree Ramchandra Kripalu Bhajman Lata Mangeshkar',
    category: 'Ram',
    primaryArtist: 'Lata Mangeshkar',
    album: 'Ram Bhajan Amrit',
    genre: 'Devotional - Ram',
  },
  {
    query: 'Mangal Bhavan Amangal Hari Ravindra Jain',
    category: 'Ram',
    primaryArtist: 'Ravindra Jain',
    album: 'Sampoorna Ramayan',
    genre: 'Devotional - Ram',
  },
  {
    query: 'Gayatri Mantra Anuradha Paudwal',
    category: 'Stotram',
    primaryArtist: 'Anuradha Paudwal',
    album: 'Gayatri Mantra Sangrah',
    genre: 'Devotional - Vedic Chants',
  },
  {
    query: 'Jai Ganesh Deva Anuradha Paudwal',
    category: 'Ganesh',
    primaryArtist: 'Anuradha Paudwal',
    album: 'Ganesh Aarti Sangrah',
    genre: 'Devotional - Ganesh',
  },
];

// Artist info directory with bios and avatars
const ARTIST_METADATA = {
  'Hariharan': {
    genre: 'Devotional & Classical Ghazal',
    bio: 'Padma Shri recipient and revered voice of the legendary Shree Hanuman Chalisa, ghazals, and Indian classical music.',
    avatarUrl: 'https://c.saavncdn.com/artists/Hariharan_500x500.jpg',
  },
  'Hansraj Raghuwanshi': {
    genre: 'Devotional Folk & Mahadev Anthems',
    bio: 'Celebrated devotional sensation affectionately known as Babaji, renowned for iconic Mahadev tracks like Shiv Kailasho Ke Vasi and Mera Bhola Hai Bhandari.',
    avatarUrl: 'https://c.saavncdn.com/artists/Hansraj_Raghuwanshi_500x500.jpg',
  },
  'Agam Aggarwal': {
    genre: 'Sacred Sanskrit Stotrams & Shiva Chants',
    bio: 'Visionary singer known for powerful renditions of Namami Shamishan (Shri Rudrashtakam), Kaal Bhairav Ashtakam, and Karpur Gauram.',
    avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
  },
  'Shankar Mahadevan': {
    genre: 'Indian Classical & Devotional',
    bio: 'Legendary composer and singer famed for his electrifying, breath-defying rendition of Shiv Tandav Stotram.',
    avatarUrl: 'https://c.saavncdn.com/artists/Shankar_Mahadevan_500x500.jpg',
  },
  'Jubin Nautiyal': {
    genre: 'Sufi, Bollywood & Devotional',
    bio: 'Soulful singer celebrated for devotional hits including Shri Krishna Govind Hare Murari and Har Har Shambhu.',
    avatarUrl: 'https://c.saavncdn.com/artists/Jubin_Nautiyal_500x500.jpg',
  },
  'Maanya Arora': {
    genre: 'Krishna Bhajans & Braj Folk',
    bio: 'Beloved devotional artist celebrated across Vrindavan and Mathura for Mithe Ras Se Bharyo Radha Rani Lage.',
    avatarUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80',
  },
  'Anuradha Paudwal': {
    genre: 'Devotional & Evergreen Melodies',
    bio: 'Padma Shri singer whose celestial voice immortalized the Gayatri Mantra, Mahamrityunjaya Mantra, and Aarti Sangrah.',
    avatarUrl: 'https://c.saavncdn.com/artists/Anuradha_Paudwal_500x500.jpg',
  },
  'Ravindra Jain': {
    genre: 'Spiritual, Vedic & Ramayan Classics',
    bio: 'Revered musical maestro and lyricist behind the immortal music of Ramanand Sagar’s Ramayan and Shri Krishna.',
    avatarUrl: 'https://c.saavncdn.com/artists/Ravindra_Jain_500x500.jpg',
  },
  'Swasti Mehul': {
    genre: 'Contemporary Devotional',
    bio: 'Sensation whose soulful anthem Ram Aayenge touched millions of devotees worldwide.',
    avatarUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
  },
  'Lata Mangeshkar': {
    genre: 'Nightingale of India & Devotional',
    bio: 'Bharat Ratna recipient and timeless voice of India whose devotional renditions like Shree Ramchandra Kripalu Bhajman resonate eternally.',
    avatarUrl: 'https://c.saavncdn.com/artists/Lata_Mangeshkar_500x500.jpg',
  },
  'Shekhar Ravjiani': {
    genre: 'Modern Devotional & Acoustic',
    bio: 'Acclaimed composer and vocalist whose acoustic rendition of Hanuman Chalisa brings peace and meditative focus.',
    avatarUrl: 'https://c.saavncdn.com/artists/Shekhar_Ravjiani_500x500.jpg',
  },
  'Jeetu Sharma & Abhilipsa Panda': {
    genre: 'Devotional Shiva Anthems',
    bio: 'Creators of the viral pan-Indian devotional anthem Har Har Shambhu Shiv Mahadeva.',
    avatarUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80',
  },
  'Pratiksha Vashishtha': {
    genre: 'Krishna Devotional',
    bio: 'Soulful artist celebrated for peaceful and melodic renditions of Achyutam Keshavam Krishna Damodaram.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  },
  'Palak Muchhal': {
    genre: 'Bollywood & Devotional',
    bio: 'Guinness World Record holding philanthropist and playback singer celebrated for Achyutam Keshavam.',
    avatarUrl: 'https://c.saavncdn.com/artists/Palak_Muchhal_500x500.jpg',
  },
  'Mridul Krishan Shastri': {
    genre: 'Braj Ras & Krishna Kirtan',
    bio: 'Eminent Bhagwat Katha and Braj devotional singer beloved for Chhoti Chhoti Gaiya Chhote Chhote Gwal.',
    avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
  },
  'Sukhwinder Singh': {
    genre: 'Energetic Devotional & Sufi',
    bio: 'Grammy and Academy Award winning powerhouse singer behind Woh Kisna Hai.',
    avatarUrl: 'https://c.saavncdn.com/artists/Sukhwinder_Singh_500x500.jpg',
  },
  'Rashmi': {
    genre: 'Classic Krishna Bhajans',
    bio: 'Devotional artist known for serene renditions of Yashomati Maiya Se Bole Nandlala.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  },
};

async function main() {
  console.log('🕉️ Starting Sacred Bhajan & Devotional Music Importer...\n');

  const collectedSongs = [];
  const seenAudioUrls = new Set();
  const seenTitles = new Set();

  for (const target of SEARCH_TARGETS) {
    console.log(`🔍 Searching: "${target.query}"...`);
    const results = await searchSongs(target.query, 2);

    if (results.length === 0) {
      console.log(`   ⚠️ No results found for "${target.query}"`);
      continue;
    }

    for (const song of results) {
      if (seenAudioUrls.has(song.audioUrl)) continue;
      const lowerTitle = song.title.toLowerCase();
      if (seenTitles.has(lowerTitle)) continue;

      seenAudioUrls.add(song.audioUrl);
      seenTitles.add(lowerTitle);

      collectedSongs.push({
        title: song.title,
        artistName: target.primaryArtist,
        albumTitle: target.album,
        durationSec: song.durationSec,
        audioUrl: song.audioUrl,
        coverUrl: song.coverUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
        genre: target.genre,
        category: target.category,
        year: song.year,
      });

      console.log(`   ✅ Added: "${song.title}" (${song.durationSec}s) -> ${target.primaryArtist}`);
      break; // Keep best match per target
    }
  }

  console.log(`\n🪔 Found ${collectedSongs.length} pristine devotional songs ready for insertion.`);

  // 1. Ensure Artists exist in database
  let artistsCreated = 0;
  for (const song of collectedSongs) {
    let artist = await prisma.artist.findFirst({
      where: { name: song.artistName },
    });

    const meta = ARTIST_METADATA[song.artistName] || {
      genre: 'Devotional & Bhajans',
      bio: 'Revered devotional artist dedicated to sacred Indian music and chanting.',
      avatarUrl: song.coverUrl,
    };

    if (!artist) {
      artist = await prisma.artist.create({
        data: {
          name: song.artistName,
          genre: meta.genre,
          bio: meta.bio,
          avatarUrl: meta.avatarUrl || song.coverUrl,
        },
      });
      artistsCreated++;
      console.log(`   ✨ Created Artist: ${artist.name}`);
    } else if (!artist.avatarUrl || artist.avatarUrl.includes('unsplash')) {
      if (meta.avatarUrl && !meta.avatarUrl.includes('unsplash')) {
        await prisma.artist.update({
          where: { id: artist.id },
          data: { avatarUrl: meta.avatarUrl },
        });
      }
    }

    // 2. Ensure Album exists
    let album = await prisma.album.findFirst({
      where: { title: song.albumTitle, artistId: artist.id },
    });

    if (!album) {
      album = await prisma.album.create({
        data: {
          title: song.albumTitle,
          coverUrl: song.coverUrl,
          releaseYear: song.year || 2022,
          artistId: artist.id,
        },
      });
    }

    // 3. Ensure Song exists
    const existing = await prisma.song.findFirst({
      where: {
        OR: [
          { title: song.title, artistId: artist.id },
          { audioUrl: song.audioUrl },
        ],
      },
    });

    if (existing) {
      await prisma.song.update({
        where: { id: existing.id },
        data: {
          title: song.title,
          coverUrl: song.coverUrl,
          audioUrl: song.audioUrl,
          durationSec: song.durationSec,
          genre: song.genre,
          albumId: album.id,
        },
      });
    } else {
      await prisma.song.create({
        data: {
          title: song.title,
          durationSec: song.durationSec,
          audioUrl: song.audioUrl,
          coverUrl: song.coverUrl,
          genre: song.genre,
          artistId: artist.id,
          albumId: album.id,
        },
      });
    }
  }

  // 4. Update verified_songs.json
  const verifiedPath = path.join(__dirname, '../verified_songs.json');
  if (fs.existsSync(verifiedPath)) {
    try {
      const existingVerified = JSON.parse(fs.readFileSync(verifiedPath, 'utf-8'));
      const existingTitles = new Set(existingVerified.map((s) => s.title.toLowerCase()));

      let addedToVerified = 0;
      for (const s of collectedSongs) {
        if (!existingTitles.has(s.title.toLowerCase())) {
          existingVerified.push({
            title: s.title,
            artist: s.artistName,
            album: s.albumTitle,
            coverUrl: s.coverUrl,
            audioUrl: s.audioUrl,
            durationSec: s.durationSec,
            genre: s.genre,
            releaseYear: s.year || 2022,
          });
          addedToVerified++;
        }
      }
      fs.writeFileSync(verifiedPath, JSON.stringify(existingVerified, null, 2));
      console.log(`\n💾 verified_songs.json updated: Added ${addedToVerified} sacred tracks.`);
    } catch (err) {
      console.warn('⚠️ Could not update verified_songs.json:', err.message);
    }
  }

  // 5. Final database counts
  const totalSongs = await prisma.song.count();
  const totalDevotional = await prisma.song.count({
    where: { genre: { contains: 'Devotional' } },
  });

  console.log(`\n===========================================`);
  console.log(`🙏 Sacred Devotional Collection Added Successfully!`);
  console.log(`📊 Devotional Tracks in VIBE: ${totalDevotional}`);
  console.log(`📊 Total Platform Library Songs: ${totalSongs}`);
  console.log(`===========================================\n`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('❌ Error adding devotional bhajans:', e);
  await prisma.$disconnect();
  process.exit(1);
});
