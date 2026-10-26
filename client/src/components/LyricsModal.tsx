import React from 'react';
import { X, Mic2, Music, Sparkles } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

const DEFAULT_LYRICS: Record<string, string[]> = {
  default: [
    "✨ (Instrumental Intro)",
    "Watching stars flicker in the midnight sky...",
    "Every heartbeat echoes like a lullaby.",
    "Soft rain falling on the window pane,",
    "Washing away the noise and the pain.",
    "🎵 (Melodic drop)",
    "We held the moment before it slipped away,",
    "Memories carved in golden yesterday.",
    "Turn up the vibe, let the music flow,",
    "Where the lights fade into a neon glow.",
    "🌌 (Ambient Outro)",
  ],
  'Tum Hi Ho': [
    "🎵 (Aashiqui 2 Piano Intro)",
    "Hum tere bin ab reh nahi sakte,",
    "Tere bina kya wajood mera...",
    "Tujhse juda gar ho jaayenge,",
    "Toh khud se hi ho jaayenge judaa.",
    "✨ (Violin climax)",
    "Kyunki tum hi ho, ab tum hi ho,",
    "Zindagi ab tum hi ho...",
    "Chain bhi, mera dard bhi,",
    "Meri aashiqui ab tum hi ho!",
    "Tere liye hi jiya main, khud ko jo yun de diya hai,",
    "Teri wafa ne mujhko sambhala...",
    "Saare ghamon ko dil se nikala.",
    "Kyunki tum hi ho, ab tum hi ho...",
  ],
  'Kesariya': [
    "🎸 (Acoustic Guitar Strumming)",
    "Mujhko itna bataaye koi,",
    "Kaise tujhpe na pyaar aaye koi...",
    "Dil na jaan-e-kahan khoya hai,",
    "Kyunki aankhon mein khwaab boya hai.",
    "✨ (Brahmastra Chorus Drop)",
    "Kesariya tera ishq hai piya,",
    "Rang jaaun jo main haath lagaun...",
    "Din beetay saara teri fikr mein,",
    "Rain saari teri khair manaun!",
    "Kesariya tera ishq hai piya...",
  ],
  'Channa Mereya': [
    "🪕 (Shehnai & Acoustic Intro)",
    "Achha chalte hain, duaaon mein yaad rakhna,",
    "Mere zikr ka zubaan pe swaad rakhna...",
    "Dil ke sandookon mein, mere achhe kaam rakhna,",
    "Chhitti taaron mein bhi, mera tu salaam rakhna!",
    "✨ (Soulful Arijit Climax)",
    "Andhera tera maine le liya,",
    "Mera ujaala chhanon de diya...",
    "Channa mereya mereya, channa mereya mereya,",
    "Channa mereya mereya beliya, O piyaya!",
  ],
  'Cruel Summer': [
    "⚡ (Synthpop Beat Switch)",
    "Fever dream high in the quiet of the night,",
    "You know that I caught it...",
    "Bad, bad boy, shiny toy with a price,",
    "You know that I bought it.",
    "🚀 (Taylor Bridge Peak)",
    "And it's new, the shape of your body,",
    "It's blue, the feeling I've got,",
    "And it's ooh, whoa-oh...",
    "It's a cruel summer with you!",
    "I love you, ain't that the worst thing you ever heard?",
    "He looks up grinning like a devil!",
  ],
  'Perfect': [
    "🎸 (Gentle Acoustic Waltz)",
    "I found a love for me...",
    "Darling, just dive right in and follow my lead.",
    "Well, I found a girl, beautiful and sweet,",
    "Oh, I never knew you were the someone waiting for me.",
    "✨ (Chorus)",
    "Baby, I'm dancing in the dark with you between my arms,",
    "Barefoot on the grass, listening to our favorite song.",
    "When you said you looked a mess, I whispered underneath my breath,",
    "But you heard it, darling, you look perfect tonight.",
  ],
  'Confident': [
    "🔥 (R&B Groove Intro)",
    "Focused, I'm focused, she got to be the one,",
    "A beauty, a beauty in the room where I'm from.",
    "No, no, no doubt, she's got it all under control,",
    "Walking like she own the floor, body and soul.",
    "✨ (Hook - Justin Bieber)",
    "She's confident, oh yeah, she's confident,",
    "Got her own, she ain't looking for a handout.",
    "She's confident, yeah, and she know it,",
    "Ain't afraid to go and show it!",
    "Got me tripping on the rhythm that she bringing,",
    "Listen to the melody she got me singing.",
  ],
  'Intentions': [
    "✨ (Quavo & Bieber Chords)",
    "Picture perfect, you don't need no filter,",
    "Gorgeous, make 'em drop dead, you a killer.",
    "Shower you with all of my attention,",
    "Yeah, these are my only intentions.",
    "🎵 (Chorus Drop)",
    "Stay in the kitchen cooking up, got your own bread,",
    "Heart full of equity, you're an asset.",
    "Make sure that you don't need for nothing,",
    "Honest intentions, girl, you're a blessing.",
    "No cap, no pretend, 100 percent,",
    "You got my heart, no rented apartment.",
  ],
  'Blue Eyes': [
    "🕶️ (Yo Yo Honey Singh Intro)",
    "Blue eyes, hypnotize teri kardi ae mainu,",
    "I swear chhoti dress mein bomb lagdi mainu!",
    "Glossy lips, uff ye tricks,",
    "Baby lagti hai tu six out of six!",
    "🔥 (Drop Climax)",
    "Ghar le jaaun, ya club mein nachaun,",
    "Tujhe dekh ke mere dil mein baje guitar!",
    "Aaj raat ka scene bana le,",
    "Yo Yo Honey Singh ke sath chaliye!",
  ],
  'Brown Rang': [
    "👑 (International Villager Beat)",
    "Kudiye ni tere brown rang ne,",
    "Munde patt te ni saare mere town de!",
    "Koi kahe Rihanna, koi Shakira,",
    "Par tere agge sab lagde ne feeka!",
    "🔥 (Yo Yo Rap)",
    "White girls to ho gayin purani,",
    "Hunn brown kudiye teri hai zindgani!",
    "Brown rang ne, munde patt te saare town de!",
  ],
  'Dope Shope': [
    "💊 (Deep Money & Yo Yo Hook)",
    "Aakh lad gayi oye shawa aakh lad gayi,",
    "Kudi nakhre di maari hundi jaandi talli!",
    "Main keha peeni ae? Kehndi shot maarne!",
    "Club vich saare munde pichhe laa laye!",
    "🔥 (Dope Shope Drop)",
    "Hey hey hey, kudi kardi ae dope shope maareya karo,",
    "Thoda hass ke vi saanu takk laya karo!",
  ],
  'Desi Kalakaar': [
    "🏎️ (Desi Kalakaar Retro Chords)",
    "Yaar tera superstar, desi kalakaar,",
    "Chhad saariyan nu aaja mere kol!",
    "Ghar waleyan nu keh de tussi karo aish,",
    "Munda karda kamai lakh lakh di cash!",
    "🔥 (Yo Yo Chorus)",
    "Mera mann tere pichhe pichhe aave,",
    "Tu bas haan karde kudiye!",
  ],
  'Love Dose': [
    "💉 (Love Dose Melodic Rhythms)",
    "Lagdi mainu jivein ambran di rani,",
    "Meethi meethi gallan kare soni te sayani.",
    "Ek do teen chaar, aaja mere yaar,",
    "Mujhko mila de teri love ki dose ek baar!",
    "🔥 (Hook)",
    "Ghar tere aaunga, doli le jaaunga,",
    "Tere mummy daddy ko manaunga!",
  ],
  'Millionaire': [
    "💰 (GLORY 2024 Bassline)",
    "Gaddiyan vi kaliyan, rim vi shokeen,",
    "Yo Yo Honey Singh on the screen!",
    "Duniya di gallan assi sun de ni yaar,",
    "Asi ban gaye aan hunn millionaire!",
    "🔥 (Glory Drop)",
    "Karde ne raaj jiven kitta si pehlan,",
    "Sher kade budha naiyo hunda mere yaar!",
  ],
  '295': [
    "🔥 (Sidhu Moose Wala Moosetape Intro)",
    "Dass putt tera head down kaston,",
    "Changi bhali hundi si chadhayi kaston...",
    "Jehde darwaje agge behnde hunde si,",
    "Ohi karde ne pehlan hunn vaar kaston!",
    "⚡ (Hard 808 Bass Climax)",
    "Roz sunan nu mildi ae nawi koyi khabar,",
    "Loki kehnde Moose Wala lagg gaya aam!",
    "Dass kiddan karaan main tere te yakeen,",
    "Jadon 295 kardi ae badnaam!",
    "Sach bolan waleyan te case thoke jande,",
    "Jhootheyan nu dinde ne salaam!",
    "Karde ne gallan saare shreaam...",
  ],
  'Lover': [
    "✨ (MoonChild Synth Chords)",
    "Tera ni lover, koi hor houga,",
    "Main taan bas dil ch vasauna chahuna aan...",
    "Akhiyan milaun di taan aadat nahi,",
    "Nazran ch nazran lukauna chahuna aan!",
    "🎵 (Diljit Drop)",
    "Tere pichhe pichhe aunde gabru hazaar,",
    "Par saade jina dass keda karuga pyar?",
    "Jadon turrdi tu kardi ae kehar soniye,",
    "Lover tera main, bas tu meri jaan!",
  ],
  'Tauba Tauba': [
    "🕺 (Karan Aujla Dance Beat)",
    "Hussan tera lutt ke le gaya chain mera,",
    "Tere naal nachan da karda ae mann mera...",
    "Kardi ae nakhre te dindi ae smile,",
    "Vekh ke tainu saara club hoya wild!",
    "🔥 (Drop Climax)",
    "Tauba tauba tera nakhra kamal ae,",
    "Aujla vi kehnda kudi bemisaal ae!",
    "Lakk matkaave jadon floor utte aave,",
    "Saare mundeyan da bura haal ae!",
  ],
  'Brown Munde': [
    "🚗 (AP Dhillon Trap Intro)",
    "Desi jehe geet aa, trap jehi beat aa,",
    "Sirr kadd gajde, speakeraan ch heat aa!",
    "Gaddi kaali, sheeshe kaale, rim vi shokeen,",
    "Brown munde turrde ne jivein koi queen!",
    "🔥 (Chorus Drop)",
    "Brown munde, brown munde,",
    "Karde ne raaj, gaddiyan ch ghumde!",
    "Brown munde, brown munde,",
    "Kise to na dabde, shauq poore karde!",
  ],
  'Husn': [
    "🌧️ (Anuv Jain Acoustic Arpeggio)",
    "Dekho dekho kaisi baatein yahan ki,",
    "Baatein to ye jaise ho aasmaan ki...",
    "Kahin na kahin to hum milenge dobara,",
    "Chahe door ho kitna kinara.",
    "✨ (Soulful Crescendo)",
    "Husn tera jaise pehli dafa ho,",
    "Jitna bhi dekhun na dil ye bhara ho...",
    "Tu paas hai to har pal khumaar hai,",
    "Ye kaisa ajeeb sa aitbaar hai.",
  ],
  'Blinding Lights': [
    "⚡ (80s Analog Synth Riff)",
    "I've been on my own for long enough,",
    "Maybe you can show me how to love, maybe...",
    "I'm going through withdrawals, you don't even have to do too much,",
    "You can turn me on with just a touch, baby.",
    "✨ (Synth Drop)",
    "I said, ooh, I'm blinded by the lights!",
    "No, I can't sleep until I feel your touch.",
    "I said, ooh, I'm drowning in the night!",
    "Oh, when I'm like this, you're the one I trust.",
  ],
};

