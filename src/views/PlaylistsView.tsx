import React, { useState, useEffect } from 'react';
import { Plus, Play, Trash2, ListMusic, Music, Disc } from 'lucide-react';
import { Playlist, Song } from '../types.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useAudio } from '../context/AudioContext.tsx';
import { SongCard } from '../components/SongCard.tsx';

export const PlaylistsView: React.FC = () => {
  const { currentUser } = useAuth();
  const { playSong } = useAudio();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);

  // New playlist modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const loadData = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const [pls, songs] = await Promise.all([
        api.getPlaylists(currentUser.id),
        api.getSongs(),
      ]);
      setPlaylists(pls);
      setAllSongs(songs);
      if (pls.length > 0 && !selectedPlaylist) {
        setSelectedPlaylist(pls[0]);
      } else if (selectedPlaylist) {
        const updated = pls.find(p => p.id === selectedPlaylist.id);
        setSelectedPlaylist(updated || pls[0] || null);
      }
    } catch (err) {
      console.error('Failed to load playlists:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newName.trim()) return;

    try {
      const pl = await api.createPlaylist(currentUser.id, newName.trim(), newDesc.trim());
      setPlaylists(prev => [...prev, pl]);
      setSelectedPlaylist(pl);
      setNewName('');
      setNewDesc('');
      setShowCreateModal(false);
    } catch (err) {
      console.error('Failed to create playlist:', err);
    }
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    if (!currentUser) return;
    try {
      await api.deletePlaylist(playlistId, currentUser.id);
      const remaining = playlists.filter(p => p.id !== playlistId);
      setPlaylists(remaining);
      setSelectedPlaylist(remaining[0] || null);
    } catch (err) {
      console.error('Failed to delete playlist:', err);
    }
  };

  const handleRemoveSongFromPlaylist = async (songId: string) => {
    if (!selectedPlaylist) return;
    try {
      await api.removeSongFromPlaylist(selectedPlaylist.id, songId);
      setSelectedPlaylist(prev =>
        prev ? { ...prev, song_ids: prev.song_ids.filter(id => id !== songId) } : null
      );
      setPlaylists(prev =>
        prev.map(p =>
          p.id === selectedPlaylist.id
            ? { ...p, song_ids: p.song_ids.filter(id => id !== songId) }
            : p
        )
      );
    } catch (err) {
      console.error('Failed to remove song from playlist:', err);
    }
  };

  const playlistSongs: Song[] = selectedPlaylist
    ? selectedPlaylist.song_ids
        .map(id => allSongs.find(s => s.id === id))
        .filter((s): s is Song => Boolean(s))
    : [];

  const handlePlayAll = () => {
    if (playlistSongs.length > 0) {
      playSong(playlistSongs[0], playlistSongs);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-zinc-500">
        Loading playlists...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Your Playlists</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Organize Bollywood and Hollywood favorites into custom collections
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-500 text-black rounded-lg hover:bg-emerald-400 transition-colors"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Create Playlist
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Playlists Sidebar */}
        <div className="md:col-span-1 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
            My Collections ({playlists.length})
          </p>

          {playlists.length === 0 ? (
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-dashed border-zinc-800 text-center">
              <ListMusic className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
              <p className="text-xs text-zinc-400">No playlists yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-2 text-xs text-emerald-400 hover:underline"
              >
                + Create one now
              </button>
            </div>
          ) : (
            playlists.map(pl => {
              const isSelected = selectedPlaylist?.id === pl.id;
              return (
                <button
                  key={pl.id}
                  onClick={() => setSelectedPlaylist(pl)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-colors ${
                    isSelected
                      ? 'bg-zinc-800 border-zinc-700 text-white shadow-sm'
                      : 'bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                  }`}
                >
                  <div className="truncate pr-2">
                    <p className="text-sm font-medium truncate">{pl.name}</p>
                    <p className="text-xs text-zinc-500">{pl.song_ids.length} songs</p>
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Selected Playlist Content */}
        <div className="md:col-span-3">
          {selectedPlaylist ? (
            <div className="space-y-6">
              {/* Playlist Header Banner */}
              <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-600 to-zinc-900 flex items-center justify-center text-white shrink-0 shadow-lg">
                    <Disc className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedPlaylist.name}</h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      {selectedPlaylist.description || 'Personal playlist collection'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                      <span>{playlistSongs.length} tracks</span>
                      <span aria-hidden="true">·</span>
                      <span>Created by {currentUser?.name}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handlePlayAll}
                    disabled={playlistSongs.length === 0}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-emerald-500 text-black rounded-lg hover:bg-emerald-400 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Play Playlist
                  </button>

                  <button
                    onClick={() => handleDeletePlaylist(selectedPlaylist.id)}
                    className="p-2 text-zinc-400 hover:text-rose-400 rounded-lg hover:bg-zinc-800 transition-colors"
                    title="Delete playlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Playlist Song List */}
              {playlistSongs.length === 0 ? (
                <div className="py-16 text-center rounded-xl bg-zinc-900/30 border border-dashed border-zinc-800">
                  <Music className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-zinc-300">This playlist is empty</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Browse songs in Discover or Search and click "+ Add to Playlist" to populate it.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {playlistSongs.map((song, idx) => (
                    <div
                      key={song.id}
                      className="group flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60 hover:bg-zinc-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-mono text-zinc-500 w-5 text-right">
                          {idx + 1}
                        </span>

                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-950 shrink-0">
                          {song.cover_image && (
                            <img
                              src={song.cover_image}
                              alt={song.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-zinc-100 truncate">
                            {song.title}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-zinc-400 truncate">
                            <span>{song.artist}</span>
                            <span aria-hidden="true">·</span>
                            <span className="text-zinc-500">{song.category}</span>
                            <span aria-hidden="true">·</span>
                            <span className="text-zinc-500">{song.genre}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => playSong(song, playlistSongs)}
                          className="p-2 text-zinc-400 hover:text-emerald-400 transition-colors"
                          title="Play track"
                        >
                          <Play className="w-4 h-4 fill-current" />
                        </button>

                        <button
                          onClick={() => handleRemoveSongFromPlaylist(song.id)}
                          className="p-2 text-zinc-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove from playlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="py-20 text-center text-zinc-500">
              Select or create a playlist on the left.
            </div>
          )}
        </div>
      </div>

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-white mb-4">Create New Playlist</h3>
            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Playlist Name</label>
                <input
                  type="text"
                  placeholder="e.g. Late Night Bollywood Acoustic"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Description (optional)
                </label>
                <textarea
                  placeholder="Brief notes about this collection..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={!newName.trim()}
                  className="flex-1 py-2 px-4 text-xs font-semibold bg-emerald-500 text-black rounded-lg hover:bg-emerald-400 disabled:opacity-50 transition-colors"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="py-2 px-4 text-xs text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
