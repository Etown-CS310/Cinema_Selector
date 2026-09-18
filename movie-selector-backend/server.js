const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const db = new sqlite3.Database('./movies.db');

app.use(cors());
app.use(express.json());
// app.use(express.static('public'));

db.run(`CREATE TABLE IF NOT EXISTS movies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  genre TEXT,
  year INTEGER,
  poster_url TEXT,
  rating REAL
)`);

// currently just serving the /movies API
app.get('/movies', (req, res) => {
    db.all('SELECT * FROM movies', [], (err, rows) => {
        if (err) return res.status(500).json({error: err.message});
        res.json(rows);
    });
});

app.listen(3000, () => console.log('Server running on port 3000'));