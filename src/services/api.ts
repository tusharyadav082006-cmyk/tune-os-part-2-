import {
  Song,
  User,
  Playlist,
  HistoryItem,
  RecommendationsResponse,
  SearchRecommendationsResponse,
  SchedulingResult,
  ProcessJob,
} from '../types.ts';

const BASE_URL = '/api';

export const api = {
  // Authentication
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${BASE_URL}/auth/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  async login(username: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },

  async register(data: Partial<User>): Promise<{ user: User; token: string }> {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Registration failed');
    return res.json();
  },

  // Songs
  async getSongs(params?: {
    category?: string;
    genre?: string;
    language?: string;
    search?: string;
    sort?: string;
  }): Promise<Song[]> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.genre) query.set('genre', params.genre);
    if (params?.language) query.set('language', params.language);
    if (params?.search) query.set('search', params.search);
    if (params?.sort) query.set('sort', params.sort);

    const res = await fetch(`${BASE_URL}/songs?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch songs');
    return res.json();
  },

  async getSongById(id: string): Promise<Song> {
    const res = await fetch(`${BASE_URL}/songs/${id}`);
    if (!res.ok) throw new Error('Song not found');
    return res.json();
  },

  async uploadSong(formData: FormData): Promise<Song> {
    const res = await fetch(`${BASE_URL}/songs/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(err.error || 'Failed to upload song');
    }
    return res.json();
  },

  // Interactions
  async toggleLike(songId: string, userId: string): Promise<{ liked: boolean; totalLikes: number }> {
    const res = await fetch(`${BASE_URL}/songs/${songId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error('Failed to toggle like');
    return res.json();
  },

  async rateSong(
    songId: string,
    userId: string,
    rating: number
  ): Promise<{ userRating: number; avgRating: number; ratingsCount: number }> {
    const res = await fetch(`${BASE_URL}/songs/${songId}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, rating }),
    });
    if (!res.ok) throw new Error('Failed to rate song');
    return res.json();
  },

  async recordPlay(songId: string, userId: string, durationPlayed: number = 10): Promise<void> {
    await fetch(`${BASE_URL}/songs/${songId}/play`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, durationPlayed }),
    });
  },

  // Recommendations
  async getRecommendations(userId: string): Promise<RecommendationsResponse> {
    const res = await fetch(`${BASE_URL}/recommendations?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch recommendations');
    return res.json();
  },

  async getSearchRecommendations(query: string, userId?: string): Promise<SearchRecommendationsResponse> {
    const res = await fetch(`${BASE_URL}/search/recommendations?q=${encodeURIComponent(query)}&userId=${userId || ''}`);
    if (!res.ok) throw new Error('Failed to fetch search recommendations');
    return res.json();
  },

  // History & Likes
  async getHistory(userId: string): Promise<HistoryItem[]> {
    const res = await fetch(`${BASE_URL}/history?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch history');
    return res.json();
  },

  async clearHistory(userId: string): Promise<void> {
    await fetch(`${BASE_URL}/history?userId=${userId}`, { method: 'DELETE' });
  },

  async getLikedSongs(userId: string): Promise<Song[]> {
    const res = await fetch(`${BASE_URL}/likes?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch liked songs');
    return res.json();
  },

  async getUserRatings(userId: string): Promise<Record<string, number>> {
    const res = await fetch(`${BASE_URL}/ratings?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch user ratings');
    return res.json();
  },

  // Playlists
  async getPlaylists(userId: string): Promise<Playlist[]> {
    const res = await fetch(`${BASE_URL}/playlists?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch playlists');
    return res.json();
  },

  async createPlaylist(userId: string, name: string, description?: string): Promise<Playlist> {
    const res = await fetch(`${BASE_URL}/playlists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, name, description }),
    });
    if (!res.ok) throw new Error('Failed to create playlist');
    return res.json();
  },

  async addSongToPlaylist(playlistId: string, songId: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/playlists/${playlistId}/songs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songId }),
    });
    if (!res.ok) throw new Error('Failed to add song to playlist');
  },

  async removeSongFromPlaylist(playlistId: string, songId: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/playlists/${playlistId}/songs/${songId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to remove song from playlist');
  },

  async deletePlaylist(playlistId: string, userId: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/playlists/${playlistId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error('Failed to delete playlist');
  },

  // OS Simulation
  async simulateOS(
    algorithm: 'FCFS' | 'SJF' | 'Priority' | 'RoundRobin',
    jobs: ProcessJob[],
    quantum: number = 2
  ): Promise<SchedulingResult> {
    const res = await fetch(`${BASE_URL}/os/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ algorithm, jobs, quantum }),
    });
    if (!res.ok) throw new Error('Failed to run OS simulation');
    return res.json();
  },

  // Admin
  async getAdminStats(): Promise<{
    totalSongs: number;
    totalUsers: number;
    totalPlays: number;
    totalLikes: number;
    totalPlaylists: number;
    systemUptime: number;
    nodeVersion: string;
  }> {
    const res = await fetch(`${BASE_URL}/admin/stats`);
    if (!res.ok) throw new Error('Failed to fetch admin stats');
    return res.json();
  },

  async deleteSong(songId: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/admin/songs/${songId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete song');
  },
};
