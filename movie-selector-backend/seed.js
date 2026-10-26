require('dotenv').config();
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// load token from .env
const db = new sqlite3.Database(path.join(__dirname, 'movies.db'));
const headers = { Authorization: `Bearer ${process.env.TMDB_TOKEN}`, accept: 'application/json' };
const IMG_BASE = 'https://image.tmdb.org/t/p/w500';
const PAGES = 10; // 20 movies per page -> ~200 movies

// calls TMDB and returns the JSON response
async function tmdb(endpoint) {
  const res = await fetch(`https://api.themoviedb.org/3${endpoint}`, { headers });
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${await res.text()}`);
  return res.json();
}

// sqlite3 uses callbacks; this wraps db.run so we can await it
function run(sql, params = []) {
  return new Promise((resolve, reject) =>
    db.run(sql, params, function (err) { err ? reject(err) : resolve(this); })
  );
}

async function main() {
  await run(`CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tmdb_id INTEGER UNIQUE,
    title TEXT NOT NULL,
    genre TEXT,
    year INTEGER,
    poster_url TEXT,
    rating REAL,
    overview TEXT
  )`);

  // TMDB gives genre IDs (e.g. 28), so grab the id -> name lookup once
  const { genres } = await tmdb('/genre/movie/list?language=en-US');
  const genreName = Object.fromEntries(genres.map(g => [g.id, g.name]));

  // pulls the pages
  let added = 0;
  for (let page = 1; page <= PAGES; page++) {
    const data = await tmdb(`/movie/popular?language=en-US&page=${page}`);
    for (const m of data.results) {
      if (!m.poster_path || !m.release_date) continue; // skip incomplete entries
      const result = await run(
        `INSERT OR IGNORE INTO movies (tmdb_id, title, genre, year, poster_url, rating, overview)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          m.id,
          m.title,
          m.genre_ids.map(id => genreName[id]).filter(Boolean).join(', '),
          parseInt(m.release_date.slice(0, 4)),
          IMG_BASE + m.poster_path,
          m.vote_average,
          m.overview,
        ]
      );
      added += result.changes;
    }
    console.log(`page ${page} done`);
  }
  console.log(`Added ${added} movies.`);
  db.close();
}

main().catch(err => { console.error(err); db.close(); });