import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  Heart,
  ListMusic,
  Disc3,
} from 'lucide-react';
import { useAudio } from '../context/AudioContext.tsx';
import { StarRating } from './StarRating.tsx';
import { PlaylistModal } from './PlaylistModal.tsx';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const AudioPlayer: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    queue,
    togglePlay,
    seek,
    setVolumeLevel,
    toggleMute,
    playNext,
    playPrev,
    toggleShuffle,
    toggleRepeat,
    toggleLikeCurrent,
    rateCurrentSong,
    likedSongIds,
    userRatings,
  } = useAudio();

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekTime, setSeekTime] = useState(0);
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  // Equalizer canvas animation
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bars = 8;
    const barWidth = 2.5;
    const gap = 2;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < bars; i++) {
        const height = isPlaying
          ? Math.sin(Date.now() * 0.008 + i * 1.2) * 8 + 10
          : 3;
        ctx.fillStyle = isPlaying ? '#10b981' : '#52525b';
        ctx.fillRect(i * (barWidth + gap), canvas.height - height, barWidth, height);
      }
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  if (!currentSong) {
    return null;
  }

  const isLiked = likedSongIds.has(currentSong.id);
  const myRating = userRatings[currentSong.id] || 0;
  const effectiveTime = isSeeking ? seekTime : currentTime;
  const progressPercent = duration > 0 ? (effectiveTime / duration) * 100 : 0;

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSeekTime(val);
  };

  const handleSeekMouseDown = () => {
    setIsSeeking(true);
    setSeekTime(currentTime);
  };

  const handleSeekMouseUp = () => {
    seek(seekTime);
    setIsSeeking(false);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/80 px-4 py-2.5 transition-all">
        {/* Scrubbing Bar */}
        <div className="max-w-7xl mx-auto flex items-center gap-3 mb-1">
          <span className="text-[11px] font-mono tabular-nums text-zinc-400 w-10 text-right">
            {formatTime(effectiveTime)}
          </span>

          <div className="relative flex-1 flex items-center group py-1">
            <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all group-hover:bg-emerald-400"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={duration || 180}
              step={0.5}
              value={effectiveTime}
              onMouseDown={handleSeekMouseDown}
              onTouchStart={handleSeekMouseDown}
              onChange={handleSeekChange}
              onMouseUp={handleSeekMouseUp}
              onTouchEnd={handleSeekMouseUp}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
              aria-label="Audio seekbar"
            />
          </div>

          <span className="text-[11px] font-mono tabular-nums text-zinc-500 w-10">
            {formatTime(duration)}
          </span>
        </div>

        {/* Player Controls Strip */}
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left Zone: Song Info */}
          <div className="flex items-center gap-3 min-w-0 max-w-[30%]">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-zinc-900 shrink-0 border border-zinc-800">
              {currentSong.cover_image ? (
                <img
                  src={currentSong.cover_image}
                  alt={currentSong.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500">
                  <Disc3 className="w-6 h-6 animate-spin" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h5 className="text-sm font-semibold text-zinc-100 truncate">
                  {currentSong.title}
                </h5>
                <canvas
                  ref={canvasRef}
                  width={36}
                  height={18}
                  className="hidden sm:inline-block shrink-0"
                  aria-label="Sound visualizer"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs text-zinc-400 truncate">
                <span>{currentSong.artist}</span>
                <span aria-hidden="true">·</span>
                <span className="text-zinc-500">{currentSong.album}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleLikeCurrent}
              aria-label={isLiked ? 'Unlike current song' : 'Like current song'}
              className="p-1.5 rounded-md text-zinc-400 hover:text-rose-400 transition-colors ml-1 hidden sm:block"
            >
              <Heart
                className={`w-4 h-4 ${
                  isLiked ? 'fill-rose-500 text-rose-500' : 'text-zinc-400'
                }`}
              />
            </button>
          </div>

          {/* Center Zone: Playback Buttons */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Shuffle */}
            <button
              type="button"
              onClick={toggleShuffle}
              aria-label="Shuffle"
              className={`p-2 rounded-lg transition-colors ${
                isShuffle ? 'text-emerald-400 bg-emerald-950/40' : 'text-zinc-400 hover:text-white'
              }`}
              title={isShuffle ? 'Shuffle is ON' : 'Shuffle is OFF'}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            {/* Prev */}
            <button
              type="button"
              onClick={playPrev}
              aria-label="Previous song"
              className="p-2 text-zinc-300 hover:text-white transition-colors"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            {/* Play/Pause */}
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="w-10 h-10 rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-emerald-500/10"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            {/* Next */}
            <button
              type="button"
              onClick={playNext}
              aria-label="Next song"
              className="p-2 text-zinc-300 hover:text-white transition-colors"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            {/* Repeat */}
            <button
              type="button"
              onClick={toggleRepeat}
              aria-label="Repeat mode"
              className={`p-2 rounded-lg transition-colors ${
                repeatMode !== 'off'
                  ? 'text-emerald-400 bg-emerald-950/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-4 h-4" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Right Zone: Rating, Volume & Queue */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Quick Star Rating */}
            <div className="hidden lg:flex items-center gap-1.5 border-r border-zinc-800 pr-4">
              <span className="text-[11px] text-zinc-400">Rate:</span>
              <StarRating
                rating={myRating || currentSong.avg_rating}
                interactive={true}
                onRate={rateCurrentSong}
                size="sm"
              />
            </div>

            {/* Volume Control */}
            <div className="hidden md:flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                className="text-zinc-400 hover:text-white transition-colors p-1"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={e => setVolumeLevel(parseFloat(e.target.value))}
                className="w-20 accent-emerald-500 accent-slider cursor-pointer"
                aria-label="Volume slider"
              />
            </div>

            {/* Queue Toggle */}
            <button
              type="button"
              onClick={() => setShowQueueModal(prev => !prev)}
              aria-label="Playback queue"
              className={`p-2 rounded-lg transition-colors ${
                showQueueModal ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400 hover:text-white'
              }`}
              title="Current Queue"
            >
              <ListMusic className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over Queue Modal */}
      {showQueueModal && (
        <div className="fixed bottom-24 right-4 z-50 w-80 max-h-96 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <span className="text-sm font-semibold text-white">Up Next ({queue.length})</span>
            <button
              onClick={() => setShowQueueModal(false)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="overflow-y-auto divide-y divide-zinc-800/50 py-2 flex-1">
            {queue.map((s, idx) => {
              const isItemActive = s.id === currentSong.id;
              return (
                <div
                  key={s.id + '_' + idx}
                  className={`flex items-center justify-between py-2 px-1 text-left ${
                    isItemActive ? 'text-emerald-400 font-medium' : 'text-zinc-300'
                  }`}
                >
                  <div className="truncate pr-2">
                    <p className="text-xs truncate">{s.title}</p>
                    <p className="text-[10px] text-zinc-500 truncate">{s.artist}</p>
                  </div>
                  {isItemActive && (
                    <span className="text-[10px] uppercase font-mono tracking-wider bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded">
                      Now
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <PlaylistModal
        song={currentSong}
        isOpen={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
      />
    </>
  );
};
