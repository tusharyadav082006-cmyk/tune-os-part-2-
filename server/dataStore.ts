export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  language: string;
  category: 'Bollywood' | 'Hollywood';
  release_year: number;
  file_path: string;
  cover_image: string;
  uploaded_by: string;
  play_count: number;
  likes_count: number;
  avg_rating: number;
  ratings_count: number;
  duration: number; // in seconds
  created_at: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  favorite_genres: string[];
  preferred_category: 'Bollywood' | 'Hollywood' | 'All';
}

export interface LikeRecord {
  user_id: string;
  song_id: string;
  created_at: string;
}

export interface RatingRecord {
  user_id: string;
  song_id: string;
  rating: number; // 1 to 5
  created_at: string;
}

export interface HistoryRecord {
  id: string;
  user_id: string;
  song_id: string;
  listened_at: string;
  duration_played: number;
}

export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  description: string;
  created_at: string;
  song_ids: string[];
}

export interface ProcessJob {
  pid: string;
  process_name: string;
  arrival_time: number;
  burst_time: number;
  priority: number; // 1 = highest
}

export interface ProcessResult extends ProcessJob {
  start_time: number;
  completion_time: number;
  turnaround_time: number;
  waiting_time: number;
}

export interface GanttBlock {
  pid: string;
  process_name: string;
  start_time: number;
  end_time: number;
}

export interface SchedulingResult {
  algorithm: string;
  timeline: GanttBlock[];
  processes: ProcessResult[];
  avg_waiting_time: number;
  avg_turnaround_time: number;
  cpu_utilization: number;
  throughput: number;
}

