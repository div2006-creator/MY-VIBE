import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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

// Music App Pages
import { ArtistsPage } from './pages/ArtistsPage';
import { ArtistDetailPage } from './pages/ArtistDetailPage';
import { AlbumDetailPage } from './pages/AlbumDetailPage';
import { GenresRadioPage } from './pages/GenresRadioPage';
import { LiveLoungePage } from './pages/LiveLoungePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { PlaylistsPage } from './pages/PlaylistsPage';

// Higher-order Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0a0e] text-white flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <img src="/vibe-logo.png" alt="VIBE" className="w-16 h-16 rounded-2xl animate-pulse" />
          <div className="absolute inset-0 rounded-2xl border-2 border-amber-500/40 animate-ping pointer-events-none" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-widest">
            Verifying Master Credentials...
          </h2>
          <p className="text-xs text-neutral-500">Connecting to secure VIBE server</p>
        </div>
      </div>
    );
  }

  // Strictly block access if not logged in
  if (!token || !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

function AppContent() {
  const { user, token, isLoading } = useAuth();
  const isAuthenticated = !isLoading && !!token && !!user;

  return (
    <div className="min-h-screen bg-[#0b0a0e] text-neutral-100 flex flex-col font-sans selection:bg-amber-500 selection:text-neutral-950">
      {/* Navigation bar: Only accessible after authentication */}
      {isAuthenticated && <Navbar />}

      <main className="flex-1">
        <Routes>
          {/* Public Auth Route */}
          <Route
            path="/auth"
            element={isAuthenticated ? <Navigate to="/home" replace /> : <AuthPage />}
          />

          {/* Strictly Protected Dashboard & Music Pages */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/artists"
            element={
              <ProtectedRoute>
                <ArtistsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/explore"
            element={
              <ProtectedRoute>
                <ExplorePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/genres"
            element={
              <ProtectedRoute>
                <GenresRadioPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/playlists"
            element={
              <ProtectedRoute>
                <PlaylistsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/live"
            element={
              <ProtectedRoute>
                <LiveLoungePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/artist/:id"
            element={
              <ProtectedRoute>
                <ArtistDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/album/:id"
            element={
              <ProtectedRoute>
                <AlbumDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-vibes"
            element={
              <ProtectedRoute>
                <VibesTimelinePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-vibe"
            element={
              <ProtectedRoute>
                <CreateVibePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vibe/:id"
            element={
              <ProtectedRoute>
                <VibeDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/liked-songs"
            element={
              <ProtectedRoute>
                <LikedSongsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <SearchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Catch-All Unknown Routes: Redirect to home if logged in, else auth */}
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? '/home' : '/auth'} replace />}
          />
        </Routes>
      </main>

      {/* Music Player & Relive Modal: Only active when authenticated */}
      {isAuthenticated && <Player />}
      {isAuthenticated && <ReliveModal />}
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AudioProvider>
        <Router>
          <AppContent />
        </Router>
      </AudioProvider>
    </AuthProvider>
  );
}

export default App;
