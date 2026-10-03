// This file takes care of the JS on the randomizer/index page.

// TODO: replace this with a real fetch() once database is in place
// for now, posters are shown through URLs

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

    container.innerHTML = picks.map(movie => `
        <div class="movie-display">
            <div class="movie-content">
                <img src="${movie.poster}" alt="${movie.title} poster" class="movie-poster"></img>
                <div class="movie-info">
                    <div class="movie-header">
                        <div class="title">
                            <h3 class="movie-title">${movie.title}</h3>
                            <span class="details">(${movie.year}) - ${movie.director}</span>
                        </div>
                        <div class="rating">
                            <span class="stars">${starsForRating(movie.rating)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
   `).join("<br>");
}

document.getElementById("randomize-btn").addEventListener("click", renderMovies);

renderMovies();
