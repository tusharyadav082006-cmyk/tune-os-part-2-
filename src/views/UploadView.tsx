import React, { useState } from 'react';
import { Upload, Music, Image as ImageIcon, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useAudio } from '../context/AudioContext.tsx';
import { Song } from '../types.ts';

interface UploadViewProps {
  onSuccess: (uploadedSong: Song) => void;
  onCancel: () => void;
}

export const UploadView: React.FC<UploadViewProps> = ({ onSuccess, onCancel }) => {
  const { currentUser } = useAuth();
  const { playSong } = useAudio();

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [genre, setGenre] = useState('Romantic');
  const [language, setLanguage] = useState('Hindi');
  const [category, setCategory] = useState<'Bollywood' | 'Hollywood'>('Bollywood');
  const [releaseYear, setReleaseYear] = useState<number>(new Date().getFullYear());

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [previewCover, setPreviewCover] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successSong, setSuccessSong] = useState<Song | null>(null);

  const genres = ['Romantic', 'Pop', 'Synthwave', 'Folk', 'Dance', 'Lo-Fi', 'Rock', 'Classical'];
  const languages = ['Hindi', 'English', 'Punjabi', 'Bengali', 'Tamil', 'Spanish'];

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      setPreviewCover(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim() || !artist.trim()) {
      setErrorMsg('Please provide both Song Title and Artist name.');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('artist', artist.trim());
      formData.append('album', album.trim() || 'Single');
      formData.append('genre', genre);
      formData.append('language', language);
      formData.append('category', category);
      formData.append('release_year', releaseYear.toString());
      formData.append('uploaded_by', currentUser?.username || 'user');

      if (audioFile) {
        formData.append('audio', audioFile);
      }
      if (coverFile) {
        formData.append('cover', coverFile);
      }

      const created = await api.uploadSong(formData);
      setSuccessSong(created);
    } catch (err: any) {
      console.error('Failed to upload song:', err);
      setErrorMsg(err.message || 'Error occurred while saving song');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successSong) {
    return (
      <div className="max-w-xl mx-auto py-12 px-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-5">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle className="w-7 h-7 stroke-[2.5]" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">Song Uploaded to Shared Library!</h2>
          <p className="text-xs text-zinc-400 mt-1">
            "{successSong.title}" is now permanently recorded in MySQL and ready to stream.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              playSong(successSong);
              onSuccess(successSong);
            }}
            className="px-5 py-2.5 text-xs font-semibold bg-emerald-500 text-black rounded-lg hover:bg-emerald-400 transition-colors"
          >
            Play Uploaded Track Now
          </button>
          <button
            onClick={() => onSuccess(successSong)}
            className="px-4 py-2.5 text-xs text-zinc-300 hover:text-white rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
          >
            Go to Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">Upload New Song</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Add real audio files (.mp3, .wav, .m4a) to the shared TuneOS MySQL catalog.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Audio File Input Card */}
        <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
          <label className="block text-xs font-semibold text-zinc-200">
            1. Select Audio File (Playable .mp3 or .wav)
          </label>
          <div className="flex items-center gap-4">
            <label className="flex-1 cursor-pointer flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-700 hover:border-emerald-500 rounded-xl bg-zinc-950/60 transition-colors group">
              <Music className="w-8 h-8 text-zinc-500 group-hover:text-emerald-400 transition-colors mb-2" />
              <p className="text-xs font-medium text-zinc-300">
                {audioFile ? audioFile.name : 'Click to select audio from your computer'}
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">
                {audioFile ? `${(audioFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Supports MP3, WAV, OGG, M4A'}
              </p>
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioChange}
                className="hidden"
              />
            </label>
          </div>
          {!audioFile && (
            <p className="text-[11px] text-zinc-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              No local file right now? Leave empty to automatically synthesize high-fidelity legal audio!
            </p>
          )}
        </div>

        {/* Metadata Fields */}
        <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <label className="block text-xs font-semibold text-zinc-200">
            2. Song Information & Categorization
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Song Title *</label>
              <input
                type="text"
                placeholder="e.g. Raabta Acoustic"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1">Artist Name *</label>
              <input
                type="text"
                placeholder="e.g. Arijit Singh"
                value={artist}
                onChange={e => setArtist(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1">Album / EP (optional)</label>
              <input
                type="text"
                placeholder="e.g. Agent Vinod Sessions"
                value={album}
                onChange={e => setAlbum(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1">Category *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as 'Bollywood' | 'Hollywood')}
                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Bollywood">Bollywood</option>
                <option value="Hollywood">Hollywood</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1">Genre *</label>
              <select
                value={genre}
                onChange={e => setGenre(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              >
                {genres.map(g => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1">Language *</label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              >
                {languages.map(l => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1">Release Year</label>
              <input
                type="number"
                min={1950}
                max={2030}
                value={releaseYear}
                onChange={e => setReleaseYear(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1">Cover Artwork (optional)</label>
              <label className="flex items-center gap-2 px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg cursor-pointer hover:border-zinc-500 transition-colors">
                <ImageIcon className="w-4 h-4 text-zinc-400" />
                <span className="text-xs text-zinc-300 truncate">
                  {coverFile ? coverFile.name : 'Choose album cover image'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold bg-emerald-500 text-black rounded-lg hover:bg-emerald-400 disabled:opacity-50 transition-colors shadow-lg shadow-emerald-500/20"
          >
            <Upload className="w-4 h-4 stroke-[2.5]" />
            {isSubmitting ? 'Uploading & Registering...' : 'Upload Song to Library'}
          </button>
        </div>
      </form>
    </div>
  );
};
