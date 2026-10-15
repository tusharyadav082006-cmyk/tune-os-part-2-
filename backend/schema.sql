-- ==========================================================
-- TuneOS: MySQL Database Schema and Seed Data
-- Designed for MySQL Workbench / MySQL Server
-- ==========================================================

CREATE DATABASE IF NOT EXISTS tuneos_db;
USE tuneos_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(150) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    favorite_genres VARCHAR(255) DEFAULT 'Romantic,Pop',
    preferred_category ENUM('Bollywood', 'Hollywood', 'All') DEFAULT 'All',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Songs Table
CREATE TABLE IF NOT EXISTS songs (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    artist VARCHAR(150) NOT NULL,
    album VARCHAR(150) DEFAULT 'Single',
    genre VARCHAR(50) NOT NULL,
    language VARCHAR(50) NOT NULL,
    category ENUM('Bollywood', 'Hollywood') NOT NULL,
    release_year INT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    cover_image VARCHAR(500) DEFAULT '',
    uploaded_by VARCHAR(50) DEFAULT 'system',
    play_count INT DEFAULT 0,
    likes_count INT DEFAULT 0,
    avg_rating DECIMAL(3, 2) DEFAULT 0.00,
    ratings_count INT DEFAULT 0,
    duration INT DEFAULT 180,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_genre (genre),
    INDEX idx_artist (artist)
);

-- 3. Likes Table
CREATE TABLE IF NOT EXISTS likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    song_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_song_like (user_id, song_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
);

-- 4. Ratings Table
CREATE TABLE IF NOT EXISTS ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    song_id VARCHAR(50) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_song_rating (user_id, song_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
);

-- 5. Listening History Table
CREATE TABLE IF NOT EXISTS listening_history (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    song_id VARCHAR(50) NOT NULL,
    listened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration_played INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
    INDEX idx_history_user (user_id)
);

-- 6. Playlists Table
CREATE TABLE IF NOT EXISTS playlists (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Playlist Songs Table
CREATE TABLE IF NOT EXISTS playlist_songs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    playlist_id VARCHAR(50) NOT NULL,
    song_id VARCHAR(50) NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_playlist_song (playlist_id, song_id),
    FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
    FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
);

-- 8. User Search History Table
CREATE TABLE IF NOT EXISTS user_search_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    query VARCHAR(255) NOT NULL,
    searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==========================================================
-- Initial Sample Seed Data (Bollywood & Hollywood)
-- ==========================================================

INSERT INTO users (id, username, email, password_hash, name, role, favorite_genres, preferred_category)
VALUES 
('u1', 'rahul_kumar', 'rahul@tuneos.local', '$2b$12$e8k6Gk7zQ...', 'Rahul Kumar', 'user', 'Romantic,Folk', 'Bollywood'),
('u2', 'sophia_miller', 'sophia@tuneos.local', '$2b$12$e8k6Gk7zQ...', 'Sophia Miller', 'user', 'Synthwave,Pop,Lo-Fi', 'Hollywood'),
('u3', 'tushar_admin', 'admin@tuneos.local', '$2b$12$e8k6Gk7zQ...', 'Tushar Yadav (Admin)', 'admin', 'Romantic,Synthwave,Dance', 'All')
ON DUPLICATE KEY UPDATE username=username;

INSERT INTO songs (id, title, artist, album, genre, language, category, release_year, file_path, cover_image, uploaded_by, play_count, likes_count, avg_rating, ratings_count, duration)
VALUES
('s1', 'Tum Hi Ho (Acoustic Reverie)', 'Arijit Vibes', 'Aashiqui Reflections', 'Romantic', 'Hindi', 'Bollywood', 2021, '/audio/tum_hi_ho.wav', '/src/assets/images/bollywood_album_cover_1792096216586.jpg', 'rahul_kumar', 1420, 320, 4.8, 95, 180),
('s2', 'Kesariya Dil', 'Pritam Melodies', 'Brahmastra Echoes', 'Romantic', 'Hindi', 'Bollywood', 2022, '/audio/kesariya_dil.wav', '/src/assets/images/bollywood_album_cover_1792096216586.jpg', 'rahul_kumar', 1890, 410, 4.9, 112, 195),
('s3', 'Desi Beat Explosion', 'DJ Badshah', 'Club Punjabi Heat', 'Dance', 'Punjabi', 'Bollywood', 2023, '/audio/desi_beat.wav', '/src/assets/images/tuneos_hero_banner_1792096216255.jpg', 'tushar_admin', 980, 215, 4.4, 64, 165),
('s4', 'Chaiyya Chords (Sufi Raga)', 'AR Rahman Tribute', 'Dil Se Spirituals', 'Folk', 'Hindi', 'Bollywood', 2020, '/audio/chaiyya_chords.wav', '/src/assets/images/classical_album_cover_1792096215941.jpg', 'tushar_admin', 1250, 280, 4.7, 82, 210),
('s5', 'Kabira Acoustic Strings', 'Tochi & Rekha Ensemble', 'Yeh Jawaani Acoustics', 'Folk', 'Hindi', 'Bollywood', 2019, '/audio/kabira_strings.wav', '/src/assets/images/classical_album_cover_1792096215941.jpg', 'rahul_kumar', 890, 190, 4.6, 55, 190),
('s6', 'Midnight City Lights', 'The Weeknd Style', 'After Dark Mirage', 'Synthwave', 'English', 'Hollywood', 2023, '/audio/midnight_city.wav', '/src/assets/images/hollywood_album_cover_1792096216486.jpg', 'sophia_miller', 2100, 520, 4.9, 140, 175),
('s7', 'Golden Hour Glow', 'JVKE Style', 'Celestial Reveries', 'Pop', 'English', 'Hollywood', 2022, '/audio/golden_hour.wav', '/src/assets/images/bollywood_album_cover_1792096216586.jpg', 'sophia_miller', 1650, 390, 4.8, 98, 195),
('s8', 'As It Was Yesterday', 'Harry Styles Inspired', 'Harrys Sanctuary', 'Pop', 'English', 'Hollywood', 2022, '/audio/as_it_was.wav', '/src/assets/images/tuneos_hero_banner_1792096216255.jpg', 'rahul_kumar', 1470, 340, 4.6, 87, 168),
('s9', 'Sunset Boulevard Lo-Fi', 'Chillhop Beats', 'Pacific Coast Tapes', 'Lo-Fi', 'English', 'Hollywood', 2024, '/audio/sunset_lofi.wav', '/src/assets/images/hollywood_album_cover_1792096216486.jpg', 'sophia_miller', 1120, 260, 4.7, 73, 185),
('s10', 'Neon Cyber Drive', 'Retro Electro', 'Future Grid 2088', 'Synthwave', 'English', 'Hollywood', 2023, '/audio/neon_cyber.wav', '/src/assets/images/hollywood_album_cover_1792096216486.jpg', 'tushar_admin', 1340, 310, 4.5, 69, 192)
ON DUPLICATE KEY UPDATE title=title;
