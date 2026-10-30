// This file takes care of the JS on the randomizer/index page.

// TODO: replace this with a real fetch() once database is in place
// for now, posters are shown through URLs

$("#navbar").load("navbar.html");

const API_BASE = 'http://localhost:3000';
let allMovies = []; // filled once from backend

function starsForRating(rating) {
    const full = Math.round(rating / 2);
    return "★".repeat(full) + "☆".repeat(5 - full);
}

/*
function getRandomMovies(count) {
    const shuffled = [...movieInventory].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}
    */

function getRandomMovies(count) {
    const shuffled = [...allMovies].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}


/*
function renderMovies() {
    const container = document.getElementById("movie-container");
    const picks = getRandomMovies(3);

    // same bootstrapping as watch history
    container.innerHTML = picks.map(movie => `
        <div class="col-md-4 mb-4">
            <div class="card history-card h-100 shadow sm">
                <img src="${movie.poster}" alt="${movie.title} poster" class="card-img-top history-poster">
                <div class="card-body">
                    <h5 class="card-title movie-title">${movie.title}</h5>
                    <p class="card-text mb-1">(${movie.year}) - ${movie.director}</p>
                    <p class="card-text stars">${starsForRating(movie.rating)}
                    <span class="rating-number">${movie.rating.toFixed(1)}/10</span></p>
                </div>
            </div>
        </div>
   `).join("");
}
   */

function renderMovies() {
    const container = document.getElementById("movie-container");
    const picks = getRandomMovies(3);

    // same bootstrapping as watch history
    container.innerHTML = picks.map(movie => `
        <div class="col-md-4 mb-4">
            <div class="card history-card h-100 shadow sm">
                <img src="${movie.poster_url}" alt="${movie.title} poster" class="card-img-top history-poster">
                <div class="card-body">
                    <h5 class="card-title movie-title">${movie.title}</h5>
                    <p class="card-text mb-1">(${movie.year}) - ${movie.genre}</p>
                    <p class="card-text stars">${starsForRating(movie.rating)}
                    <span class="rating-number">${movie.rating.toFixed(1)}/10</span></p>
                    <button class="btn btn-sm btn-outline-primary watched-btn" data-id="${movie.id}">Mark as Watched</button>
                </div>
            </div>
        </div>
   `).join("");
}

function loadMovies() {
    fetch(`${API_BASE}/movies`)
    .then(res => res.json())
    .then(movies => {
        allMovies = movies;
        renderMovies();
    })
    .catch(err => {
        console.error("Could not load movies:", err);
            document.getElementById("movie-container").innerHTML =
                `<p class="text-center">Couldn't load movies. Is the backend running?</p>`;
    });
}

document.getElementById("movie-container").addEventListener("click", event => {
    if (!event.target.classList.contains("watched-btn")) return;

    const button = event.target;
    fetch(`${API_BASE}/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movie_id: Number(button.dataset.id) })
    })
    .then (res => {
        if (!res.ok) throw new Error ("Request failed");
        button.textContent = "Added";
        button.disabled = true;
    })
    .catch(err => console.error("Could not add to history:", err))
});

document.getElementById("randomize-btn").addEventListener("click", renderMovies);

loadMovies();
