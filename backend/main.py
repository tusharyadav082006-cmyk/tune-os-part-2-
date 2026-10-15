"""
TuneOS: Main FastAPI Server Entrypoint
--------------------------------------
Connects React frontend with MySQL database, audio storage,
hybrid recommendation algorithms, and OS process scheduling simulation.
"""

import os
import shutil
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from mysql.connector import Error

from database import get_db_connection, init_connection_pool
from models import (
    UserCreate, UserLogin, LikeRequest, RatingRequest,
    PlayRecordRequest, PlaylistCreate, PlaylistAddSong, OSSimulationRequest
)
from recommender import calculate_hybrid_recommendations
from os_scheduler import simulate_scheduling

app = FastAPI(
    title="TuneOS Backend API",
    description="OS-Simulated & Database-Engineered Hybrid Music Recommendation Platform",
    version="1.0.0"
)

# Configure CORS for Vite development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure storage directories exist
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
AUDIO_DIR = os.path.join(UPLOAD_DIR, "audio")
COVERS_DIR = os.path.join(UPLOAD_DIR, "covers")
os.makedirs(AUDIO_DIR, exist_ok=True)
os.makedirs(COVERS_DIR, exist_ok=True)

# Mount static uploads
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.on_event("startup")
def on_startup():
    print("[TuneOS] Starting FastAPI backend server...")
    try:
        init_connection_pool()
    except Exception as e:
        print("[TuneOS] Warning: MySQL connection not initialized at boot. Will retry on request.", e)

# ----------------- AUTHENTICATION -----------------

@app.post("/api/auth/register")
def register_user(user: UserCreate):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id FROM users WHERE username = %s OR email = %s", (user.username, user.email))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Username or email already exists")

        new_id = f"u_{int(os.times().system * 1000)}"
        genres_str = ",".join(user.favorite_genres) if user.favorite_genres else "Romantic,Pop"
        
        # Simple secure store (in production use bcrypt)
        fake_hash = f"hash_{user.password}"

        cursor.execute(
            """
            INSERT INTO users (id, username, email, password_hash, name, role, favorite_genres, preferred_category)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (new_id, user.username, user.email, fake_hash, user.name, user.role, genres_str, user.preferred_category)
        )
        conn.commit()
        return {"user": {**user.dict(exclude={"password"}), "id": new_id}, "token": f"session_{new_id}"}
    finally:
        cursor.close()
        conn.close()

@app.post("/api/auth/login")
def login_user(creds: UserLogin):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM users WHERE username = %s", (creds.username,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid username or password")
        
        user.pop("password_hash", None)
        if isinstance(user.get("favorite_genres"), str):
            user["favorite_genres"] = user["favorite_genres"].split(",")
        return {"user": user, "token": f"session_{user['id']}"}
    finally:
        cursor.close()
        conn.close()

@app.get("/api/auth/users")
def get_users():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id, username, email, name, role, favorite_genres, preferred_category FROM users")
        users = cursor.fetchall()
        for u in users:
            if isinstance(u.get("favorite_genres"), str):
                u["favorite_genres"] = u["favorite_genres"].split(",")
        return users
    finally:
        cursor.close()
        conn.close()

# ----------------- SONGS & PLAYLISTS -----------------

@app.get("/api/songs")
def list_songs(
    category: Optional[str] = None,
    genre: Optional[str] = None,
    language: Optional[str] = None,
    search: Optional[str] = None,
    sort: Optional[str] = None
):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = "SELECT * FROM songs WHERE 1=1"
        params = []

        if category and category != "All":
            query += " AND category = %s"
            params.append(category)
        if genre and genre != "All":
            query += " AND genre = %s"
            params.append(genre)
        if language and language != "All":
            query += " AND language = %s"
            params.append(language)
        if search and search.strip():
            query += " AND (title LIKE %s OR artist LIKE %s OR album LIKE %s OR genre LIKE %s)"
            pattern = f"%{search.strip()}%"
            params.extend([pattern, pattern, pattern, pattern])

        if sort == "most_played":
            query += " ORDER BY play_count DESC"
        elif sort == "most_liked":
            query += " ORDER BY likes_count DESC"
        elif sort == "highest_rated":
            query += " ORDER BY avg_rating DESC, ratings_count DESC"
        elif sort == "newest":
            query += " ORDER BY created_at DESC"
        elif sort == "alphabetical":
            query += " ORDER BY title ASC"
        else:
            query += " ORDER BY id ASC"

        cursor.execute(query, tuple(params))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@app.get("/api/songs/{song_id}")
def get_song(song_id: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM songs WHERE id = %s", (song_id,))
        song = cursor.fetchone()
        if not song:
            raise HTTPException(status_code=404, detail="Song not found")
        return song
    finally:
        cursor.close()
        conn.close()

@app.post("/api/songs/upload")
def upload_song(
    title: str = Form(...),
    artist: str = Form(...),
    album: Optional[str] = Form("Single"),
    genre: str = Form("Pop"),
    language: str = Form("Hindi"),
    category: str = Form("Bollywood"),
    release_year: int = Form(2024),
    uploaded_by: str = Form("user"),
    audio: Optional[UploadFile] = File(None),
    cover: Optional[UploadFile] = File(None)
):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        new_id = f"s_{int(os.times().system * 1000)}"
        audio_path = "/audio/tum_hi_ho.wav"
        cover_path = "/src/assets/images/bollywood_album_cover_1792096216586.jpg"

        if audio:
            filename = f"{new_id}_{audio.filename.replace(' ', '_')}"
            dest = os.path.join(AUDIO_DIR, filename)
            with open(dest, "wb") as f:
                shutil.copyfileobj(audio.file, f)
            audio_path = f"/uploads/audio/{filename}"

        if cover:
            cover_filename = f"{new_id}_{cover.filename.replace(' ', '_')}"
            cover_dest = os.path.join(COVERS_DIR, cover_filename)
            with open(cover_dest, "wb") as f:
                shutil.copyfileobj(cover.file, f)
            cover_path = f"/uploads/covers/{cover_filename}"

        cursor.execute(
            """
            INSERT INTO songs (id, title, artist, album, genre, language, category, release_year, file_path, cover_image, uploaded_by)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (new_id, title, artist, album, genre, language, category, release_year, audio_path, cover_path, uploaded_by)
        )
        conn.commit()
        cursor.execute("SELECT * FROM songs WHERE id = %s", (new_id,))
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

