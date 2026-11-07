// handles search, genre filtering, and sorting for the watch history page
// uses movieInventory array as well

$("#navbar").load("navbar.html");

const API_BASE = 'http://localhost:3000';
let allHistory = [];

function starsForRating(rating) {
    const full = Math.round(rating / 2);
    return "★".repeat(full) + "☆".repeat(5 - full);
}

function getFilteredHistory() {
    const searchTerm = document.getElementById("search").value.toLowerCase();
    const genre = document.getElementById("genre").value;
    const sort = document.getElementById("sort").value;

    let results = allHistory.filter(movie => {
        const matchesSearch = movie.title.toLowerCase().includes(searchTerm);
        const matchesGenre = genre === "all" || movie.genre.includes(genre);
        return matchesSearch && matchesGenre;
    });

    /**
    let results = movieInventory.filter(movie => {
        if (!movie.watched) return false;
        const matchesSearch = movie.title.toLowerCase().includes(searchTerm);
        const matchesGenre = genre === "all" || movie.genre === genre;
        return matchesSearch && matchesGenre;
    });
    */

    results.sort((a, b) => {
        const dateA = new Date(a.date_watched);
        const dateB = new Date(b.date_watched);
        return sort === "oldest" ? dateA - dateB : dateB - dateA;
    });

    return results;
}

function renderHistory() {
    const container = document.getElementById("history-container");

    // nothing watched at all
    if (allHistory.length === 0) {
        container.innerHTML = `<p class="text-muted">You haven't marked any movies as watched yet.</p>`;
        return;
    }

    const movies = getFilteredHistory();

    // things are watched, but the search/filter hides them all
    if (movies.length === 0) {
        container.innerHTML = `<p class="text-muted">No movies match your search.</p>`;
        return;
    }

    container.innerHTML = movies.map(movie => `
        <div class="col-md-4 mb-4">
            <div class="card history-card h-100 shadow-sm">
                <img src="${movie.poster_url}" class="card-img-top history-poster" alt="${movie.title} poster">
                <div class="card-body">
                    <h5 class="card-title">${movie.title}</h5>
                    <p class="card-text text-muted mb-1">(${movie.year}) - ${movie.genre}</p>
                    <p class="card-text">${starsForRating(movie.rating)}
                        <span class="rating-number">${movie.rating.toFixed(1)}/10</span>
                    </p>
                    <p class="card-text"><small class="text-muted">Watched ${movie.date_watched}</small></p>
                    <button class="btn btn-sm btn-outline-danger remove-btn" data-history-id="${movie.history_id}">
                        Remove from History
                    </button>
                </div>
            </div>
        </div>
    `).join("");
}

// "Remote from History" button
document.getElementById("history-container").addEventListener("click", event => {
    if (!event.target.classList.contains("remove-btn")) return;

    const historyId = Number(event.target.dataset.historyId);

    fetch(`${API_BASE}/history/${historyId}`, { method: "DELETE"})
    .then(res => {
        if (!res.ok) throw new Error("Request failed");

        allHistory = allHistory.filter(movie => movie.history_id !== historyId);
        renderHistory();
    })
    .catch(err => {
        console.error("Could not remove from history:", err);
        alert("Couldn't remove that movie. Is the backend running?");
    });
});

function loadHistory() {
    fetch(`${API_BASE}/history`)
    .then(res => res.json())
    .then(history => {
        allHistory = history;
        renderHistory();
    })
    .catch(err => {
            console.error("Could not load history:", err);
            document.getElementById("history-container").innerHTML =
                `<p class="text-center">Couldn't load history. Is the backend running?</p>`;
    });
}

document.getElementById("search").addEventListener("input", renderHistory);
document.getElementById("genre").addEventListener("change", renderHistory);
document.getElementById("sort").addEventListener("change", renderHistory);

loadHistory();