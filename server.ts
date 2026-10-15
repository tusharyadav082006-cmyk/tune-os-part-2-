import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dataStore, ProcessJob, Song } from './server/dataStore.js';
import { ensureSampleAudioFiles } from './server/audioGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

// Ensure public directories exist
const publicDir = path.join(__dirname, 'public');
const uploadDir = path.join(publicDir, 'uploads');
const audioUploadDir = path.join(uploadDir, 'audio');
const coversUploadDir = path.join(uploadDir, 'covers');

fs.mkdirSync(audioUploadDir, { recursive: true });
fs.mkdirSync(coversUploadDir, { recursive: true });

// Ensure seed audio files exist
ensureSampleAudioFiles(publicDir);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from public folder
app.use(express.static(publicDir));
app.use('/uploads', express.static(uploadDir));
app.use('/src/assets/images', express.static(path.join(__dirname, 'src/assets/images')));

// Multer storage for user audio and cover uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'audio') {
      cb(null, audioUploadDir);
    } else {
      cb(null, coversUploadDir);
    }
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1e6);
    cb(null, `${uniqueSuffix}_${cleanName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
});

// ================= API ROUTES =================

// Authentication endpoints
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username } = req.body;
  const user = dataStore.users.find(
    u => u.username.toLowerCase() === (username || '').toLowerCase() || u.id === username
  );
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }
  return res.json({ user, token: 'session_' + user.id });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { username, name, email, role, favorite_genres, preferred_category } = req.body;
  if (!username || !email) {
    return res.status(400).json({ error: 'Username and email are required' });
  }

  const existing = dataStore.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'Username already taken' });
  }

  const newUser = {
    id: 'u_' + Date.now(),
    username,
    email,
    name: name || username,
    role: role === 'admin' ? ('admin' as const) : ('user' as const),
    favorite_genres: favorite_genres || ['Romantic', 'Pop'],
    preferred_category: (preferred_category || 'Bollywood') as 'Bollywood' | 'Hollywood' | 'All',
  };

  dataStore.users.push(newUser);
  return res.status(201).json({ user: newUser, token: 'session_' + newUser.id });
});

app.get('/api/auth/users', (req: Request, res: Response) => {
  return res.json(dataStore.users);
});

// Song catalog & filtering
app.get('/api/songs', (req: Request, res: Response) => {
  const { category, genre, language, search, sort } = req.query;
  const songs = dataStore.getAllSongs({
    category: category as string,
    genre: genre as string,
    language: language as string,
    search: search as string,
    sort: sort as string,
  });
  return res.json(songs);
});

app.get('/api/songs/:id', (req: Request, res: Response) => {
  const song = dataStore.getSongById(req.params.id);
  if (!song) {
    return res.status(404).json({ error: 'Song not found' });
  }
  return res.json(song);
});

// Upload song (Real audio upload)
app.post(
  '/api/songs/upload',
  upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
  ]),
  (req: Request, res: Response) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const {
        title,
        artist,
        album,
        genre,
        language,
        category,
        release_year,
        uploaded_by,
        customAudioUrl,
      } = req.body;

      if (!title || !artist) {
        return res.status(400).json({ error: 'Title and artist are required' });
      }

      let filePath = '';
      if (files?.audio && files.audio.length > 0) {
        filePath = `/uploads/audio/${files.audio[0].filename}`;
      } else if (customAudioUrl) {
        filePath = customAudioUrl;
      } else {
        // Default to sample track if no audio uploaded
        filePath = '/audio/tum_hi_ho.wav';
      }

      let coverImage = '/src/assets/images/bollywood_album_cover_1792096216586.jpg';
      if (files?.cover && files.cover.length > 0) {
        coverImage = `/uploads/covers/${files.cover[0].filename}`;
      } else if (category === 'Hollywood') {
        coverImage = '/src/assets/images/hollywood_album_cover_1792096216486.jpg';
      }

      const newSong: Song = {
        id: 's_' + Date.now(),
        title: title.trim(),
        artist: artist.trim(),
        album: (album || 'Single').trim(),
        genre: genre || 'Pop',
        language: language || 'Hindi',
        category: (category === 'Hollywood' ? 'Hollywood' : 'Bollywood') as 'Bollywood' | 'Hollywood',
        release_year: parseInt(release_year, 10) || new Date().getFullYear(),
        file_path: filePath,
        cover_image: coverImage,
        uploaded_by: uploaded_by || 'rahul_kumar',
        play_count: 0,
        likes_count: 0,
        avg_rating: 0,
        ratings_count: 0,
        duration: 180,
        created_at: new Date().toISOString(),
      };

      dataStore.songs.unshift(newSong);
      return res.status(201).json(newSong);
    } catch (err: any) {
      console.error('Error uploading song:', err);
      return res.status(500).json({ error: 'Failed to upload song: ' + err.message });
    }
  }
);

// Song interaction: Like toggle
app.post('/api/songs/:id/like', (req: Request, res: Response) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  const result = dataStore.toggleLike(userId, req.params.id);
  return res.json(result);
});

// Song interaction: Rate 1-5 stars
app.post('/api/songs/:id/rate', (req: Request, res: Response) => {
  const { userId, rating } = req.body;
  if (!userId || rating === undefined) {
    return res.status(400).json({ error: 'userId and rating are required' });
  }
  const result = dataStore.rateSong(userId, req.params.id, Number(rating));
  return res.json(result);
});

// Song interaction: Record listening play
app.post('/api/songs/:id/play', (req: Request, res: Response) => {
  const { userId, durationPlayed } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  dataStore.recordListeningEvent(userId, req.params.id, Number(durationPlayed || 10));
  const song = dataStore.getSongById(req.params.id);
  return res.json({ success: true, play_count: song?.play_count || 0 });
});

// Recommendations: Home feed
app.get('/api/recommendations', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'u1';
  const recs = dataStore.getPersonalizedRecommendations(userId);
  return res.json(recs);
});

// Recommendations: Search related
app.get('/api/search/recommendations', (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  const userId = req.query.userId as string;
  const result = dataStore.getSearchRecommendations(query, userId);
  return res.json(result);
});

// User listening history
app.get('/api/history', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'u1';
  const history = dataStore.getUserHistory(userId);
  return res.json(history);
});

app.delete('/api/history', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'u1';
  dataStore.clearUserHistory(userId);
  return res.json({ success: true });
});

// User likes list
app.get('/api/likes', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'u1';
  const likedSongIds = dataStore.getUserLikedSongIds(userId);
  const likedSongs = dataStore.songs.filter(s => likedSongIds.includes(s.id));
  return res.json(likedSongs);
});

// User ratings map
app.get('/api/ratings', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'u1';
  const ratings = dataStore.getUserRatings(userId);
  return res.json(ratings);
});

// Playlists
app.get('/api/playlists', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'u1';
  const playlists = dataStore.getUserPlaylists(userId);
  return res.json(playlists);
});

app.post('/api/playlists', (req: Request, res: Response) => {
  const { userId, name, description } = req.body;
  if (!userId || !name) return res.status(400).json({ error: 'userId and name required' });
  const pl = dataStore.createPlaylist(userId, name, description || '');
  return res.status(201).json(pl);
});

app.post('/api/playlists/:id/songs', (req: Request, res: Response) => {
  const { songId } = req.body;
  if (!songId) return res.status(400).json({ error: 'songId required' });
  const ok = dataStore.addSongToPlaylist(req.params.id, songId);
  return res.json({ success: ok });
});

app.delete('/api/playlists/:id/songs/:songId', (req: Request, res: Response) => {
  const ok = dataStore.removeSongFromPlaylist(req.params.id, req.params.songId);
  return res.json({ success: ok });
});

app.delete('/api/playlists/:id', (req: Request, res: Response) => {
  const userId = req.body.userId || (req.query.userId as string);
  const ok = dataStore.deletePlaylist(req.params.id, userId);
  return res.json({ success: ok });
});

// OS Scheduling Simulation API
app.post('/api/os/simulate', (req: Request, res: Response) => {
  const { algorithm, jobs, quantum } = req.body as {
    algorithm: 'FCFS' | 'SJF' | 'Priority' | 'RoundRobin';
    jobs: ProcessJob[];
    quantum?: number;
  };

  if (!algorithm || !Array.isArray(jobs)) {
    return res.status(400).json({ error: 'algorithm and jobs array are required' });
  }

  const result = dataStore.simulateOSScheduling(algorithm, jobs, quantum || 2);
  return res.json(result);
});

// Admin stats & moderation
app.get('/api/admin/stats', (req: Request, res: Response) => {
  const totalPlays = dataStore.songs.reduce((acc, s) => acc + s.play_count, 0);
  const totalLikes = dataStore.songs.reduce((acc, s) => acc + s.likes_count, 0);
  return res.json({
    totalSongs: dataStore.songs.length,
    totalUsers: dataStore.users.length,
    totalPlays,
    totalLikes,
    totalPlaylists: dataStore.playlists.length,
    systemUptime: process.uptime(),
    nodeVersion: process.version,
  });
});

app.delete('/api/admin/songs/:id', (req: Request, res: Response) => {
  const ok = dataStore.deleteSong(req.params.id);
  return res.json({ success: ok });
});

// Start Express server and connect Vite
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TuneOS server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