export const LyricsModal: React.FC = () => {
  const { currentSong, isLyricsOpen, toggleLyrics, currentTime, isPlaying } = useAudio();

  if (!isLyricsOpen || !currentSong) return null;

  // Flexible lookup by substring
  let songLyrics = DEFAULT_LYRICS[currentSong.title];
  if (!songLyrics) {
    const matchedKey = Object.keys(DEFAULT_LYRICS).find((key) =>
      currentSong.title.toLowerCase().includes(key.toLowerCase())
    );
    songLyrics = matchedKey ? DEFAULT_LYRICS[matchedKey] : DEFAULT_LYRICS.default;
  }

  const activeLineIndex = Math.min(
    Math.floor((currentTime / (currentSong.durationSec || 200)) * songLyrics.length),
    songLyrics.length - 1
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-fade-in">
      {/* Background ambient glowing aura */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="relative w-full max-w-2xl h-[85vh] glass-panel rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden bg-neutral-950/90">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-4">
            <img
              src={currentSong.coverUrl}
              alt={currentSong.title}
              className={`w-14 h-14 rounded-2xl object-cover border border-amber-500/30 shadow-lg ${isPlaying ? 'animate-pulse' : ''}`}
            />
            <div>
              <div className="flex items-center gap-2">
                <Mic2 className="w-4 h-4 text-amber-400" />
                <span className="text-xs uppercase tracking-widest text-amber-300 font-bold">Synchronized Lyrics</span>
              </div>
              <h3 className="text-lg font-bold text-white truncate max-w-sm">{currentSong.title}</h3>
              <p className="text-xs text-neutral-400">{currentSong.artist} • {currentSong.album || 'Single'}</p>
            </div>
          </div>

          <button
            onClick={toggleLyrics}
            className="p-2.5 rounded-full text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Karaoke Lyrics Container */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 text-center scrollbar-thin">
          <div className="py-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5" /> Real-time Vibe Karaoke Mode
            </span>
          </div>

          {songLyrics.map((line, idx) => {
            const isActive = idx === activeLineIndex;
            return (
              <p
                key={idx}
                className={`transition-all duration-500 leading-relaxed tracking-wide cursor-pointer ${
                  isActive
                    ? 'text-2xl lg:text-3xl font-extrabold text-amber-300 scale-105 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] bg-gradient-to-r from-amber-300 via-rose-300 to-amber-200 bg-clip-text text-transparent'
                    : Math.abs(idx - activeLineIndex) === 1
                    ? 'text-lg lg:text-xl font-medium text-neutral-300 opacity-70'
                    : 'text-base font-normal text-neutral-500 opacity-40 hover:opacity-70'
                }`}
              >
                {line}
              </p>
            );
          })}

          <div className="pt-8 pb-4 flex items-center justify-center gap-2 text-xs text-neutral-500">
            <Music className="w-4 h-4 text-amber-400 animate-spin-slow" />
            <span>Synced automatically with track audio frequency</span>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-4 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs text-neutral-400">
          <span>Track Duration: {Math.floor(currentSong.durationSec / 60)}:{(currentSong.durationSec % 60).toString().padStart(2, '0')}</span>
          <span className="text-amber-400/80 font-medium">Auralis Audio Studio</span>
        </div>
      </div>
    </div>
  );
};
