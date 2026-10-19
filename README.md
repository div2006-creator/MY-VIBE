# VIBE 🎵✨

> **“Every song has a story. Turn your memories into soundtracks.”**

VIBE is a modern music and memory journaling platform. Unlike traditional streaming services, VIBE connects music with your personal memories, journeys, places, people, dates, photos, moods, and stories.

---

## 🌟 Concept

A user can create a **“Vibe”** around a memory such as:
* 🎓 *College Trip* (Delhi · August 2026)
* 🌙 *Late Night Coding* (Meerut · August 2026)
* 🎒 *First Day at College* (Campus Lawn · July 2026)
* 🌧️ *Monsoon Drive* (Western Ghats · July 2026)
* ☀️ *Sunset Beach Bonfire* (Goa · May 2026)

When opening any Vibe, users can hit **▶ RELIVE VIBE** to experience full-screen cinematic playback with dynamic ambient visualizers, rotating vinyl animations, and their personal journal entries.

---

## 🚀 Key Features

* **Landing Page**: Immersive introduction communicating the unique memory soundtrack concept.
* **Home Dashboard**: Recently opened Vibes, recently played tracks, timeline highlights, and memory revivals.
* **Music Timeline (`/my-vibes`)**: Chronological memory journal grouped by Year and Month.
* **Create Vibe**: Rich form with mood pickers, location pins, dates, memory stories, cover art picker, and soundtrack song selection.
* **Vibe Detail & Relive Mode**: Header with story quote cards, full tracklist, song management, and full-screen Relive experience.
* **Persistent Bottom Music Player**: Play/Pause, scrubber, skip next/previous, volume & mute, shuffle, repeat, and queue drawer.
* **Explore**: Curated discovery of experience collections (Trending, Late Night, Road Trips, College, Rainy Days, Summer).
* **Search**: Instant multi-entity search across Songs, Artists, Albums, and Vibes.
* **User Profile**: Personal stats, favorite mood, top memory artists, and profile editing.
* **Authentication UI**: Login, Registration, and Instant Demo login.

---

## 🛠️ Tech Stack

### Frontend
* **React 18** + **TypeScript**
* **Vite**
* **Tailwind CSS**
* **React Router v7**
* **Lucide React** (icons)
* **Canvas Confetti**

### Backend
* **Node.js** + **Express.js** + **TypeScript**
* **Prisma ORM** with **SQLite**
* **JWT** authentication & **Bcrypt** password hashing
* Full REST API for auth, vibes, songs, search, and profile

---

## 🏃 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher)
* `npm`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/div2006-creator/MY-VIBE.git
   cd MY-VIBE
   ```

2. **Install server dependencies:**
   ```bash
   cd server
   npm install
   npx prisma db push
   npm run seed
   cd ..
   ```

3. **Install client dependencies:**
   ```bash
   cd client
   npm install
   cd ..
   ```

### Running the App

You can start both server and client together from the root directory:
```bash
npm run dev
```

Or run them individually:
* **Backend API Server**:
  ```bash
  npm run dev:server
  ```
  *(Runs on http://localhost:5000)*

* **Frontend Client**:
  ```bash
  npm run dev:client
  ```
  *(Runs on http://localhost:5173)*

---

## 📄 License
MIT License
