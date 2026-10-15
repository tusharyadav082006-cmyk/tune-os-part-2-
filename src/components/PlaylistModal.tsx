import React, { useState, useEffect } from 'react';
import { Plus, Check, Music2, X } from 'lucide-react';
import { Song, Playlist } from '../types.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface PlaylistModalProps {
  song: Song | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PlaylistModal: React.FC<PlaylistModalProps> = ({ song, isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [addedPlaylists, setAddedPlaylists] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser) {
      loadPlaylists();
    }
  }, [isOpen, currentUser]);

  const loadPlaylists = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const list = await api.getPlaylists(currentUser.id);
      setPlaylists(list);
      if (song) {
        const containing = new Set<string>();
        for (const p of list) {
          if (p.song_ids.includes(song.id)) {
            containing.add(p.id);
          }
        }
        setAddedPlaylists(containing);
      }
    } catch (err) {
      console.error('Failed to load playlists:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSong = async (playlistId: string) => {
    if (!song) return;
    const isAdded = addedPlaylists.has(playlistId);
    try {
      if (isAdded) {
        await api.removeSongFromPlaylist(playlistId, song.id);
        setAddedPlaylists(prev => {
          const next = new Set(prev);
          next.delete(playlistId);
          return next;
        });
      } else {
        await api.addSongToPlaylist(playlistId, song.id);
        setAddedPlaylists(prev => {
          const next = new Set(prev);
          next.add(playlistId);
          return next;
        });
      }
    } catch (err) {
      console.error('Failed to update playlist song:', err);
    }
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newPlaylistName.trim()) return;

    try {
      const pl = await api.createPlaylist(currentUser.id, newPlaylistName.trim(), newPlaylistDesc.trim());
      if (song) {
        await api.addSongToPlaylist(pl.id, song.id);
        setAddedPlaylists(prev => new Set(prev).add(pl.id));
      }
      setPlaylists(prev => [...prev, pl]);
      setNewPlaylistName('');
      setNewPlaylistDesc('');
      setIsCreating(false);
    } catch (err) {
      console.error('Failed to create playlist:', err);
    }
  };

  if (!isOpen || !song) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <h3 className="text-base font-semibold text-white">Add to Playlist</h3>
            <p className="text-xs text-zinc-400 mt-0.5 truncate max-w-xs">
              {song.title} · {song.artist}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-2 max-h-60 overflow-y-auto">
          {loading ? (
            <p className="text-xs text-zinc-500 text-center py-4">Loading playlists...</p>
          ) : playlists.length === 0 && !isCreating ? (
            <div className="text-center py-6">
              <Music2 className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm text-zinc-400">No playlists yet</p>
              <p className="text-xs text-zinc-500 mt-0.5">Create your first playlist below</p>
            </div>
          ) : (
            playlists.map(pl => {
              const inPlaylist = addedPlaylists.has(pl.id);
              return (
                <button
                  key={pl.id}
                  type="button"
                  onClick={() => handleToggleSong(pl.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-colors ${
                    inPlaylist
                      ? 'bg-emerald-950/40 border-emerald-800/60 text-white'
                      : 'bg-zinc-950/50 border-zinc-800 text-zinc-300 hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="truncate pr-2">
                    <p className="text-sm font-medium">{pl.name}</p>
                    <p className="text-xs text-zinc-500">{pl.song_ids.length} songs</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                      inPlaylist ? 'bg-emerald-500 text-black' : 'border border-zinc-700'
                    }`}
                  >
                    {inPlaylist && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {isCreating ? (
          <form onSubmit={handleCreateNew} className="pt-3 border-t border-zinc-800 space-y-3">
            <input
              type="text"
              placeholder="Playlist name..."
              value={newPlaylistName}
              onChange={e => setNewPlaylistName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              autoFocus
            />
            <input
              type="text"
              placeholder="Description (optional)..."
              value={newPlaylistDesc}
              onChange={e => setNewPlaylistDesc(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-300 focus:outline-none focus:border-emerald-500"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!newPlaylistName.trim()}
                className="flex-1 px-4 py-2 text-xs font-semibold bg-emerald-500 text-black rounded-lg hover:bg-emerald-400 disabled:opacity-50 transition-colors"
              >
                Create & Add
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-2 text-xs text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="pt-3 border-t border-zinc-800">
            <button
              onClick={() => setIsCreating(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white transition-colors"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              New Playlist
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
