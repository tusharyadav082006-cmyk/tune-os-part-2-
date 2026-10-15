# TuneOS — Local Setup and Execution Guide (Windows / VS Code)

Welcome to **TuneOS: OS-Simulated and Database-Engineered Hybrid Music Recommendation Platform**.
This beginner-friendly guide provides exact step-by-step PowerShell commands to run TuneOS locally on your Windows machine with MySQL, FastAPI, and React.

---

## 1. Prerequisites Checklist
Make sure you have installed on Windows:
1. **Python 3.10+** (check with `python --version`)
2. **Node.js 18+** (check with `node -v` and `npm -v`)
3. **MySQL Server** & **MySQL Workbench** (or XAMPP with MySQL running on port 3306)
4. **VS Code**

---

## 2. Step 1: Set Up MySQL Database
1. Open **MySQL Workbench** and connect to your local MySQL instance.
2. Open the file `backend/schema.sql` inside MySQL Workbench.
3. Click the ⚡ **Execute** (Lightning bolt) icon.
   - This creates `tuneos_db` database.
   - Creates all tables: `users`, `songs`, `likes`, `ratings`, `listening_history`, `playlists`, `playlist_songs`, `user_search_history`.
   - Seeds Bollywood and Hollywood songs with real metadata.

4. Configure your database password:
   - Inside `backend/.env`, set your actual MySQL root password:
     ```env
     DB_HOST=127.0.0.1
     DB_PORT=3306
     DB_USER=root
     DB_PASSWORD=your_actual_password_here
     DB_NAME=tuneos_db
     ```

---

## 3. Step 2: Start the Python FastAPI Backend (Terminal 1)

Open **Windows PowerShell** in VS Code (`Terminal -> New Terminal`):

```powershell
# 1. Navigate to the backend directory
cd backend

# 2. Create a Python Virtual Environment
python -m venv venv

# 3. Activate the virtual environment
.\venv\Scripts\Activate.ps1
# (Note: If PowerShell says script execution is restricted, run:
# Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass)

# 4. Install backend dependencies
pip install -r requirements.txt

# 5. Start the FastAPI server
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Your FastAPI backend is now running at:
- **API URL:** `http://127.0.0.1:8000`
- **Interactive Swagger Docs:** `http://127.0.0.1:8000/docs`

---

## 4. Step 3: Start the React Frontend (Terminal 2)

Open a **second terminal tab** in VS Code (`Ctrl + Shift + \`` or `+` icon):

```powershell
# 1. Ensure you are at the project root (where package.json is located)
# 2. Install frontend dependencies
npm install

# 3. Start the Vite development server
npm run dev
```

The frontend will start at:
- **Web App URL:** `http://localhost:3000` (or `http://localhost:5173`)

Open that URL in your browser (Google Chrome or Edge).

---

## 5. Adding Real Playable Audio Files
- You can upload ANY `.mp3`, `.wav`, or `.ogg` file directly from the web interface using the **Upload Song** page (`/upload`).
- The file is saved directly into `backend/uploads/audio/`, and the metadata is recorded in MySQL.
- Any other user logged in can immediately search, like, rate, and stream the song!

---

## 6. How the Recommendation Algorithm Works
TuneOS does **not** pick songs randomly. It computes a personalized numerical score for every candidate song based on:
1. **Genre Affinity (Weight: 1.8x)**: Analyzes the user's explicit likes and listening frequency in specific genres.
2. **Artist Affinity (Weight: 2.2x)**: Boosts tracks by artists the user frequently listens to.
3. **Category Affinity (1.5x)**: Respects user preference for Bollywood vs Hollywood music.
4. **Community Popularity (0.0 to 3.5)**: Normalized play counts and total likes.
5. **Rating Signal**: Boosts songs rated 4 or 5 stars; penalizes songs rated 1 or 2 stars.
6. **Diversity Penalty (-0.8x per repeated play)**: If a user has played a song > 3 times recently, the algorithm surfaces fresh discoveries.

---

## 7. How the OS Simulation Integrates with Audio
In operating systems, streaming music without audio crackling (buffer underrun) requires precise CPU scheduling of audio decoding threads, background metadata scrapers, and recommendation batch jobs.
TuneOS includes an interactive **OS Simulation Lab** allowing you to:
- Test **FCFS**, **SJF**, **Priority**, and **Round Robin** scheduling.
- Visualize execution intervals on an interactive **Gantt Chart**.
- Inspect exact Turnaround Time (TAT) and Waiting Time (WT) calculations.
- View real-time audio pipeline presets.
