// This javascript file will cover the user's library page.

"use strict";

(function () {
    let movieList;
    let searchBar;
    let sortMovies;

    window.addEventListener("load", init);

    function init() {
        $("#navbar").load("navbar.html");

        movieList = document.getElementById("movieList");
        searchBar = document.getElementById("searchBar");
        sortMovies = document.getElementById("sortMovies");

        searchBar.addEventListener("input", updateLibrary);
        sortMovies.addEventListener("change", updateLibrary);

        updateStats();
        updateLibrary();
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
                    <img class="lib-poster w-100 h-100 object-fit-cover" src="${movie.poster}" alt="${movie.title} poster">
                </div>
            <div class="flex-grow-1 min-w-0 d-flex flex-column gap-2">
                <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <div class="d-flex flex-wrap align-items-baseline gap-2">
                        <h3 class="h5 fw-bold mb-0">${movie.title}</h3>
                        <small class="lib-details">(${movie.year}) - ${movie.director}</small>
                    </div>
                    <span class="fw-bold text-warning-emphasis">${movie.rating}/10</span>
                </div>
                <div class="d-flex flex-wrap gap-2">
                    <span class="badge rounded-pill text-bg-light border text-capitalize">${movie.genre}</span>
                    <span class="badge rounded-pill ${movie.watched ? "text-bg-success" : "text-bg-secondary"}">
                        ${movie.watched ? "Watched" : "Unwatched"}
                    </span>
                    </div>
                </div>
            </div>
        </div>`
        ).join("");
    }

    function updateStats() {
        document.getElementById("totalCount").textContent = movieInventory.length;
        document.getElementById("unwatchedCount").textContent = movieInventory.filter(movie => !movie.watched).length;
    }

    function updateLibrary() {
        const query = searchBar.value.toLowerCase().trim();
        const choice = sortMovies.value;

        let results = movieInventory.filter(movie =>
            movie.title.toLowerCase().includes(query) ||
            movie.director.toLowerCase().includes(query)
        );

        if (choice === "newest") {
            results.sort((a, b) => b.year - a.year);
        } else if (choice === "oldest") {
            results.sort((a, b) => a.year - b.year);
        } else {
            results = results.filter(movie => movie.genre === choice);
        }

        displayMovies(results);
    }

})();