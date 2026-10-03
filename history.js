// handles search, genre filtering, and sorting for the watch history page
// uses movieInventory array as well

function getFilteredHistory() {
    const searchTerm = document.getElementById("search").value.toLowerCase();
    const genre = document.getElementById("genre").value;
    const sort = document.getElementById("sort").value;

    let results = movieInventory.filter(movie => {
        if (!movie.watched) return false;
        const matchesSearch = movie.title.toLowerCase().includes(searchTerm);
        const matchesGenre = genre === "all" || movie.genre === genre;
        return matchesSearch && matchesGenre;
    });

    results.sort((a, b) => {
        const dateA = new Date(a.dateWatched);
        const dateB = new Date(b.dateWatched);
        return sort === "oldest" ? dateA - dateB : dateB - dateA;
    });

    return results;
}

function renderHistory() {
    const container = document.getElementById("history-container");
    const movies = getFilteredHistory();

    if (movies.length === 0) {
        container.innerHTML = `<p class="text-muted">No movies match your search.</p>
        `;
        return;
    }

    container.innerHTML = movies.map(movie => `
        <div class="col-md-4 mb-4">
            <div class="card history-card h-100 shadow-sm">
                <img src="${movie.poster}" class="card-img-top history-poster" alt="${movie.title} poster">
                <div class="card-body">
                    <h5 class="card-title">${movie.title}</h5>
                    <p class="card-text text-muted mb-1">(${movie.year}) - ${movie.director}</p>

                    <p class="card-text">${starsForRating(movie.rating)}</p>
                    <p class="card-text"><small class="text-muted">Watched ${movie.dateWatched}</small></p>
                </div>
            </div>
        </div>

            
            
        `).join("");
}

document.getElementById("search").addEventListener("input", renderHistory);
document.getElementById("genre").addEventListener("change", renderHistory);
document.getElementById("sort").addEventListener("change", renderHistory);

renderHistory();