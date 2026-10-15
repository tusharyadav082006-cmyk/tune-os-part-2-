import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Song } from '../types.ts';
import { api } from '../services/api.ts';
import { useAuth } from './AuthContext.tsx';

interface AudioContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  queue: Song[];
  queueIndex: number;
  likedSongIds: Set<string>;
  userRatings: Record<string, number>;
  playSong: (song: Song, newQueue?: Song[]) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  seek: (seconds: number) => void;
  setVolumeLevel: (vol: number) => void;
  toggleMute: () => void;
  playNext: () => void;
  playPrev: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleLikeCurrent: () => Promise<void>;
  rateCurrentSong: (rating: number) => Promise<void>;
  refreshInteractions: () => Promise<void>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('all');
  const [queue, setQueue] = useState<Song[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(-1);

  const [likedSongIds, setLikedSongIds] = useState<Set<string>>(new Set());
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playTrackedRef = useRef<boolean>(false);
  const playStartRef = useRef<number>(0);

  // Initialize HTML5 Audio
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.volume = volume;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      // Auto-record play event after 10 continuous seconds
      if (!playTrackedRef.current && audio.currentTime >= 10 && currentSong && currentUser) {
        playTrackedRef.current = true;
        api.recordPlay(currentSong.id, currentUser.id, 10).catch(console.error);
      }
    };

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) {
        setDuration(audio.duration);
      } else if (currentSong?.duration) {
        setDuration(currentSong.duration);
      }
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    const onEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else {
        playNext();
      }
    };

    const onError = (e: Event) => {
      console.warn('Audio playback error, attempting recovery:', e);
      // Fallback duration if missing
      if (currentSong?.duration) {
        setDuration(currentSong.duration);
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.pause();
    };
  }, []);

  // Fetch likes and ratings when user changes
  const refreshInteractions = async () => {
    if (!currentUser) return;
    try {
      const [likedSongs, ratings] = await Promise.all([
        api.getLikedSongs(currentUser.id),
        api.getUserRatings(currentUser.id),
      ]);
      setLikedSongIds(new Set(likedSongs.map(s => s.id)));
      setUserRatings(ratings);
    } catch (err) {
      console.error('Failed to load user interactions:', err);
    }
  };

  useEffect(() => {
    refreshInteractions();
  }, [currentUser]);

  const playSong = (song: Song, newQueue?: Song[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (newQueue) {
      setQueue(newQueue);
      const idx = newQueue.findIndex(s => s.id === song.id);
      setQueueIndex(idx >= 0 ? idx : 0);
    } else if (queue.length === 0) {
      setQueue([song]);
      setQueueIndex(0);
    } else {
      const idx = queue.findIndex(s => s.id === song.id);
      if (idx >= 0) {
        setQueueIndex(idx);
      } else {
        setQueue(prev => [...prev, song]);
        setQueueIndex(queue.length);
      }
    }

    setCurrentSong(song);
    playTrackedRef.current = false;
    playStartRef.current = Date.now();

    audio.src = song.file_path;
    audio.load();
    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(err => {
        console.warn('Playback autoplay policy or error:', err);
      });
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      if (!currentSong && queue.length > 0) {
        playSong(queue[0]);
      } else {
        audio.play().catch(console.error);
      }
    }
  };

  const pause = () => {
    audioRef.current?.pause();
  };

  const resume = () => {
    audioRef.current?.play().catch(console.error);
  };

  const seek = (seconds: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  const setVolumeLevel = (vol: number) => {
    const valid = Math.max(0, Math.min(1, vol));
    setVolume(valid);
    if (audioRef.current) {
      audioRef.current.volume = valid;
    }
    if (valid > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMuted) {
      audio.volume = volume || 0.8;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const playNext = () => {
    if (queue.length === 0) return;

    let nextIdx = queueIndex + 1;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else if (nextIdx >= queue.length) {
      if (repeatMode === 'all') {
        nextIdx = 0;
      } else {
        pause();
        return;
      }
    }

    setQueueIndex(nextIdx);
    playSong(queue[nextIdx]);
  };

  const playPrev = () => {
    if (queue.length === 0) return;

    // If past 3 seconds, replay current song
    if (currentTime > 3) {
      seek(0);
      return;
    }

    let prevIdx = queueIndex - 1;
    if (prevIdx < 0) {
      prevIdx = queue.length - 1;
    }
    setQueueIndex(prevIdx);
    playSong(queue[prevIdx]);
  };

  const toggleShuffle = () => {
    setIsShuffle(prev => !prev);
  };

  const toggleRepeat = () => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const toggleLikeCurrent = async () => {
    if (!currentSong || !currentUser) return;
    try {
      const res = await api.toggleLike(currentSong.id, currentUser.id);
      setLikedSongIds(prev => {
        const next = new Set(prev);
        if (res.liked) next.add(currentSong.id);
        else next.delete(currentSong.id);
        return next;
      });
      setCurrentSong(prev => (prev ? { ...prev, likes_count: res.totalLikes } : null));
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const rateCurrentSong = async (rating: number) => {
    if (!currentSong || !currentUser) return;
    try {
      const res = await api.rateSong(currentSong.id, currentUser.id, rating);
      setUserRatings(prev => ({ ...prev, [currentSong.id]: rating }));
      setCurrentSong(prev =>
        prev
          ? {
              ...prev,
              avg_rating: res.avgRating,
              ratings_count: res.ratingsCount,
            }
          : null
      );
    } catch (err) {
      console.error('Failed to rate song:', err);
    }
  };

  return (
    <AudioContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isShuffle,
        repeatMode,
        queue,
        queueIndex,
        likedSongIds,
        userRatings,
        playSong,
        togglePlay,
        pause,
        resume,
        seek,
        setVolumeLevel,
        toggleMute,
        playNext,
        playPrev,
        toggleShuffle,
        toggleRepeat,
        toggleLikeCurrent,
        rateCurrentSong,
        refreshInteractions,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within an AudioProvider');
  return context;
};