// Initial seed songs (combining Bollywood and Hollywood)
const INITIAL_SONGS: Song[] = [
  {
    id: 's1',
    title: 'Tum Hi Ho (Acoustic Reverie)',
    artist: 'Arijit Vibes',
    album: 'Aashiqui Reflections',
    genre: 'Romantic',
    language: 'Hindi',
    category: 'Bollywood',
    release_year: 2021,
    file_path: '/audio/tum_hi_ho.wav',
    cover_image: '/src/assets/images/bollywood_album_cover_1792096216586.jpg',
    uploaded_by: 'rahul_admin',
    play_count: 1420,
    likes_count: 320,
    avg_rating: 4.8,
    ratings_count: 95,
    duration: 180,
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 's2',
    title: 'Kesariya Dil',
    artist: 'Pritam Melodies',
    album: 'Brahmastra Echoes',
    genre: 'Romantic',
    language: 'Hindi',
    category: 'Bollywood',
    release_year: 2022,
    file_path: '/audio/kesariya_dil.wav',
    cover_image: '/src/assets/images/bollywood_album_cover_1792096216586.jpg',
    uploaded_by: 'rahul_admin',
    play_count: 1890,
    likes_count: 410,
    avg_rating: 4.9,
    ratings_count: 112,
    duration: 195,
    created_at: '2024-02-10T12:00:00Z',
  },
  {
    id: 's3',
    title: 'Desi Beat Explosion',
    artist: 'DJ Badshah',
    album: 'Club Punjabi Heat',
    genre: 'Dance',
    language: 'Punjabi',
    category: 'Bollywood',
    release_year: 2023,
    file_path: '/audio/desi_beat.wav',
    cover_image: '/src/assets/images/tuneos_hero_banner_1792096216255.jpg',
    uploaded_by: 'user_tushar',
    play_count: 980,
    likes_count: 215,
    avg_rating: 4.4,
    ratings_count: 64,
    duration: 165,
    created_at: '2024-03-01T15:00:00Z',
  },
  {
    id: 's4',
    title: 'Chaiyya Chords (Sufi Raga)',
    artist: 'AR Rahman Tribute',
    album: 'Dil Se Spirituals',
    genre: 'Folk',
    language: 'Hindi',
    category: 'Bollywood',
    release_year: 2020,
    file_path: '/audio/chaiyya_chords.wav',
    cover_image: '/src/assets/images/classical_album_cover_1792096215941.jpg',
    uploaded_by: 'user_tushar',
    play_count: 1250,
    likes_count: 280,
    avg_rating: 4.7,
    ratings_count: 82,
    duration: 210,
    created_at: '2024-01-20T08:00:00Z',
  },
  {
    id: 's5',
    title: 'Kabira Acoustic Strings',
    artist: 'Tochi & Rekha Ensemble',
    album: 'Yeh Jawaani Acoustics',
    genre: 'Folk',
    language: 'Hindi',
    category: 'Bollywood',
    release_year: 2019,
    file_path: '/audio/kabira_strings.wav',
    cover_image: '/src/assets/images/classical_album_cover_1792096215941.jpg',
    uploaded_by: 'rahul_admin',
    play_count: 890,
    likes_count: 190,
    avg_rating: 4.6,
    ratings_count: 55,
    duration: 190,
    created_at: '2024-02-18T11:00:00Z',
  },
  {
    id: 's6',
    title: 'Midnight City Lights',
    artist: 'The Weeknd Style',
    album: 'After Dark Mirage',
    genre: 'Synthwave',
    language: 'English',
    category: 'Hollywood',
    release_year: 2023,
    file_path: '/audio/midnight_city.wav',
    cover_image: '/src/assets/images/hollywood_album_cover_1792096216486.jpg',
    uploaded_by: 'user_sophia',
    play_count: 2100,
    likes_count: 520,
    avg_rating: 4.9,
    ratings_count: 140,
    duration: 175,
    created_at: '2024-01-05T09:00:00Z',
  },
  {
    id: 's7',
    title: 'Golden Hour Glow',
    artist: 'JVKE Style',
    album: 'Celestial Reveries',
    genre: 'Pop',
    language: 'English',
    category: 'Hollywood',
    release_year: 2022,
    file_path: '/audio/golden_hour.wav',
    cover_image: '/src/assets/images/bollywood_album_cover_1792096216586.jpg',
    uploaded_by: 'user_sophia',
    play_count: 1650,
    likes_count: 390,
    avg_rating: 4.8,
    ratings_count: 98,
    duration: 195,
    created_at: '2024-02-14T14:00:00Z',
  },
  {
    id: 's8',
    title: 'As It Was Yesterday',
    artist: 'Harry Styles Inspired',
    album: 'Harrys Sanctuary',
    genre: 'Pop',
    language: 'English',
    category: 'Hollywood',
    release_year: 2022,
    file_path: '/audio/as_it_was.wav',
    cover_image: '/src/assets/images/tuneos_hero_banner_1792096216255.jpg',
    uploaded_by: 'rahul_admin',
    play_count: 1470,
    likes_count: 340,
    avg_rating: 4.6,
    ratings_count: 87,
    duration: 168,
    created_at: '2024-02-25T17:00:00Z',
  },
  {
    id: 's9',
    title: 'Sunset Boulevard Lo-Fi',
    artist: 'Chillhop Beats',
    album: 'Pacific Coast Tapes',
    genre: 'Lo-Fi',
    language: 'English',
    category: 'Hollywood',
    release_year: 2024,
    file_path: '/audio/sunset_lofi.wav',
    cover_image: '/src/assets/images/hollywood_album_cover_1792096216486.jpg',
    uploaded_by: 'user_sophia',
    play_count: 1120,
    likes_count: 260,
    avg_rating: 4.7,
    ratings_count: 73,
    duration: 185,
    created_at: '2024-03-10T19:00:00Z',
  },
  {
    id: 's10',
    title: 'Neon Cyber Drive',
    artist: 'Retro Electro',
    album: 'Future Grid 2088',
    genre: 'Synthwave',
    language: 'English',
    category: 'Hollywood',
    release_year: 2023,
    file_path: '/audio/neon_cyber.wav',
    cover_image: '/src/assets/images/hollywood_album_cover_1792096216486.jpg',
    uploaded_by: 'user_tushar',
    play_count: 1340,
    likes_count: 310,
    avg_rating: 4.5,
    ratings_count: 69,
    duration: 192,
    created_at: '2024-03-05T16:00:00Z',
  },
];

// Pre-seeded users for testing personalization
const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    username: 'rahul_kumar',
    email: 'rahul@tuneos.local',
    name: 'Rahul Kumar',
    role: 'user',
    favorite_genres: ['Romantic', 'Folk'],
    preferred_category: 'Bollywood',
  },
  {
    id: 'u2',
    username: 'sophia_miller',
    email: 'sophia@tuneos.local',
    name: 'Sophia Miller',
    role: 'user',
    favorite_genres: ['Synthwave', 'Pop', 'Lo-Fi'],
    preferred_category: 'Hollywood',
  },
  {
    id: 'u3',
    username: 'tushar_admin',
    email: 'admin@tuneos.local',
    name: 'Tushar Yadav (Admin)',
    role: 'admin',
    favorite_genres: ['Romantic', 'Synthwave', 'Dance'],
    preferred_category: 'All',
  },
];

