import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Music, ArrowUpDown, X } from 'lucide-react';
import { Song, SearchRecommendationsResponse } from '../types.ts';
import { api } from '../services/api.ts';
import { SongCard } from '../components/SongCard.tsx';
import { useAuth } from '../context/AuthContext.tsx';

export const SearchView: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [genre, setGenre] = useState('All');
  const [language, setLanguage] = useState('All');
  const [sort, setSort] = useState('most_played');

  const [songs, setSongs] = useState<Song[]>([]);
  const [searchRecs, setSearchRecs] = useState<SearchRecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const genresList = ['All', 'Romantic', 'Pop', 'Synthwave', 'Folk', 'Dance', 'Lo-Fi'];
  const categoriesList = ['All', 'Bollywood', 'Hollywood'];
  const languagesList = ['All', 'Hindi', 'English', 'Punjabi'];

  const performSearch = async () => {
    try {
      setLoading(true);
      const res = await api.getSongs({
        search: searchTerm,
        category,
        genre,
        language,
        sort,
      });
      setSongs(res);

      // If user typed a search query, fetch intelligent search recommendations
      if (searchTerm.trim().length > 1) {
        const recs = await api.getSearchRecommendations(searchTerm.trim(), currentUser?.id);
        setSearchRecs(recs);
      } else {
        setSearchRecs(null);
      }
    } catch (err) {
      console.error('Failed to search songs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch();
  }, [category, genre, language, sort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchRecs(null);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Search Header & Input */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Search & Discovery</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Explore Bollywood and Hollywood songs by title, artist, album, genre, or language
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by title, artist, album, genre (e.g. 'Tum Hi Ho', 'Arijit', 'Synthwave')..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-28 py-3.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-24 p-1 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-2.5 px-4 py-2 bg-emerald-500 text-black text-xs font-semibold rounded-lg hover:bg-emerald-400 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filter and Sorting Controls */}
      <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Category Tabs (Segmented interactive buttons) */}
          <div className="flex items-center gap-1 p-1 bg-zinc-950 rounded-lg border border-zinc-800">
            {categoriesList.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  category === cat
                    ? 'bg-emerald-500 text-black shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-zinc-400" />
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="most_played">Sort: Most Played</option>
              <option value="most_liked">Sort: Most Liked</option>
              <option value="highest_rated">Sort: Highest Rated</option>
              <option value="newest">Sort: Recently Added</option>
              <option value="alphabetical">Sort: Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Secondary filters: Genres & Languages */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-zinc-800/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">Genre:</span>
            <div className="flex flex-wrap gap-1">
              {genresList.map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGenre(g)}
                  className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                    genre === g
                      ? 'bg-zinc-800 text-emerald-400 font-medium'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-zinc-500">Language:</span>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="px-2.5 py-1 text-xs bg-zinc-950 border border-zinc-800 rounded-md text-zinc-300 focus:outline-none focus:border-emerald-500"
            >
              {languagesList.map(l => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Results Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">
            Matching Tracks ({songs.length})
          </h2>
          {searchTerm && (
            <span className="text-xs text-zinc-400">
              Query: <span className="text-emerald-400">"{searchTerm}"</span>
            </span>
          )}
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-zinc-500">Loading catalog...</div>
        ) : songs.length === 0 ? (
          <div className="py-16 text-center rounded-xl bg-zinc-900/30 border border-dashed border-zinc-800">
            <Music className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-zinc-300">No matching tracks found</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Try adjusting your search query, genre, or category filter
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {songs.map(song => (
              <SongCard key={song.id} song={song} queueContext={songs} />
            ))}
          </div>
        )}
      </section>

      {/* Intelligent Search Recommendations (Section 10.C) */}
      {searchRecs && (
        <div className="space-y-8 pt-6 border-t border-zinc-800">
          {/* 1. More by Artist */}
          {searchRecs.moreByArtist.length > 0 &&
            searchRecs.moreByArtist.map(group => (
              <section key={group.artist} className="space-y-3">
                <h3 className="text-sm font-semibold text-zinc-200">
                  More tracks by <span className="text-emerald-400">{group.artist}</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {group.songs.map(song => (
                    <SongCard
                      key={song.id}
                      song={song}
                      recommendationReason={`Artist discography`}
                    />
                  ))}
                </div>
              </section>
            ))}

          {/* 2. Similar in Genre */}
          {searchRecs.similarInGenre.length > 0 &&
            searchRecs.similarInGenre.map(group => (
              <section key={group.genre} className="space-y-3">
                <h3 className="text-sm font-semibold text-zinc-200">
                  Similar in <span className="text-emerald-400">{group.genre}</span> Genre
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {group.songs.map(song => (
                    <SongCard
                      key={song.id}
                      song={song}
                      recommendationReason={`Similar genre to search`}
                    />
                  ))}
                </div>
              </section>
            ))}

          {/* 3. Popular Related */}
          {searchRecs.popularRelated.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-zinc-200">
                Popular Community Discoveries
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {searchRecs.popularRelated.map(song => (
                  <SongCard
                    key={song.id}
                    song={song}
                    recommendationReason={`High community engagement`}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
