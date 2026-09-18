- created the movie-selector-backend project folder
- ran "npm init -y" and installed express, sqlite3, and cors

- built server.js (a server meant to connect to the movies.db,
create a movies table, and serve as a /movies API endpoint)
- can run server locally on port 3000 (currently can only see json data in
this port... 
the html files are still on port 5500 until its either moved to backend or 
the pages of JS call "fetch('http://localhost:3000/movies')")
- TODO: make a script to pull real movie data to populate the database