# ----------------- INTERACTIONS (LIKE, RATE, PLAY) -----------------

@app.post("/api/songs/{song_id}/like")
def toggle_like(song_id: str, req: LikeRequest):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id FROM likes WHERE user_id = %s AND song_id = %s", (req.userId, song_id))
        existing = cursor.fetchone()

        if existing:
            cursor.execute("DELETE FROM likes WHERE user_id = %s AND song_id = %s", (req.userId, song_id))
            cursor.execute("UPDATE songs SET likes_count = GREATEST(0, likes_count - 1) WHERE id = %s", (song_id,))
            liked = False
        else:
            cursor.execute("INSERT INTO likes (user_id, song_id) VALUES (%s, %s)", (req.userId, song_id))
            cursor.execute("UPDATE songs SET likes_count = likes_count + 1 WHERE id = %s", (song_id,))
            liked = True

        conn.commit()
        cursor.execute("SELECT likes_count FROM songs WHERE id = %s", (song_id,))
        song = cursor.fetchone()
        return {"liked": liked, "totalLikes": song["likes_count"] if song else 0}
    finally:
        cursor.close()
        conn.close()

@app.post("/api/songs/{song_id}/rate")
def rate_song(song_id: str, req: RatingRequest):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            INSERT INTO ratings (user_id, song_id, rating)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE rating = VALUES(rating)
            """,
            (req.userId, song_id, req.rating)
        )
        # Recalculate average
        cursor.execute("SELECT AVG(rating) as avg_r, COUNT(id) as count_r FROM ratings WHERE song_id = %s", (song_id,))
        stats = cursor.fetchone()
        avg_rating = round(float(stats["avg_r"]), 1) if stats["avg_r"] else 0.0
        ratings_count = stats["count_r"]

        cursor.execute("UPDATE songs SET avg_rating = %s, ratings_count = %s WHERE id = %s", (avg_rating, ratings_count, song_id))
        conn.commit()
        return {"userRating": req.rating, "avgRating": avg_rating, "ratingsCount": ratings_count}
    finally:
        cursor.close()
        conn.close()

@app.post("/api/songs/{song_id}/play")
def record_play(song_id: str, req: PlayRecordRequest):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        new_id = f"h_{int(os.times().system * 1000)}"
        cursor.execute("INSERT INTO listening_history (id, user_id, song_id, duration_played) VALUES (%s, %s, %s, %s)",
                       (new_id, req.userId, song_id, req.durationPlayed))
        cursor.execute("UPDATE songs SET play_count = play_count + 1 WHERE id = %s", (song_id,))
        conn.commit()
        return {"success": True}
    finally:
        cursor.close()
        conn.close()

# ----------------- RECOMMENDATIONS -----------------

@app.get("/api/recommendations")
def get_recommendations(userId: str = "u1"):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM songs")
        all_songs = cursor.fetchall()

        cursor.execute("SELECT song_id FROM likes WHERE user_id = %s", (userId,))
        likes = [r["song_id"] for r in cursor.fetchall()]

        cursor.execute("SELECT song_id, rating FROM ratings WHERE user_id = %s", (userId,))
        ratings = {r["song_id"]: r["rating"] for r in cursor.fetchall()}

        cursor.execute("SELECT song_id FROM listening_history WHERE user_id = %s ORDER BY listened_at DESC LIMIT 50", (userId,))
        history = cursor.fetchall()

        cursor.execute("SELECT favorite_genres, preferred_category FROM users WHERE id = %s", (userId,))
        user_prof = cursor.fetchone() or {"favorite_genres": "Romantic,Pop", "preferred_category": "All"}

        recs = calculate_hybrid_recommendations(userId, all_songs, likes, ratings, history, user_prof)
        return recs
    finally:
        cursor.close()
        conn.close()

# ----------------- OS SCHEDULER SIMULATION -----------------

@app.post("/api/os/simulate")
def run_os_simulation(req: OSSimulationRequest):
    jobs_dict = [j.dict() for j in req.jobs]
    result = simulate_scheduling(req.algorithm, jobs_dict, req.quantum or 2)
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
