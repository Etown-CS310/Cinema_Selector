// This file takes care of the JS on the randomizer/index page.

// TODO: replace this with a real fetch() once database is in place
// for now, posters are shown through URLs

$("#navbar").load("navbar.html");

function starsForRating(rating) {
    const full = Math.round(rating / 2);
    return "★".repeat(full) + "☆".repeat(5 - full);
}

function getRandomMovies(count) {
    const shuffled = [...movieInventory].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

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

document.getElementById("randomize-btn").addEventListener("click", renderMovies);

renderMovies();
