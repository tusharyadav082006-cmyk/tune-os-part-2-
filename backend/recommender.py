"""
TuneOS: Intelligent Hybrid Music Recommendation Engine
-------------------------------------------------------
This module computes personalized song recommendations for users based on:
1. User Listening History (frequency of plays per track & artist)
2. User Likes (explicit positive signals)
3. User Ratings (1-5 star ratings; ratings >= 4 boost, ratings <= 2 penalize)
4. Genre Affinity Vectors (how frequently the user interacts with specific genres)
5. Category Affinity (Bollywood vs Hollywood preference)
6. Community Popularity (normalized play counts & like counts)
7. Diversity / Discovery Penalty (prevents the same track from dominating recommendations)
"""

from typing import List, Dict, Any
from collections import defaultdict

def calculate_hybrid_recommendations(
    user_id: str,
    all_songs: List[Dict[str, Any]],
    user_likes: List[str],
    user_ratings: Dict[str, int],
    user_history: List[Dict[str, Any]],
    user_profile: Dict[str, Any],
    limit: int = 8
) -> Dict[str, Any]:
    """
    Computes a personalized recommendation score for every candidate song in the catalog.
    
    Formula:
      Final Score = W_genre * GenreAffinity 
                  + W_artist * ArtistAffinity 
                  + W_cat * CategoryMatch
                  + W_pop * NormalizedPopularity 
                  + W_rating * (UserRating - 3)
                  - W_diversity * RepeatedPlayPenalty
    """
    if not all_songs:
        return {"recommended": [], "becauseLiked": None, "trendingBollywood": [], "topHollywood": [], "topGenres": []}

    liked_song_ids = set(user_likes)
    
    # 1. Count user plays per song to calculate diversity penalty
    user_play_counts = defaultdict(int)
    for event in user_history:
        user_play_counts[event.get("song_id")] += 1

    # 2. Build Genre and Artist affinity vectors
    genre_affinities = defaultdict(float)
    artist_affinities = defaultdict(float)
    bollywood_score = 0.0
    hollywood_score = 0.0

    # User profile preferences
    preferred_genres = user_profile.get("favorite_genres", [])
    if isinstance(preferred_genres, str):
        preferred_genres = [g.strip() for g in preferred_genres.split(",") if g.strip()]
    for g in preferred_genres:
        genre_affinities[g] += 2.0

    pref_cat = user_profile.get("preferred_category", "All")
    if pref_cat == "Bollywood":
        bollywood_score += 3.0
    elif pref_cat == "Hollywood":
        hollywood_score += 3.0

    # Likes add high explicit weight (+3.0)
    song_map = {s["id"]: s for s in all_songs}
    for sid in liked_song_ids:
        s = song_map.get(sid)
        if s:
            genre_affinities[s["genre"]] += 3.0
            artist_affinities[s["artist"]] += 3.0
            if s["category"] == "Bollywood":
                bollywood_score += 2.0
            else:
                hollywood_score += 2.0

    # Ratings add weighted delta: (stars - 3) * 1.5
    for sid, stars in user_ratings.items():
        s = song_map.get(sid)
        if s:
            delta = (stars - 3) * 1.5
            genre_affinities[s["genre"]] += delta
            artist_affinities[s["artist"]] += delta
            if s["category"] == "Bollywood":
                bollywood_score += 1.0 if delta > 0 else -1.0
            else:
                hollywood_score += 1.0 if delta > 0 else -1.0

    # Listening history adds incremental affinity (+1.0 per play)
    for event in user_history:
        s = song_map.get(event.get("song_id"))
        if s:
            genre_affinities[s["genre"]] += 1.0
            artist_affinities[s["artist"]] += 1.2
            if s["category"] == "Bollywood":
                bollywood_score += 1.0
            else:
                hollywood_score += 1.0

    # Max plays and likes for normalization
    max_plays = max([s.get("play_count", 0) for s in all_songs] + [1])
    max_likes = max([s.get("likes_count", 0) for s in all_songs] + [1])

    # 3. Score all songs
    scored_list = []
    for s in all_songs:
        score = 0.0
        reasons = []

        # Genre affinity
        g_aff = genre_affinities.get(s["genre"], 0.0)
        if g_aff > 0:
            score += g_aff * 1.8
            reasons.append(f"Favorite {s['genre']} genre")

        # Artist affinity
        a_aff = artist_affinities.get(s["artist"], 0.0)
        if a_aff > 0:
            score += a_aff * 2.2
            reasons.append(f"More by {s['artist']}")

        # Category match
        if s["category"] == "Bollywood" and bollywood_score > hollywood_score:
            score += 1.5
        elif s["category"] == "Hollywood" and hollywood_score > bollywood_score:
            score += 1.5

        # Community popularity (0.0 to 3.5)
        pop_score = (s.get("play_count", 0) / max_plays) * 2.0 + (s.get("likes_count", 0) / max_likes) * 1.5
        score += pop_score

        # High average rating bonus
        if s.get("avg_rating", 0) >= 4.5:
            score += 1.0

        # User individual rating
        if s["id"] in user_ratings:
            score += (user_ratings[s["id"]] - 3) * 1.0

        # Diversity penalty: If already heard multiple times, push down slightly
        times_played = user_play_counts.get(s["id"], 0)
        if times_played > 3:
            score -= times_played * 0.8

        reason = reasons[0] if reasons else ("Top community rated track" if s.get("avg_rating", 0) >= 4.5 else "Trending selection")

        scored_list.append({
            "song": s,
            "score": round(score, 2),
            "reason": reason
        })

    # Sort descending by calculated recommendation score
    scored_list.sort(key=lambda x: x["score"], reverse=True)

    # Find "Because You Liked" source song (the most recently liked track)
    because_liked = None
    if user_likes:
        last_liked_id = user_likes[-1]
        source_song = song_map.get(last_liked_id)
        if source_song:
            similar = [
                s for s in all_songs
                if s["id"] != source_song["id"] and (s["genre"] == source_song["genre"] or s["artist"] == source_song["artist"])
            ][:4]
            if similar:
                because_liked = {
                    "sourceSong": source_song,
                    "recommendations": similar
                }

    # Trending playlists
    bollywood_trending = sorted(
        [s for s in all_songs if s["category"] == "Bollywood"],
        key=lambda s: s.get("play_count", 0),
        reverse=True
    )[:5]

    hollywood_trending = sorted(
        [s for s in all_songs if s["category"] == "Hollywood"],
        key=lambda s: s.get("play_count", 0),
        reverse=True
    )[:5]

    top_genres = sorted(genre_affinities.items(), key=lambda item: item[1], reverse=True)
    top_genre_names = [g[0] for g in top_genres[:4]] if top_genres else ["Romantic", "Synthwave", "Pop", "Folk"]

    return {
        "recommended": scored_list[:limit],
        "becauseLiked": because_liked,
        "trendingBollywood": bollywood_trending,
        "topHollywood": hollywood_trending,
        "topGenres": top_genre_names
    }
