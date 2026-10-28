- created the movie-selector-backend project folder
- ran "npm init -y" and installed express, sqlite3, and cors

- built server.js (a server meant to connect to the movies.db,
create a movies table, and serve as a /movies API endpoint)
- can run server locally on port 3000 (currently can only see json data in
this port...)
the html files are still on port 5500 using live server until the pages of JS call "fetch('http://localhost:3000/movies')")


UPDATE NOTRS:
- make sure to have both the live server (frontend) and port 3000 locally
running (backend)
- can start backend by:
    cd movie-selector-backend
    npm start
- can start frontend by:
    live server
- CURRENTLY randomizer page is using the API fetch call

- do CTRL + C to end local server