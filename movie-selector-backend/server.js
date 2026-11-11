const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const db = new sqlite3.Database(path.join(__dirname, 'movies.db'));

app.use(cors());
app.use(express.json());

// TODO: replace with the logged-in user's id once login works
const TEMP_USER_ID = 1;


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
  FOREIGN KEY (movie_id) REFERENCES movies(id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
)`);
// ^ will need to add a line above; user_id INTEGER NOT NULL,

// UNCOMMENT THIS AND RUN IT ONCE! THEN COMMENT IT BACK...
// db.run(`ALTER TABLE watch_history ADD COLUMN user_id INTEGER NOT NULL DEFAULT 0`);

db.run(`CREATE TABLE IF NOT EXISTS users (
  user_id INTEGER PRIMARY KEY AUTOINCREMENT,
  email VARCHAR(45),
  password VARCHAR(25)
  )`);

// Need to double check that this is the information we want and that it can work with the users information we have.
db.run(`CREATE TABLE IF NOT EXISTS preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    genre1 VARCHAR(25),
    genre2 VARCHAR(25),
    genre3 VARCHAR(25),
    rating INTEGER,
    familyFriendly BOOLEAN NOT NULL,
    includeWatched BOOLEAN NOT NULL
)`);
// removed the line; certification VARCHAR(5)

db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_preferences_user ON preferences(user_id)`);

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

// remove movie from watch history
app.delete('/history/:id', (req, res) => {
  db.run('DELETE FROM watch_history WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'History entry not found'});
    res.json({message: 'Removed from history'});
  });
});

// get preferences
app.get('/preferences', (req, res) => {
  db.get('SELECT * FROM preferences WHERE user_id = ?', [TEMP_USER_ID], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row || {}); // empty object if nothing saved yet
  });
});

// save preferences - creates the row the first time, then updates it after
app.put('/preferences', (req, res) => {
  const { genre1, genre2, genre3, certification, rating, familyFriendly, includeWatched } = req.body;

  const sql = `
    INSERT INTO preferences (user_id, genre1, genre2, genre3, certification, rating, familyFriendly, includeWatched)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      genre1 = excluded.genre1,
      genre2 = excluded.genre2,
      genre3 = excluded.genre3,
      certification = excluded.certification,
      rating = excluded.rating,
      familyFriendly = excluded.familyFriendly,
      includeWatched = excluded.includeWatched
  `;

  const params = [
    TEMP_USER_ID,
    genre1 || null, genre2 || null, genre3 || null,
    certification || null,
    rating || 0,
    familyFriendly ? 1 : 0,
    includeWatched ? 1 : 0
  ];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Preferences saved' });
  });
});

app.listen(3000, () => console.log('Server running on port 3000'));