// In-Memory Database store with full persistent operations
class DataStore {
  songs: Song[] = [...INITIAL_SONGS];
  users: User[] = [...INITIAL_USERS];
  likes: LikeRecord[] = [
    { user_id: 'u1', song_id: 's1', created_at: '2024-03-01T10:00:00Z' },
    { user_id: 'u1', song_id: 's2', created_at: '2024-03-02T11:00:00Z' },
    { user_id: 'u1', song_id: 's4', created_at: '2024-03-03T12:00:00Z' },
    { user_id: 'u2', song_id: 's6', created_at: '2024-03-01T14:00:00Z' },
    { user_id: 'u2', song_id: 's7', created_at: '2024-03-02T15:00:00Z' },
    { user_id: 'u2', song_id: 's10', created_at: '2024-03-03T16:00:00Z' },
  ];
  ratings: RatingRecord[] = [
    { user_id: 'u1', song_id: 's1', rating: 5, created_at: '2024-03-01T10:05:00Z' },
    { user_id: 'u1', song_id: 's2', rating: 5, created_at: '2024-03-02T11:05:00Z' },
    { user_id: 'u1', song_id: 's5', rating: 4, created_at: '2024-03-03T12:05:00Z' },
    { user_id: 'u2', song_id: 's6', rating: 5, created_at: '2024-03-01T14:05:00Z' },
    { user_id: 'u2', song_id: 's7', rating: 5, created_at: '2024-03-02T15:05:00Z' },
    { user_id: 'u2', song_id: 's9', rating: 4, created_at: '2024-03-03T16:05:00Z' },
  ];
  history: HistoryRecord[] = [
    { id: 'h1', user_id: 'u1', song_id: 's1', listened_at: '2024-03-12T10:00:00Z', duration_played: 180 },
    { id: 'h2', user_id: 'u1', song_id: 's2', listened_at: '2024-03-12T10:15:00Z', duration_played: 195 },
    { id: 'h3', user_id: 'u1', song_id: 's4', listened_at: '2024-03-12T10:30:00Z', duration_played: 210 },
    { id: 'h4', user_id: 'u2', song_id: 's6', listened_at: '2024-03-12T11:00:00Z', duration_played: 175 },
    { id: 'h5', user_id: 'u2', song_id: 's7', listened_at: '2024-03-12T11:20:00Z', duration_played: 195 },
    { id: 'h6', user_id: 'u2', song_id: 's10', listened_at: '2024-03-12T11:40:00Z', duration_played: 192 },
  ];
  playlists: Playlist[] = [
    {
      id: 'p1',
      user_id: 'u1',
      name: 'Midnight Bollywood Soul',
      description: 'Soulful acoustic Hindi melodies and late night acoustic strings',
      created_at: '2024-03-01T10:00:00Z',
      song_ids: ['s1', 's2', 's4'],
    },
    {
      id: 'p2',
      user_id: 'u2',
      name: 'Neon Drive Waves',
      description: 'Atmospheric synthwave and pop for night drives',
      created_at: '2024-03-02T14:00:00Z',
      song_ids: ['s6', 's7', 's10'],
    },
  ];

