import React, { useState } from 'react';
import { Play, Pause, Heart, ListPlus, Volume2 } from 'lucide-react';
import { Song } from '../types.ts';
import { useAudio } from '../context/AudioContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { StarRating } from './StarRating.tsx';
import { PlaylistModal } from './PlaylistModal.tsx';
import { api } from '../services/api.ts';

interface SongCardProps {
  song: Song;
  queueContext?: Song[];
  recommendationReason?: string;
  recommendationScore?: number;
}

export const SongCard: React.FC<SongCardProps> = ({
  song,
  queueContext,
  recommendationReason,
  recommendationScore,
}) => {
  const { currentSong, isPlaying, playSong, togglePlay, likedSongIds, refreshInteractions } = useAudio();
  const { currentUser } = useAuth();
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [likesCount, setLikesCount] = useState(song.likes_count);
  const [userRating, setUserRating] = useState<number>(0);
  const [avgRating, setAvgRating] = useState<number>(song.avg_rating);
  const [ratingsCount, setRatingsCount] = useState<number>(song.ratings_count);

  const isCurrentActive = currentSong?.id === song.id;
  const isThisPlaying = isCurrentActive && isPlaying;
  const isLiked = likedSongIds.has(song.id);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentActive) {
      togglePlay();
    } else {
      playSong(song, queueContext);
    }
  };

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    try {
      const res = await api.toggleLike(song.id, currentUser.id);
      setLikesCount(res.totalLikes);
      await refreshInteractions();
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const handleRate = async (rating: number) => {
    if (!currentUser) return;
    try {
      const res = await api.rateSong(song.id, currentUser.id, rating);
      setUserRating(res.userRating);
      setAvgRating(res.avgRating);
      setRatingsCount(res.ratingsCount);
      await refreshInteractions();
    } catch (err) {
      console.error('Failed to rate song:', err);
    }
  };

  return (
    <>
      <div className="group relative flex flex-col p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 hover:bg-zinc-800/50 transition-all duration-200">
        {/* Cover Art Container */}
        <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-zinc-950 mb-3">
          {song.cover_image ? (
            <img
              src={song.cover_image}
              alt={song.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900 text-zinc-600">
              <Volume2 className="w-10 h-10" />
            </div>
          )}

          {/* Active Sound Indicator */}
          {isThisPlaying && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md flex items-center gap-1 text-[11px] font-medium text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Playing
            </div>
          )}

          {/* Quick Play Overlay */}
          <button
            type="button"
            onClick={handlePlayClick}
            aria-label={isThisPlaying ? 'Pause song' : 'Play song'}
            className={`absolute right-2.5 bottom-2.5 w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
              isThisPlaying
                ? 'bg-emerald-500 text-black scale-100 opacity-100'
                : 'bg-emerald-500 text-black opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105'
            }`}
          >
            {isThisPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>
        </div>

        {/* Title and Artist */}
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-zinc-100 truncate group-hover:text-emerald-400 transition-colors">
            {song.title}
          </h4>
          <p className="text-xs text-zinc-400 truncate mt-0.5">{song.artist}</p>

          {/* Clean Unboxed Metadata with Typographic Separators */}
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mt-1.5 truncate">
            <span>{song.category}</span>
            <span aria-hidden="true">·</span>
            <span>{song.genre}</span>
            <span aria-hidden="true">·</span>
            <span>{song.release_year}</span>
          </div>

          {/* Recommendation Reason (if provided) */}
          {recommendationReason && (
            <div className="mt-2 text-[11px] text-emerald-400/90 font-medium truncate flex items-center gap-1">
              <span>★ {recommendationReason}</span>
              {recommendationScore !== undefined && (
                <span className="text-zinc-500 font-mono text-[10px]">({recommendationScore} pts)</span>
              )}
            </div>
          )}
        </div>

        {/* Footer: Rating, Likes, and Actions */}
        <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between gap-2">
          {/* 5-Star Interactive Rating */}
          <StarRating
            rating={avgRating}
            count={ratingsCount}
            onRate={handleRate}
            interactive={true}
            size="sm"
            showCount={false}
          />

          <div className="flex items-center gap-1">
            {/* Like Button */}
            <button
              type="button"
              onClick={handleLikeClick}
              aria-label={isLiked ? 'Unlike song' : 'Like song'}
              className="flex items-center gap-1 p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 transition-colors"
              title={`${likesCount} likes`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  isLiked ? 'fill-rose-500 text-rose-500' : 'text-zinc-400 hover:text-rose-400'
                }`}
              />
              <span className="text-[11px] font-mono tabular-nums text-zinc-400">
                {likesCount}
              </span>
            </button>

            {/* Add to Playlist Button */}
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                setIsPlaylistModalOpen(true);
              }}
              aria-label="Add to playlist"
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              title="Add to playlist"
            >
              <ListPlus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <PlaylistModal
        song={song}
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
      />
    </>
  );
};
