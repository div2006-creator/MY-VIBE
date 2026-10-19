import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AudioProvider } from './context/AudioContext';
import { Navbar } from './components/Navbar';
import { Player } from './components/Player';
import { ReliveModal } from './components/ReliveModal';

import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { VibesTimelinePage } from './pages/VibesTimelinePage';
import { CreateVibePage } from './pages/CreateVibePage';
import { VibeDetailPage } from './pages/VibeDetailPage';
import { LikedSongsPage } from './pages/LikedSongsPage';
import { SearchPage } from './pages/SearchPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthPage } from './pages/AuthPage';

// New Music App Pages
import { ArtistsPage } from './pages/ArtistsPage';
import { ArtistDetailPage } from './pages/ArtistDetailPage';
import { AlbumDetailPage } from './pages/AlbumDetailPage';
import { GenresRadioPage } from './pages/GenresRadioPage';
import { LiveLoungePage } from './pages/LiveLoungePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { PlaylistsPage } from './pages/PlaylistsPage';

export function App() {
  return (
    <AuthProvider>
      <AudioProvider>
        <Router>
          <div className="min-h-screen bg-[#0b0a0e] text-neutral-100 flex flex-col font-sans selection:bg-amber-500 selection:text-neutral-950">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/artists" element={<ArtistsPage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/genres" element={<GenresRadioPage />} />
                <Route path="/playlists" element={<PlaylistsPage />} />
                <Route path="/live" element={<LiveLoungePage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/artist/:id" element={<ArtistDetailPage />} />
                <Route path="/album/:id" element={<AlbumDetailPage />} />
                <Route path="/my-vibes" element={<VibesTimelinePage />} />
                <Route path="/create-vibe" element={<CreateVibePage />} />
                <Route path="/vibe/:id" element={<VibeDetailPage />} />
                <Route path="/liked-songs" element={<LikedSongsPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/auth" element={<AuthPage />} />
              </Routes>
            </main>
            <Player />
            <ReliveModal />
          </div>
        </Router>
      </AudioProvider>
    </AuthProvider>
  );
}

export default App;
