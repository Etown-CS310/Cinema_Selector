// This javascript file will cover the user's library page.

"use strict";

(function () {
    const API_BASE = 'http://localhost:3000';

    let allMovies = [];
    let watchedIds = new Set();
    let movieList;
    let searchBar;
    let sortMovies;

    window.addEventListener('load', init);

    function init() {
        if (typeof $ !== 'undefined') {
            $("#navbar").load("navbar.html");
        }

        movieList = document.getElementById("movieList");
        searchBar = document.getElementById("searchBar");
        sortMovies = document.getElementById("sortMovies");

        searchBar.addEventListener("input", updateLibrary);
        sortMovies.addEventListener("change", updateLibrary);
        movieList.addEventListener("click", markWatched);

        loadMovies();
    }

    function loadMovies() {
        Promise.all([
            fetch(`${API_BASE}/movies`).then(res => res.json()),
            fetch(`${API_BASE}/history`).then(res => res.json())
        ])
            .then(([movies, history]) => {
                allMovies = movies;
                watchedIds = new Set(history.map(movie => movie.id));
                buildGenreOptions();
                updateStats();
                updateLibrary();
            })
            .catch(err => {
                console.error("Could not load movies: ", err);
                document.getElementById("movieList").innerHTML =
                    `<p class="text-center">Error with movie backend. Check if backend is running.</p>`;
            });
        /*
        fetch(`${API_BASE}/movies`)
            .then(res => res.json())
            .then(movies => {
                allMovies = movies;
                buildGenreOptions();
                updateStats();
                updateLibrary();
            })
            .catch(err => {
                console.error("Could not load movies: ", err);
                document.getElementById("movieList").innerHTML =
                    `<p class="text-center">Error with movie backend. Check if backend is running.</p>`;
            });
        */
    }

    // true if the movie is in the watch histroy
    function isWatched(movie) {
        return watchedIds.has(movie.id);
    }

    function displayMovies(movies) {
        if (movies.length === 0) {
            movieList.innerHTML = "<p>No movies found in library.</p>";
            return;
        }

        movieList.innerHTML = movies.map(movie =>
            `<div class="card lib-card shadow-sm">
            <div class="card-body d-flex gap-3">
                <div class="lib-poster-wrap rounded overflow-hidden flex-shrink-0">
                    <img class="lib-poster w-100 h-100 object-fit-cover" src="${movie.poster_url}" alt="${movie.title} poster">
                </div>
            <div class="flex-grow-1 min-w-0 d-flex flex-column gap-2">
                <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <div class="d-flex flex-wrap align-items-baseline gap-2">
                        <h3 class="h5 fw-bold mb-0">${movie.title}</h3>
                        <small class="lib-details">(${movie.year})</small>
                    </div>
                    <span class="fw-bold text-warning-emphasis">${Number(movie.rating).toFixed(2)}/10</span>
                </div>
                <div class="d-flex flex-wrap gap-2">
                    ${getGenres(movie).map(g =>
                `<span class="badge rounded-pill text-bg-light border text-capitalize">${g}</span>`
            ).join("")}                    
                    <span class="badge rounded-pill ${isWatched(movie) ? "text-bg-success" : "text-bg-secondary"}">
                        ${isWatched(movie) ? "Watched" : "Unwatched"}
                    </span>
                </div>
                <p class="mb-0">${movie.overview || ""}</p>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-primary watched-btn" data-id="${movie.id}" ${isWatched(movie) ? "disabled" : ""}>Mark as Watched</button>
                </div>
                </div>
            </div>
        </div>`
        ).join('');
    }

    // runs when anything inside movieList is clicked
    function markWatched(event) {
        if (!event.target.classList.contains("watched-btn")) return;

        const button = event.target;
        const movieId = Number(button.dataset.id);
        button.disabled = true;

        fetch(`${API_BASE}/history`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ movie_id: movieId })
        })
        .then(res => {
            if (!res.ok) throw new Error("Request failed");
            watchedIds.add(movieId);
            updateStats();
            updateLibrary();
        })
        .catch(err => {
            console.error("Could not add to history:", err);
            button.disabled = false;
        });
    }

    function updateStats() {
        document.getElementById("totalCount").textContent = allMovies.length;
        document.getElementById("unwatchedCount").textContent = allMovies.filter(movie => !isWatched(movie)).length;
    }

    function buildGenreOptions() {
        const genres = new Set();
        allMovies.forEach(movie => getGenres(movie).forEach(g => genres.add(g)));

        const group = document.querySelector('#sortMovies optgroup[label="By Genre"]');
        group.innerHTML = [...genres].sort().map(g =>
            `<option value="${g}">${g}</option>`
        ).join("");
    }

    function getGenres(movie) {
        if (Array.isArray(movie.genre)) {
            return movie.genre;
        }
        if (typeof movie.genre === "string") {
            return movie.genre.split(",").map(g => g.trim()).filter(Boolean);
        }
        return [];
    }

    function updateLibrary() {
        const query = searchBar.value.toLowerCase().trim();
        const choice = sortMovies.value;

        let results = allMovies.filter(movie =>
            movie.title.toLowerCase().includes(query)
        );

        if (choice === "newest") {
            results.sort((a, b) => b.year - a.year);
        } else if (choice === "oldest") {
            results.sort((a, b) => a.year - b.year);
        } else {
            results = results.filter(movie =>
                getGenres(movie).some(g => g.toLowerCase() === choice.toLowerCase())
            );
        }

        displayMovies(results);
        document.getElementById("searchTotal").textContent = results.length;
    }

})();