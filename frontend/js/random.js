// This file takes care of the JS on the randomizer/index page.

/**
 * Scoring Algorithm:
 *  1. Count Genres) It counts how many times each genre appears in the user's watch history, 
 *  which builds a picture of their taste. If the user watched 3 Action movies
 *  and 1 Comedy movie then it would produce { Action: 3, Comedy: 1 }.
 * 
 *  2. Score Unwatched Movies) This is done to find the movies that the user has yet to watch. Every
 *  movie the user hasn't watched gets a score by adding up the counts for each of its genres. The
 *  movies that share genres with the user's history rise to the top.
 * 
 *  3. Apply Preferences) Each of the user's favorite genres adds a bonus of 3 points. Their minimum rating
 *  removes any movie rated below that number. Family friendly only keeps Family and Animation
 *  movies. Watched movies are skipped unless "include watched" is on.
 * 
 *  4. Breaking Ties by Rating) The movie's rating divided by 10 is added as a tie-breaker. This
 *  bonus is always less than 1, so better-rated movies win ties but can never outrank a stronger
 *  genre match.
 * 
 *  5. Pick from the Top 20) The movies are sorted by score, and three are picked at random from
 *  the top 20. Each click gives the user something new while staying within their best matches.
 * 
 *  Other Features: If there's no history, then the user sees random picks from the highest-rated
 *  movies. When a user marks a movie as watched, it's removed from future recommendations and its
 *  genres is used for the user's taste profile. If a strict rating filters out every movie, or the
 *  user has watched everything, the page shows a "No movies matche your preferences."
 */

$("#navbar").load("navbar.html");

const API_BASE = 'http://localhost:3000';

let preferences = {
    favoriteGenres: [],
    minRating: 0,
    familyFriendly: false,
    includeWatched: false
};

let allMovies = [];
let watchHistory = [];
let recommendations = []; // unwatched movies, best match first


function starsForRating(rating) {
    const full = Math.round(rating / 2);
    return "★".repeat(full) + "☆".repeat(5 - full);
}

// makes row into a preferences object
function applyPreferences(row) {
    preferences = {
        favoriteGenres: [row.genre1, row.genre2, row.genre3].filter(Boolean),
        minRating: row.rating || 0,
        familyFriendly: Boolean(row.familyFriendly),
        includeWatched: Boolean(row.includeWatched)
    };
}

// counts how many times each genre shows up in watch history
// ex. { Action: 3, Comedy: 1 }
function countGenres(watched) {
    const counts = {};
    watched.forEach(movie => {
        movie.genre.split(", ").forEach(genre => {
            counts[genre] = (counts[genre] || 0) + 1;
        });
    });
    return counts;
}

// gives one movie a score: higher = better match
function scoreMovie(movie, genreCounts) {
    let score = 0;

    // points for each genre watched before
    movie.genre.split(", ").forEach(genre => {
        score += genreCounts[genre] || 0;
    });

    // +3 bonus for each favorite genre the movie has
    preferences.favoriteGenres.forEach(fav => {
        if (movie.genre.includes(fav)) score += 3;
    });

    // small tie breaker using movie ratings
    score += movie.rating / 10;

    return score;
}

function passesFilters(movie, watchedIds) {
    if (!preferences.includeWatched && watchedIds.has(movie.id)) return false;
    if (movie.rating < preferences.minRating) return false;

    // family friendly = has the family or animation genre
    if (preferences.familyFriendly && !movie.genre.includes("Family") && !movie.genre.includes("Animation")) {
            return false;
    }

    return true;
}

// builds the sorted list of recommended movies
function buildRecommendations() {
    const watchedIds = new Set(watchHistory.map(movie => movie.id));
    const genreCounts = countGenres(watchHistory);

    recommendations = allMovies
        .filter(movie => passesFilters(movie, watchedIds))
        .map(movie => ({ ...movie, score: scoreMovie(movie, genreCounts) }))
        .sort((a, b) => b.score - a.score);
}

// picks a few random movies from the top matches
function pickMovies(count) {
    const topMatches = recommendations.slice(0, 20);
    const shuffled = [...topMatches].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}



// can delete this function soon once renderMovies is fixed
function getRandomMovies(count) {
    const shuffled = [...allMovies].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

function renderMovies() {
    const container = document.getElementById("movie-container");
    const picks = pickMovies(3);

    if (picks.length === 0) {
        container.innerHTML = `<p class="text-center">No movies match your preferences.</p>`;
        return;
    }

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

// load movies, watch history, and preferences
function loadData() {
    Promise.all([
        fetch(`${API_BASE}/movies`).then(res => res.json()),
        fetch(`${API_BASE}/history`).then(res => res.json()),
        // if preferences fail to load,  use defaults
        fetch(`${API_BASE}/preferences`)
            .then(res => res.ok ? res.json() : {})
            .catch(() => ({}))
    ])
        .then(([movies, watched, prefsRow]) => {
            allMovies = movies;
            watchHistory = watched;
            applyPreferences(prefsRow);
            buildRecommendations();
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
    const movieId = Number(button.dataset.id);

    fetch(`${API_BASE}/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movie_id: movieId })
    })
    .then (res => {
        if (!res.ok) throw new Error ("Request failed");
        button.textContent = "Added";
        button.disabled = true;

        // update recommendations
        const movie = allMovies.find(m => m.id === movieId);
        if (movie) watchHistory.push(movie);
        buildRecommendations();
    })
    .catch(err => console.error("Could not add to history:", err))
});

document.getElementById("randomize-btn").addEventListener("click", renderMovies);

loadData();
