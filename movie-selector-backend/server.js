const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const dotenv = require('dotenv');
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(require('./serviceAccountKey.json')),
});

function getToken(req){
  const h = req.headers.authorization || '';
  return h.startsWith('Bearer') ? h.slice(7) : null;
}

async function requireAuth(req, res, next){
  const token = getToken(req);
  if(!token){
     return res.status(401).json({ error: 'Missing Token'});
  }
  try{
    const decoded = await admin.auth().verifyIdToken(token);
    db.get('SELECT user_id FROM users WHERE firebase_uid = ?', [decoded.uid], (err, row) => {
      if(err) return res.status(500).json({error: err.message});
      if(!row) return res.status(404).json({error: 'User not synced yet'});
      req.userId = row.user_id;
      next();
    });
  } catch {
    res.status(401).json({error: 'Invalid token'});
  }
}

dotenv.config();
const app = express();
const db = new sqlite3.Database(path.join(__dirname, 'movies.db'));

app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500']
}));
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
  user_id INTEGER NOT NULL DEFAULT 0,
  date_watched TEXT DEFAULT (date('now')),
  FOREIGN KEY (movie_id) REFERENCES movies(id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
)`);
// ^ will need to add a line above; user_id INTEGER NOT NULL,

// UNCOMMENT THIS AND RUN IT ONCE! THEN COMMENT IT BACK...
// db.run(`ALTER TABLE watch_history ADD COLUMN user_id INTEGER NOT NULL DEFAULT 0`);

//firebase won't give us passwords so if possible they should stay stored there for privacy.
db.run(`CREATE TABLE IF NOT EXISTS users (
  user_id INTEGER PRIMARY KEY AUTOINCREMENT,
  firebase_uid TEXT,
  email TEXT,
  display_name TEXT
  )`);

db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid)`);

//UNCOMMENT these lines and run them once to update users table, then recomment them
//You will get an error but it should still update the db
// db.run(`ALTER TABLE users ADD COLUMN firebase_uid TEXT`, () => {});
// db.run(`ALTER TABLE users ADD COLUMN display_name TEXT`, () => {});


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

//firebase login
app.get('/api/firebase-config', (req, res) => {
  res.json({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  });
});

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
  const { genre1, genre2, genre3, rating, familyFriendly, includeWatched } = req.body;

  const sql = `
    INSERT INTO preferences (user_id, genre1, genre2, genre3, rating, familyFriendly, includeWatched)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      genre1 = excluded.genre1,
      genre2 = excluded.genre2,
      genre3 = excluded.genre3,
      rating = excluded.rating,
      familyFriendly = excluded.familyFriendly,
      includeWatched = excluded.includeWatched
  `;

  const params = [
    TEMP_USER_ID,
    genre1 || null, genre2 || null, genre3 || null,
    rating || 0,
    familyFriendly ? 1 : 0,
    includeWatched ? 1 : 0
  ];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Preferences saved' });
  });
});

app.post('/api/users/sync', async (req, res) => {
  const token = getToken(req);
  if(!token) return res.status(401).json({error: 'Missing token'});
  try{
    const decoded = await admin.auth().verifyIdToken(token);
    const sql = `
      INSERT INTO users (firebase_uid, email, display_name)
      VALUES (?, ?, ?)
      ON CONFLICT(firebase_uid) DO UPDATE SET
        email = excluded.email,
        display_name = excluded.display_name
    `;
    db.run(sql, [decoded.uid, decoded.email || null, decoded.name || null], (err) => {
      if(err) return res.status(500).json({error: err.message});
      db.get('SELECT user_id FROM users WHERE firebase_uid = ?', [decoded.uid], (e, row) => {
        if(e) return res.status(500).json({error: e.message});
        res.json({user_id: row.user_id});
      });
    });
  } catch {
    res.status(401).json({error: 'Invalid token'});
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));