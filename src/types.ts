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
  duration: number;
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

export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  description: string;
  created_at: string;
  song_ids: string[];
}

export interface HistoryItem {
  record: {
    id: string;
    user_id: string;
    song_id: string;
    listened_at: string;
    duration_played: number;
  };
  song: Song;
}

export interface RecommendedTrack {
  song: Song;
  score: number;
  reason: string;
}

export interface RecommendationsResponse {
  recommended: RecommendedTrack[];
  becauseLiked: {
    sourceSong: Song;
    recommendations: Song[];
  } | null;
  trendingBollywood: Song[];
  topHollywood: Song[];
  topGenres: string[];
}

export interface SearchRecommendationsResponse {
  exactMatches: Song[];
  moreByArtist: { artist: string; songs: Song[] }[];
  similarInGenre: { genre: string; songs: Song[] }[];
  popularRelated: Song[];
}

export interface ProcessJob {
  pid: string;
  process_name: string;
  arrival_time: number;
  burst_time: number;
  priority: number;
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
