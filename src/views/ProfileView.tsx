import React, { useState } from 'react';
import { User, Shield, Music, Heart, Sparkles, Check, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export const ProfileView: React.FC = () => {
  const { currentUser, allUsers, switchUser, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);

  // New user form
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCategory, setNewCategory] = useState<'Bollywood' | 'Hollywood' | 'All'>('Bollywood');
  const [newGenres, setNewGenres] = useState('Romantic, Pop');
  const [regSuccess, setRegSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newEmail.trim()) return;

    try {
      await register({
        username: newUsername.trim(),
        name: newName.trim() || newUsername.trim(),
        email: newEmail.trim(),
        role: 'user',
        preferred_category: newCategory,
        favorite_genres: newGenres.split(',').map(s => s.trim()).filter(Boolean),
      });
      setRegSuccess(true);
      setIsRegistering(false);
      setTimeout(() => setRegSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Registration failed');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">User Profile & Personas</h1>
        <p className="text-xs text-zinc-400 mt-1">
          TuneOS personalizes recommendations individually for each user account
        </p>
      </div>

      {regSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>New user registered and activated successfully!</span>
        </div>
      )}

      {/* Active User Card */}
      {currentUser && (
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xl">
              {currentUser.name.charAt(0)}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{currentUser.name}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-zinc-800 text-zinc-300">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">@{currentUser.username} · {currentUser.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-zinc-800/80 text-xs">
            <div>
              <span className="text-zinc-500 block mb-1">Preferred Catalog:</span>
              <span className="font-semibold text-emerald-400">{currentUser.preferred_category}</span>
            </div>

            <div>
              <span className="text-zinc-500 block mb-1">Favorite Genres:</span>
              <span className="font-medium text-zinc-200">
                {currentUser.favorite_genres?.join(', ') || 'None set'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Personas Switcher (For Mentor Demonstration) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Switch Demo User Persona</h3>
            <p className="text-xs text-zinc-400">
              Instantly test how the hybrid recommendation algorithm alters the home feed based on user activity
            </p>
          </div>

          <button
            onClick={() => setIsRegistering(prev => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg border border-zinc-700 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            {isRegistering ? 'Cancel Registration' : 'Register New User'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {allUsers.map(user => {
            const isSelected = user.id === currentUser?.id;
            return (
              <button
                key={user.id}
                onClick={() => switchUser(user.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-zinc-800/90 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/20'
                    : 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold text-white">{user.name}</h4>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  )}
                </div>
                <p className="text-[11px] text-zinc-400">Prefers: {user.preferred_category}</p>
                <p className="text-[11px] text-zinc-500 mt-1 truncate">
                  Genres: {user.favorite_genres?.join(', ')}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Register New User Form */}
      {isRegistering && (
        <section className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <h3 className="text-sm font-semibold text-white">Register a New Account</h3>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Username *</label>
                <input
                  type="text"
                  placeholder="e.g. ananya_sharma"
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ananya Sharma"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Email *</label>
                <input
                  type="email"
                  placeholder="e.g. ananya@college.edu"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Music Category Preference</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Bollywood">Bollywood</option>
                  <option value="Hollywood">Hollywood</option>
                  <option value="All">All / Eclectic</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs text-zinc-400 mb-1">Favorite Genres (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Romantic, Folk, Pop"
                  value={newGenres}
                  onChange={e => setNewGenres(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRegistering(false)}
                className="px-4 py-2 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold bg-emerald-500 text-black rounded-lg hover:bg-emerald-400 transition-colors"
              >
                Create Account
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
};
