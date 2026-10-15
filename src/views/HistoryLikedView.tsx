import React, { useState, useEffect } from 'react';
import { Heart, History, Trash2, Play, Music, Sparkles } from 'lucide-react';
import { Song, HistoryItem } from '../types.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useAudio } from '../context/AudioContext.tsx';
import { SongCard } from '../components/SongCard.tsx';

export const HistoryLikedView: React.FC = () => {
  const { currentUser } = useAuth();
  const { playSong } = useAudio();
  const [activeTab, setActiveTab] = useState<'liked' | 'history'>('liked');
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const [liked, hist] = await Promise.all([
        api.getLikedSongs(currentUser.id),
        api.getHistory(currentUser.id),
      ]);
      setLikedSongs(liked);
      setHistoryItems(hist);
    } catch (err) {
      console.error('Failed to load liked and history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleClearHistory = async () => {
    if (!currentUser) return;
    try {
      await api.clearHistory(currentUser.id);
      setHistoryItems([]);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-zinc-500">
        Loading user records...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header and Tab Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Your Music Library</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Tracks you've loved and recent listening events powering your recommendation feed
          </p>
        </div>

        {/* Segmented Tab Controls */}
        <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-lg self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('liked')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'liked'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            Liked Songs ({likedSongs.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'history'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Listening History ({historyItems.length})
          </button>
        </div>
      </div>

      {/* Liked Songs View */}
      {activeTab === 'liked' && (
        <section className="space-y-4">
          {likedSongs.length === 0 ? (
            <div className="py-20 text-center rounded-xl bg-zinc-900/30 border border-dashed border-zinc-800">
              <Heart className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-zinc-300">No liked songs yet</p>
              <p className="text-xs text-zinc-500 mt-1">
                Click the heart on any song card or player to save your favorites here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {likedSongs.map(song => (
                <SongCard
                  key={song.id}
                  song={song}
                  queueContext={likedSongs}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Listening History View */}
      {activeTab === 'history' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span>Events logged after 10s of continuous playback</span>
            </div>

            {historyItems.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg border border-rose-900/50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear My History
              </button>
            )}
          </div>

          {historyItems.length === 0 ? (
            <div className="py-20 text-center rounded-xl bg-zinc-900/30 border border-dashed border-zinc-800">
              <History className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-zinc-300">No listening history recorded</p>
              <p className="text-xs text-zinc-500 mt-1">
                Play any track for over 10 seconds to automatically record listening events.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/80 rounded-xl bg-zinc-900/40 border border-zinc-800 overflow-hidden">
              {historyItems.map((item, idx) => (
                <div
                  key={item.record.id || idx}
                  className="flex items-center justify-between p-3.5 hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="text-xs font-mono text-zinc-500 w-6 text-right">
                      {idx + 1}
                    </span>

                    <div className="w-11 h-11 rounded-lg overflow-hidden bg-zinc-950 shrink-0 border border-zinc-800">
                      {item.song?.cover_image ? (
                        <img
                          src={item.song.cover_image}
                          alt={item.song.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600">
                          <Music className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-100 truncate">
                        {item.song?.title || 'Unknown Song'}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 truncate">
                        <span>{item.song?.artist}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-zinc-500">{item.song?.genre}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-zinc-500">{item.song?.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-xs font-mono tabular-nums text-zinc-500 hidden sm:inline">
                      {new Date(item.record.listened_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    {item.song && (
                      <button
                        onClick={() => playSong(item.song)}
                        className="p-2 text-zinc-300 hover:text-emerald-400 rounded-lg hover:bg-zinc-800 transition-colors"
                        title="Replay song"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
