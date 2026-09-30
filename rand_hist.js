// This file takes care of both the JS in the index/randomizer page and the watch history.

// TODO: replace this with a real fetch() once database is in place
// for now, posters are shown through URLs

function starsForRating(rating) {
    const full = Math.round(rating);
    return "★".repeat(full) + "☆".repeat(5 - full);
}

function getRandomMovies(count) {
    const shuffled = [...movieInventory].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

function renderMovies() {
    const container = document.getElementById("movie-container");
    const picks = getRandomMovies(3);

}