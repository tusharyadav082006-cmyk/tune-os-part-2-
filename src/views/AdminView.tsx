import React, { useState, useEffect } from 'react';
import { Shield, Trash2, Database, Users, Play, Heart, Disc, Music, AlertTriangle } from 'lucide-react';
import { api } from '../services/api.ts';
import { Song } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';

export const AdminView: React.FC = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [st, songList] = await Promise.all([
        api.getAdminStats(),
        api.getSongs(),
      ]);
      setStats(st);
      setSongs(songList);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleDeleteSong = async (songId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to moderate and remove "${title}" from MySQL?`)) {
      return;
    }
    try {
      await api.deleteSong(songId);
      setSongs(prev => prev.filter(s => s.id !== songId));
      if (stats) {
        setStats({ ...stats, totalSongs: stats.totalSongs - 1 });
      }
    } catch (err) {
      console.error('Failed to delete song:', err);
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-3">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
        <h2 className="text-base font-semibold text-white">Administrator Privileges Required</h2>
        <p className="text-xs text-zinc-400">
          Switch to the "Tushar Yadav (Admin)" account using the user switcher in the top right corner to access this dashboard.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-zinc-500">
        Loading admin telemetry...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
          <Shield className="w-4 h-4" />
          <span>System Administration & MySQL Engine</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          TuneOS Moderator Dashboard
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Moderate uploaded songs, track global play frequencies, and inspect system telemetry
        </p>
      </div>

      {/* Telemetry Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <span className="text-xs text-zinc-400 flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-emerald-400" />
              Total Songs in Library
            </span>
            <p className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
              {stats.totalSongs}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <span className="text-xs text-zinc-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              Registered Users
            </span>
            <p className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
              {stats.totalUsers}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <span className="text-xs text-zinc-400 flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-amber-400" />
              Total Play Count
            </span>
            <p className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
              {stats.totalPlays}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <span className="text-xs text-zinc-400 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              Total Song Likes
            </span>
            <p className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
              {stats.totalLikes}
            </p>
          </div>
        </div>
      )}

      {/* Library Moderation Table */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-white">Song Library Moderation</h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="px-4 py-3">Song</th>
                  <th className="px-4 py-3">Artist</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Genre</th>
                  <th className="px-4 py-3 font-mono">Plays</th>
                  <th className="px-4 py-3 font-mono">Likes</th>
                  <th className="px-4 py-3 font-mono">Rating</th>
                  <th className="px-4 py-3">Uploader</th>
                  <th className="px-4 py-3 text-right">Moderate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {songs.map(song => (
                  <tr key={song.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{song.title}</td>
                    <td className="px-4 py-3 text-zinc-300">{song.artist}</td>
                    <td className="px-4 py-3 text-zinc-400">{song.category}</td>
                    <td className="px-4 py-3 text-zinc-400">{song.genre}</td>
                    <td className="px-4 py-3 font-mono tabular-nums text-zinc-300">{song.play_count}</td>
                    <td className="px-4 py-3 font-mono tabular-nums text-rose-400">{song.likes_count}</td>
                    <td className="px-4 py-3 font-mono tabular-nums text-amber-400">
                      ★ {song.avg_rating.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{song.uploaded_by}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteSong(song.id, song.title)}
                        className="px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 rounded-md border border-rose-900/60 transition-colors"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
