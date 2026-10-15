import React, { useState } from 'react';
import { Radio, Upload, User as UserIcon, Shield, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenUpload: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, onOpenUpload }) => {
  const { currentUser, allUsers, switchUser } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-6 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element, 1 line) */}
        <button
          onClick={() => onSelectTab('discover')}
          className="flex items-center gap-2.5 text-left focus:outline-none group shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
            <Radio className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
            Tune<span className="text-emerald-400">OS</span>
          </span>
        </button>

        {/* Zone 2: 4-5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <button
            onClick={() => onSelectTab('discover')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentTab === 'discover'
                ? 'text-emerald-400 font-semibold'
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            Discover
          </button>

          <button
            onClick={() => onSelectTab('search')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentTab === 'search'
                ? 'text-emerald-400 font-semibold'
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            Search & Filter
          </button>

          <button
            onClick={() => onSelectTab('playlists')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentTab === 'playlists'
                ? 'text-emerald-400 font-semibold'
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            Playlists
          </button>

          <button
            onClick={() => onSelectTab('history')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentTab === 'history'
                ? 'text-emerald-400 font-semibold'
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            History & Likes
          </button>

          <button
            onClick={() => onSelectTab('os-lab')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentTab === 'os-lab'
                ? 'text-emerald-400 font-semibold'
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            OS Lab
          </button>

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => onSelectTab('admin')}
              className={`whitespace-nowrap shrink-0 flex items-center gap-1 transition-colors ${
                currentTab === 'admin'
                  ? 'text-emerald-400 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Admin
            </button>
          )}
        </nav>

        {/* Zone 3: 1 Primary Action Area (Upload CTA & User Selector) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-emerald-500 text-black rounded-lg hover:bg-emerald-400 transition-colors whitespace-nowrap shadow-sm shadow-emerald-500/20"
          >
            <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
            Upload Song
          </button>

          {/* User Profile / Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(prev => !prev)}
              className="flex items-center gap-2 p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 transition-colors"
              title="Switch user account"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400 font-semibold text-[10px]">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <span className="hidden sm:inline font-medium max-w-[100px] truncate">
                {currentUser?.name || 'Account'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl p-2 z-50">
                <div className="px-3 py-2 border-b border-zinc-800/80 mb-1">
                  <p className="text-xs font-semibold text-white">{currentUser?.name}</p>
                  <p className="text-[11px] text-zinc-400 truncate">{currentUser?.email}</p>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                    <span>Role: {currentUser?.role}</span>
                    <span aria-hidden="true">·</span>
                    <span>Fav: {currentUser?.preferred_category}</span>
                  </div>
                </div>

                <div className="py-1">
                  <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    Switch Persona (Test Recommendations)
                  </p>
                  {allUsers.map(user => (
                    <button
                      key={user.id}
                      onClick={() => {
                        switchUser(user.id);
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left text-xs transition-colors ${
                        user.id === currentUser?.id
                          ? 'bg-zinc-800 text-emerald-400 font-medium'
                          : 'text-zinc-300 hover:bg-zinc-800/60'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <p className="truncate">{user.name}</p>
                        <p className="text-[10px] text-zinc-500 truncate">
                          {user.preferred_category} · {user.role}
                        </p>
                      </div>
                      {user.id === currentUser?.id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="pt-1 mt-1 border-t border-zinc-800">
                  <button
                    onClick={() => {
                      onSelectTab('profile');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    Full Profile & Preferences
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
