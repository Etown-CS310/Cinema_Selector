// This javascript file will cover the user's library page.

"use strict";

(function () {
    let movieList;
    let searchBar;
    let sortMovies;

    window.addEventListener("load", init);

    function init() {
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
            `<div class="lib-info">
            <div class="lib-poster-wrap">
                <img class="lib-poster" src="${movie.poster}" alt="${movie.title} poster">
            </div>
            <div class="lib-body">
                <div class="lib-movie-header">
                    <div class="title">
                        <h3 class="lib-movie-title">${movie.title}</h3>
                        <span class="lib-details">(${movie.year}) - ${movie.director}</span>
                    </div>
                    <div class="lib-rating">
                        <span class="lib-stars">${movie.rating}/10</span>
                    </div>
                </div>
                <div class="lib-tags">
                    <span class="lib-tag">${movie.genre}</span>
                    <span class="lib-tag ${movie.watched ? "watched" : ""}"> ${movie.watched ? "Watched" : "Unwatched"} </span>
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