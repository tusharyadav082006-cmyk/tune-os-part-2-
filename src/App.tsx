import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext.tsx';
import { AudioProvider } from './context/AudioContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { AudioPlayer } from './components/AudioPlayer.tsx';
import { HomeView } from './views/HomeView.tsx';
import { SearchView } from './views/SearchView.tsx';
import { PlaylistsView } from './views/PlaylistsView.tsx';
import { HistoryLikedView } from './views/HistoryLikedView.tsx';
import { OSSimulationView } from './views/OSSimulationView.tsx';
import { UploadView } from './views/UploadView.tsx';
import { AdminView } from './views/AdminView.tsx';
import { ProfileView } from './views/ProfileView.tsx';
import { Song } from './types.ts';

function AppContent() {
  const [currentTab, setCurrentTab] = useState<string>('discover');

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Top Bar Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenUpload={() => setCurrentTab('upload')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'discover' && (
          <HomeView onNavigateToSearch={() => setCurrentTab('search')} />
        )}

        {currentTab === 'search' && <SearchView />}

        {currentTab === 'playlists' && <PlaylistsView />}

        {currentTab === 'history' && <HistoryLikedView />}

        {currentTab === 'os-lab' && <OSSimulationView />}

        {currentTab === 'upload' && (
          <UploadView
            onSuccess={(_song: Song) => setCurrentTab('discover')}
            onCancel={() => setCurrentTab('discover')}
          />
        )}

        {currentTab === 'admin' && <AdminView />}

        {currentTab === 'profile' && <ProfileView />}
      </main>

      {/* Persistent Audio Player Dock */}
      <AudioPlayer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AudioProvider>
        <AppContent />
      </AudioProvider>
    </AuthProvider>
  );
}
