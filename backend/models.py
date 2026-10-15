"""
TuneOS: Data Schemas (Pydantic Models)
Beginner-friendly data models for request and response validation in FastAPI.
"""

from typing import List, Optional
from pydantic import BaseModel, Field

# --- User & Auth Models ---
class UserBase(BaseModel):
    username: str
    email: str
    name: str
    role: str = "user"
    favorite_genres: Optional[List[str]] = ["Romantic", "Pop"]
    preferred_category: Optional[str] = "All"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: str

# --- Song Models ---
class SongBase(BaseModel):
    title: str
    artist: str
    album: Optional[str] = "Single"
    genre: str
    language: str
    category: str  # 'Bollywood' or 'Hollywood'
    release_year: int
    cover_image: Optional[str] = ""

class SongResponse(SongBase):
    id: str
    file_path: str
    uploaded_by: str
    play_count: int = 0
    likes_count: int = 0
    avg_rating: float = 0.0
    ratings_count: int = 0
    duration: int = 180
    created_at: str

# --- Like and Rating Models ---
class LikeRequest(BaseModel):
    userId: str

class RatingRequest(BaseModel):
    userId: str
    rating: int = Field(..., ge=1, le=5)

class PlayRecordRequest(BaseModel):
    userId: str
    durationPlayed: int = 10

# --- Playlist Models ---
class PlaylistCreate(BaseModel):
    userId: str
    name: str
    description: Optional[str] = ""

class PlaylistAddSong(BaseModel):
    songId: str

# --- OS Simulation Models ---
class ProcessJobModel(BaseModel):
    pid: str
    process_name: str
    arrival_time: int
    burst_time: int
    priority: int = 1

class OSSimulationRequest(BaseModel):
    algorithm: str  # 'FCFS', 'SJF', 'Priority', 'RoundRobin'
    jobs: List[ProcessJobModel]
    quantum: Optional[int] = 2
