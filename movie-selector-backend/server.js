const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const db = new sqlite3.Database(path.join(__dirname, 'movies.db'));

app.use(cors());
app.use(express.json());


// tables ----------------
db.run(`CREATE TABLE IF NOT EXISTS movies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tmdb_id INTEGER UNIQUE,
  title TEXT NOT NULL,
  genre TEXT,
  year INTEGER,
  poster_url TEXT,
  rating REAL,
  overview TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS watch_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  movie_id INTEGER NOT NULL,
  date_watched TEXT DEFAULT (date('now')),
  FOREIGN KEY (movie_id) REFERENCES movies(id)
)`);

// movies ----------------
app.get('/movies', (req, res) => {
    db.all('SELECT * FROM movies', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// watch history ----------------
// get watch history
app.get('/history', (req, res) => {
  const sql = `
    SELECT movies.*, watch_history.id AS history_id, watch_history.date_watched
    FROM watch_history
    JOIN movies ON watch_history.movie_id = movies.id
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// add movie to watch history
app.post('/history', (req, res) => {
    const {movie_id} = req.body;
    if (!movie_id) return res.status(400).json({error: 'movie_id is required'});

    db.run('INSERT INTO watch_history (movie_id) VALUES (?)', [movie_id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID });
    });
});

app.listen(3000, () => console.log('Server running on port 3000'));