  // Helper methods
  getAllSongs(params?: {
    category?: string;
    genre?: string;
    language?: string;
    search?: string;
    sort?: string;
  }): Song[] {
    let result = [...this.songs];

    if (params?.category && params.category !== 'All') {
      result = result.filter(s => s.category.toLowerCase() === params.category!.toLowerCase());
    }
    if (params?.genre && params.genre !== 'All') {
      result = result.filter(s => s.genre.toLowerCase() === params.genre!.toLowerCase());
    }
    if (params?.language && params.language !== 'All') {
      result = result.filter(s => s.language.toLowerCase() === params.language!.toLowerCase());
    }
    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      result = result.filter(
        s =>
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q) ||
          s.album.toLowerCase().includes(q) ||
          s.genre.toLowerCase().includes(q) ||
          s.language.toLowerCase().includes(q)
      );
    }

    if (params?.sort) {
      if (params.sort === 'most_played') {
        result.sort((a, b) => b.play_count - a.play_count);
      } else if (params.sort === 'most_liked') {
        result.sort((a, b) => b.likes_count - a.likes_count);
      } else if (params.sort === 'highest_rated') {
        result.sort((a, b) => b.avg_rating - a.avg_rating || b.ratings_count - a.ratings_count);
      } else if (params.sort === 'newest') {
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } else if (params.sort === 'alphabetical') {
        result.sort((a, b) => a.title.localeCompare(b.title));
      }
    }

    return result;
  }

  getSongById(id: string): Song | undefined {
    return this.songs.find(s => s.id === id);
  }

  toggleLike(userId: string, songId: string): { liked: boolean; totalLikes: number } {
    const existingIndex = this.likes.findIndex(l => l.user_id === userId && l.song_id === songId);
    const song = this.getSongById(songId);

    if (existingIndex >= 0) {
      this.likes.splice(existingIndex, 1);
      if (song) {
        song.likes_count = Math.max(0, song.likes_count - 1);
      }
      return { liked: false, totalLikes: song ? song.likes_count : 0 };
    } else {
      this.likes.push({
        user_id: userId,
        song_id: songId,
        created_at: new Date().toISOString(),
      });
      if (song) {
        song.likes_count += 1;
      }
      return { liked: true, totalLikes: song ? song.likes_count : 1 };
    }
  }

  rateSong(userId: string, songId: string, rating: number): { userRating: number; avgRating: number; ratingsCount: number } {
    const validRating = Math.max(1, Math.min(5, Math.round(rating)));
    const existingIndex = this.ratings.findIndex(r => r.user_id === userId && r.song_id === songId);

    if (existingIndex >= 0) {
      this.ratings[existingIndex].rating = validRating;
    } else {
      this.ratings.push({
        user_id: userId,
        song_id: songId,
        rating: validRating,
        created_at: new Date().toISOString(),
      });
    }

    // Recalculate song average
    const songRatings = this.ratings.filter(r => r.song_id === songId);
    const sum = songRatings.reduce((acc, curr) => acc + curr.rating, 0);
    const avg = parseFloat((sum / songRatings.length).toFixed(1));

    const song = this.getSongById(songId);
    if (song) {
      song.avg_rating = avg;
      song.ratings_count = songRatings.length;
    }

    return {
      userRating: validRating,
      avgRating: avg,
      ratingsCount: songRatings.length,
    };
  }

  recordListeningEvent(userId: string, songId: string, durationPlayed: number): void {
    const song = this.getSongById(songId);
    if (!song) return;

    song.play_count += 1;

    this.history.unshift({
      id: 'h_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      user_id: userId,
      song_id: songId,
      listened_at: new Date().toISOString(),
      duration_played: durationPlayed,
    });

    // Keep history clean, e.g. last 100 entries per user
    const userHistory = this.history.filter(h => h.user_id === userId);
    if (userHistory.length > 100) {
      const toRemove = userHistory.slice(100);
      this.history = this.history.filter(h => !toRemove.includes(h));
    }
  }

  getUserHistory(userId: string): { record: HistoryRecord; song: Song }[] {
    return this.history
      .filter(h => h.user_id === userId)
      .map(h => {
        const song = this.getSongById(h.song_id);
        return { record: h, song: song! };
      })
      .filter(item => Boolean(item.song));
  }

  clearUserHistory(userId: string): void {
    this.history = this.history.filter(h => h.user_id !== userId);
  }

  getUserLikedSongIds(userId: string): string[] {
    return this.likes.filter(l => l.user_id === userId).map(l => l.song_id);
  }

  getUserRatings(userId: string): Record<string, number> {
    const map: Record<string, number> = {};
    for (const r of this.ratings.filter(r => r.user_id === userId)) {
      map[r.song_id] = r.rating;
    }
    return map;
  }

  // Recommendation Algorithm: Multi-Factor Hybrid Engine
  getPersonalizedRecommendations(userId: string, limit: number = 8): {
    recommended: { song: Song; score: number; reason: string }[];
    becauseLiked: { sourceSong: Song; recommendations: Song[] } | null;
    trendingBollywood: Song[];
    topHollywood: Song[];
    topGenres: string[];
  } {
    const user = this.users.find(u => u.id === userId);
    const userLikes = this.likes.filter(l => l.user_id === userId);
    const likedSongIds = new Set(userLikes.map(l => l.song_id));
    const userRatings = this.ratings.filter(r => r.user_id === userId);
    const ratingMap = new Map(userRatings.map(r => [r.song_id, r.rating]));
    const userHistory = this.history.filter(h => h.user_id === userId);

    // Count plays per song by this user
    const userSongPlayCount = new Map<string, number>();
    for (const h of userHistory) {
      userSongPlayCount.set(h.song_id, (userSongPlayCount.get(h.song_id) || 0) + 1);
    }

    // Identify user preferred genres and artists from activity
    const genreAffinities = new Map<string, number>();
    const artistAffinities = new Map<string, number>();
    let bollywoodCount = 0;
    let hollywoodCount = 0;

    // Weight from user profile preference
    if (user) {
      for (const g of user.favorite_genres) {
        genreAffinities.set(g, (genreAffinities.get(g) || 0) + 2.0);
      }
      if (user.preferred_category === 'Bollywood') bollywoodCount += 3;
      if (user.preferred_category === 'Hollywood') hollywoodCount += 3;
    }

    // Weight from likes
    for (const l of userLikes) {
      const s = this.getSongById(l.song_id);
      if (s) {
        genreAffinities.set(s.genre, (genreAffinities.get(s.genre) || 0) + 3.0);
        artistAffinities.set(s.artist, (artistAffinities.get(s.artist) || 0) + 3.0);
        if (s.category === 'Bollywood') bollywoodCount += 2;
        if (s.category === 'Hollywood') hollywoodCount += 2;
      }
    }

    // Weight from ratings (ratings >= 4 give positive boost, ratings <= 2 give penalty)
    for (const r of userRatings) {
      const s = this.getSongById(r.song_id);
      if (s) {
        const ratingWeight = (r.rating - 3) * 1.5;
        genreAffinities.set(s.genre, (genreAffinities.get(s.genre) || 0) + ratingWeight);
        artistAffinities.set(s.artist, (artistAffinities.get(s.artist) || 0) + ratingWeight);
        if (s.category === 'Bollywood') bollywoodCount += ratingWeight > 0 ? 1 : -1;
        if (s.category === 'Hollywood') hollywoodCount += ratingWeight > 0 ? 1 : -1;
      }
    }

    // Weight from listening history
    for (const h of userHistory) {
      const s = this.getSongById(h.song_id);
      if (s) {
        genreAffinities.set(s.genre, (genreAffinities.get(s.genre) || 0) + 1.0);
        artistAffinities.set(s.artist, (artistAffinities.get(s.artist) || 0) + 1.2);
        if (s.category === 'Bollywood') bollywoodCount += 1;
        if (s.category === 'Hollywood') hollywoodCount += 1;
      }
    }

    // Normalizing max popularity
    const maxPlays = Math.max(...this.songs.map(s => s.play_count), 1);
    const maxLikes = Math.max(...this.songs.map(s => s.likes_count), 1);

    // Compute scores for each candidate song
    const scoredSongs: { song: Song; score: number; reason: string }[] = [];

    for (const song of this.songs) {
      let score = 0;
      const reasons: string[] = [];

      // 1. Genre Match
      const genreScore = genreAffinities.get(song.genre) || 0;
      if (genreScore > 0) {
        score += genreScore * 1.8;
        reasons.push(`${song.genre} genre affinity`);
      }

      // 2. Artist Match
      const artistScore = artistAffinities.get(song.artist) || 0;
      if (artistScore > 0) {
        score += artistScore * 2.2;
        reasons.push(`Similar to ${song.artist}`);
      }

      // 3. Category match
      if (song.category === 'Bollywood' && bollywoodCount > hollywoodCount) {
        score += 1.5;
      } else if (song.category === 'Hollywood' && hollywoodCount > bollywoodCount) {
        score += 1.5;
      }

      // 4. Community Popularity (Normalized)
      const popScore = (song.play_count / maxPlays) * 2.0 + (song.likes_count / maxLikes) * 1.5;
      score += popScore;

      // 5. High community rating
      if (song.avg_rating >= 4.5) {
        score += 1.0;
      }

      // 6. User Explicit Signal Boost
      if (likedSongIds.has(song.id)) {
        score += 1.0; // Familiar favorite
      }
      const userRating = ratingMap.get(song.id);
      if (userRating) {
        score += (userRating - 3) * 1.0;
      }

      // 7. Exploration & Diversity Penalty
      // If user has listened to this exact song more than 4 times recently,
      // penalize slightly to surface fresh music!
      const timesHeard = userSongPlayCount.get(song.id) || 0;
      if (timesHeard > 3) {
        score -= timesHeard * 0.8;
      }

      const mainReason = reasons.length > 0
        ? reasons[0]
        : (song.avg_rating >= 4.7 ? 'Critically acclaimed track' : 'Popular in community');

      scoredSongs.push({
        song,
        score: parseFloat(score.toFixed(2)),
        reason: mainReason,
      });
    }

    // Sort descending by score
    scoredSongs.sort((a, b) => b.score - a.score);

    // "Because you liked" section: Find most recent like, recommend similar songs
    let becauseLiked: { sourceSong: Song; recommendations: Song[] } | null = null;
    if (userLikes.length > 0) {
      const mostRecentLike = userLikes[userLikes.length - 1];
      const sourceSong = this.getSongById(mostRecentLike.song_id);
      if (sourceSong) {
        const similar = this.songs
          .filter(s => s.id !== sourceSong.id && (s.genre === sourceSong.genre || s.artist === sourceSong.artist || s.category === sourceSong.category))
          .slice(0, 4);
        if (similar.length > 0) {
          becauseLiked = { sourceSong, recommendations: similar };
        }
      }
    }

    const trendingBollywood = this.songs
      .filter(s => s.category === 'Bollywood')
      .sort((a, b) => b.play_count - a.play_count)
      .slice(0, 5);

    const topHollywood = this.songs
      .filter(s => s.category === 'Hollywood')
      .sort((a, b) => b.play_count - a.play_count)
      .slice(0, 5);

    // Top sorted user genres
    const topGenres = Array.from(genreAffinities.entries())
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .slice(0, 4);

    return {
      recommended: scoredSongs.slice(0, limit),
      becauseLiked,
      trendingBollywood,
      topHollywood,
      topGenres: topGenres.length > 0 ? topGenres : ['Romantic', 'Synthwave', 'Pop', 'Folk'],
    };
  }

  // Search Recommendations: Related tracks alongside query
  getSearchRecommendations(query: string, userId?: string): {
    exactMatches: Song[];
    moreByArtist: { artist: string; songs: Song[] }[];
    similarInGenre: { genre: string; songs: Song[] }[];
    popularRelated: Song[];
  } {
    const q = query.toLowerCase().trim();
    const exactMatches = this.songs.filter(
      s =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.album.toLowerCase().includes(q) ||
        s.genre.toLowerCase().includes(q) ||
        s.language.toLowerCase().includes(q)
    );

    // Collect matched artists and genres
    const artists = Array.from(new Set(exactMatches.map(s => s.artist)));
    const genres = Array.from(new Set(exactMatches.map(s => s.genre)));

    const moreByArtist: { artist: string; songs: Song[] }[] = [];
    for (const art of artists.slice(0, 2)) {
      const tracks = this.songs.filter(s => s.artist === art && !exactMatches.includes(s));
      if (tracks.length > 0) {
        moreByArtist.push({ artist: art, songs: tracks });
      }
    }

    const similarInGenre: { genre: string; songs: Song[] }[] = [];
    for (const gen of genres.slice(0, 2)) {
      const tracks = this.songs.filter(s => s.genre === gen && !exactMatches.includes(s)).slice(0, 4);
      if (tracks.length > 0) {
        similarInGenre.push({ genre: gen, songs: tracks });
      }
    }

    const popularRelated = this.songs
      .filter(s => !exactMatches.includes(s))
      .sort((a, b) => b.play_count - a.play_count)
      .slice(0, 4);

    return {
      exactMatches,
      moreByArtist,
      similarInGenre,
      popularRelated,
    };
  }

  // OS Scheduling Simulation Engine
  simulateOSScheduling(
    algorithm: 'FCFS' | 'SJF' | 'Priority' | 'RoundRobin',
    jobs: ProcessJob[],
    quantum: number = 2
  ): SchedulingResult {
    const n = jobs.length;
    if (n === 0) {
      return {
        algorithm,
        timeline: [],
        processes: [],
        avg_waiting_time: 0,
        avg_turnaround_time: 0,
        cpu_utilization: 100,
        throughput: 0,
      };
    }

    const timeline: GanttBlock[] = [];
    const results: ProcessResult[] = [];

    if (algorithm === 'FCFS') {
      // First-Come First-Served: Sort by arrival time
      const sorted = [...jobs].sort((a, b) => a.arrival_time - b.arrival_time);
      let currentTime = 0;

      for (const p of sorted) {
        if (currentTime < p.arrival_time) {
          currentTime = p.arrival_time;
        }
        const startTime = currentTime;
        const completionTime = startTime + p.burst_time;
        timeline.push({
          pid: p.pid,
          process_name: p.process_name,
          start_time: startTime,
          end_time: completionTime,
        });

        const tat = completionTime - p.arrival_time;
        const wt = tat - p.burst_time;
        results.push({
          ...p,
          start_time: startTime,
          completion_time: completionTime,
          turnaround_time: tat,
          waiting_time: wt,
        });
        currentTime = completionTime;
      }
    } else if (algorithm === 'SJF') {
      // Shortest Job First (Non-preemptive)
      let currentTime = 0;
      const completed: ProcessResult[] = [];
      const remaining = [...jobs];

      while (remaining.length > 0) {
        // Find ready processes
        const ready = remaining.filter(p => p.arrival_time <= currentTime);
        if (ready.length === 0) {
          // Fast-forward to next arrival
          const nextArrival = Math.min(...remaining.map(p => p.arrival_time));
          currentTime = nextArrival;
          continue;
        }

        // Choose process with minimum burst time
        ready.sort((a, b) => a.burst_time - b.burst_time);
        const nextJob = ready[0];
        const startTime = currentTime;
        const completionTime = startTime + nextJob.burst_time;

        timeline.push({
          pid: nextJob.pid,
          process_name: nextJob.process_name,
          start_time: startTime,
          end_time: completionTime,
        });

        const tat = completionTime - nextJob.arrival_time;
        const wt = tat - nextJob.burst_time;
        completed.push({
          ...nextJob,
          start_time: startTime,
          completion_time: completionTime,
          turnaround_time: tat,
          waiting_time: wt,
        });

        currentTime = completionTime;
        const idx = remaining.findIndex(p => p.pid === nextJob.pid);
        remaining.splice(idx, 1);
      }
      results.push(...completed);
    } else if (algorithm === 'Priority') {
      // Priority Scheduling (Non-preemptive, lower number = higher priority)
      let currentTime = 0;
      const completed: ProcessResult[] = [];
      const remaining = [...jobs];

      while (remaining.length > 0) {
        const ready = remaining.filter(p => p.arrival_time <= currentTime);
        if (ready.length === 0) {
          const nextArrival = Math.min(...remaining.map(p => p.arrival_time));
          currentTime = nextArrival;
          continue;
        }

        ready.sort((a, b) => a.priority - b.priority || a.arrival_time - b.arrival_time);
        const nextJob = ready[0];
        const startTime = currentTime;
        const completionTime = startTime + nextJob.burst_time;

        timeline.push({
          pid: nextJob.pid,
          process_name: nextJob.process_name,
          start_time: startTime,
          end_time: completionTime,
        });

        const tat = completionTime - nextJob.arrival_time;
        const wt = tat - nextJob.burst_time;
        completed.push({
          ...nextJob,
          start_time: startTime,
          completion_time: completionTime,
          turnaround_time: tat,
          waiting_time: wt,
        });

        currentTime = completionTime;
        const idx = remaining.findIndex(p => p.pid === nextJob.pid);
        remaining.splice(idx, 1);
      }
      results.push(...completed);
    } else if (algorithm === 'RoundRobin') {
      // Preemptive Round Robin with Quantum
      const tq = Math.max(1, quantum);
      const remainingBurst = new Map<string, number>();
      const firstStart = new Map<string, number>();
      const completionTimes = new Map<string, number>();

      for (const p of jobs) {
        remainingBurst.set(p.pid, p.burst_time);
      }

      const queue: ProcessJob[] = [];
      const arrivedPids = new Set<string>();
      let currentTime = 0;

      // Enqueue initially arrived jobs
      const sortedByArrival = [...jobs].sort((a, b) => a.arrival_time - b.arrival_time);
      
      const checkArrivals = (time: number) => {
        for (const p of sortedByArrival) {
          if (p.arrival_time <= time && !arrivedPids.has(p.pid)) {
            queue.push(p);
            arrivedPids.add(p.pid);
          }
        }
      };

      checkArrivals(currentTime);

      while (queue.length > 0 || arrivedPids.size < jobs.length) {
        if (queue.length === 0) {
          // Advance to next arrival
          const unarrived = jobs.filter(p => !arrivedPids.has(p.pid));
          currentTime = Math.min(...unarrived.map(p => p.arrival_time));
          checkArrivals(currentTime);
          continue;
        }

        const currentJob = queue.shift()!;
        const remaining = remainingBurst.get(currentJob.pid)!;
        const execTime = Math.min(tq, remaining);
        const startTime = currentTime;
        const endTime = startTime + execTime;

        if (!firstStart.has(currentJob.pid)) {
          firstStart.set(currentJob.pid, startTime);
        }

        timeline.push({
          pid: currentJob.pid,
          process_name: currentJob.process_name,
          start_time: startTime,
          end_time: endTime,
        });

        currentTime = endTime;
        const newRemaining = remaining - execTime;
        remainingBurst.set(currentJob.pid, newRemaining);

        // Check for any newly arrived jobs while this slice ran
        checkArrivals(currentTime);

        if (newRemaining > 0) {
          queue.push(currentJob);
        } else {
          completionTimes.set(currentJob.pid, currentTime);
        }
      }

      for (const p of jobs) {
        const ct = completionTimes.get(p.pid) || 0;
        const st = firstStart.get(p.pid) || 0;
        const tat = ct - p.arrival_time;
        const wt = tat - p.burst_time;
        results.push({
          ...p,
          start_time: st,
          completion_time: ct,
          turnaround_time: tat,
          waiting_time: wt,
        });
      }
    }

    const totalTat = results.reduce((acc, curr) => acc + curr.turnaround_time, 0);
    const totalWt = results.reduce((acc, curr) => acc + curr.waiting_time, 0);
    const lastEndTime = timeline.length > 0 ? timeline[timeline.length - 1].end_time : 1;
    const totalBurst = jobs.reduce((acc, curr) => acc + curr.burst_time, 0);

    return {
      algorithm,
      timeline,
      processes: results,
      avg_waiting_time: parseFloat((totalWt / n).toFixed(2)),
      avg_turnaround_time: parseFloat((totalTat / n).toFixed(2)),
      cpu_utilization: parseFloat(Math.min(100, (totalBurst / lastEndTime) * 100).toFixed(1)),
      throughput: parseFloat((n / lastEndTime).toFixed(3)),
    };
  }

  // Playlist management
  getUserPlaylists(userId: string): Playlist[] {
    return this.playlists.filter(p => p.user_id === userId);
  }

  createPlaylist(userId: string, name: string, description: string): Playlist {
    const pl: Playlist = {
      id: 'p_' + Date.now(),
      user_id: userId,
      name,
      description,
      created_at: new Date().toISOString(),
      song_ids: [],
    };
    this.playlists.push(pl);
    return pl;
  }

  addSongToPlaylist(playlistId: string, songId: string): boolean {
    const pl = this.playlists.find(p => p.id === playlistId);
    if (!pl) return false;
    if (!pl.song_ids.includes(songId)) {
      pl.song_ids.push(songId);
    }
    return true;
  }

  removeSongFromPlaylist(playlistId: string, songId: string): boolean {
    const pl = this.playlists.find(p => p.id === playlistId);
    if (!pl) return false;
    pl.song_ids = pl.song_ids.filter(id => id !== songId);
    return true;
  }

  deletePlaylist(playlistId: string, userId: string): boolean {
    const idx = this.playlists.findIndex(p => p.id === playlistId && p.user_id === userId);
    if (idx >= 0) {
      this.playlists.splice(idx, 1);
      return true;
    }
    return false;
  }

  // Admin moderation
  deleteSong(songId: string): boolean {
    const idx = this.songs.findIndex(s => s.id === songId);
    if (idx >= 0) {
      this.songs.splice(idx, 1);
      // Remove from playlists and likes
      for (const pl of this.playlists) {
        pl.song_ids = pl.song_ids.filter(id => id !== songId);
      }
      this.likes = this.likes.filter(l => l.song_id !== songId);
      this.ratings = this.ratings.filter(r => r.song_id !== songId);
      this.history = this.history.filter(h => h.song_id !== songId);
      return true;
    }
    return false;
  }
}

export const dataStore = new DataStore();
