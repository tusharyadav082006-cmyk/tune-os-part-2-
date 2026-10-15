import React, { useState, useEffect } from 'react';
import { Play, Sparkles, Flame, Heart, Radio, RefreshCw, Disc } from 'lucide-react';
import { Song, RecommendationsResponse } from '../types.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useAudio } from '../context/AudioContext.tsx';
import { SongCard } from '../components/SongCard.tsx';

export const HomeView: React.FC<{ onNavigateToSearch: () => void }> = ({ onNavigateToSearch }) => {
  const { currentUser } = useAuth();
  const { playSong } = useAudio();
  const [data, setData] = useState<RecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRecommendations = async () => {
    if (!currentUser) return;
    try {
      setRefreshing(true);
      const res = await api.getRecommendations(currentUser.id);
      setData(res);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [currentUser]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <p className="text-xs text-zinc-400">Synthesizing personalized recommendations...</p>
        </div>
      </div>
    );
  }

  const allFeedSongs: Song[] = [
    ...data.recommended.map(r => r.song),
    ...data.trendingBollywood,
    ...data.topHollywood,
  ];

  const heroSong = data.recommended[0]?.song || data.trendingBollywood[0];

  return (
    <div className="space-y-10 pb-20">
      {/* Hero Section */}
      <section className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950">
        <div className="relative aspect-[21/9] min-h-[300px] w-full">
          <img
            src="/src/assets/images/tuneos_hero_banner_1792096216255.jpg"
            alt="TuneOS Audio Studio"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover brightness-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
          <div className="absolute inset-0 p-8 sm:p-12 flex flex-col justify-end max-w-3xl">
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Personalized for {currentUser?.name}</span>
              <span aria-hidden="true">·</span>
              <span>Preference: {currentUser?.preferred_category}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 text-balance">
              TuneOS: Hybrid Music Streaming & OS Architecture
            </h1>

            <p className="text-sm text-zinc-300 mb-6 max-w-xl leading-relaxed">
              Curated Bollywood and Hollywood releases dynamically weighted against your listening history, 5-star ratings, and explicit likes.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              {heroSong && (
                <button
                  onClick={() => playSong(heroSong, allFeedSongs)}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-emerald-500 text-black rounded-lg hover:bg-emerald-400 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Stream Top Pick: {heroSong.title}
                </button>
              )}

              <button
                onClick={loadRecommendations}
                disabled={refreshing}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-zinc-300 bg-zinc-900/80 hover:bg-zinc-800 rounded-lg border border-zinc-700/80 transition-colors"
                title="Recalculate personalized scores"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                Recalculate Feed
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Recommended For You */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Recommended For You
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Derived from your genres ({data.topGenres.join(', ')}), play counts, and ratings
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {data.recommended.map(({ song, reason, score }) => (
            <SongCard
              key={song.id}
              song={song}
              queueContext={allFeedSongs}
              recommendationReason={reason}
              recommendationScore={score}
            />
          ))}
        </div>
      </section>

      {/* Section 2: Because You Liked (if user has likes) */}
      {data.becauseLiked && (
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                Because You Liked "{data.becauseLiked.sourceSong.title}"
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Tracks with matching acoustic timbre, {data.becauseLiked.sourceSong.genre} genre, and artist style
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {data.becauseLiked.recommendations.map(song => (
              <SongCard
                key={song.id}
                song={song}
                queueContext={allFeedSongs}
                recommendationReason={`Similar to ${data.becauseLiked?.sourceSong.title}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* Section 3: Trending in Bollywood */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              Trending in Bollywood
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Top streamed Hindi, Punjabi, and acoustic melodies
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {data.trendingBollywood.map(song => (
            <SongCard
              key={song.id}
              song={song}
              queueContext={allFeedSongs}
            />
          ))}
        </div>
      </section>

      {/* Section 4: Top Hollywood Hits */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <Disc className="w-4 h-4 text-cyan-400" />
              Top Hollywood & Global Hits
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Synthwave, cinematic pop, indie, and lo-fi beats
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {data.topHollywood.map(song => (
            <SongCard
              key={song.id}
              song={song}
              queueContext={allFeedSongs}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
