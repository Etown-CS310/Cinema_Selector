// This javascript file will cover the user preferences page.

"use strict";

(function(){
    const API_BASE = 'http://localhost:3000';
    let favoriteGenres = [];

    window.addEventListener("load", init);

    function init(){
        // const prefBtn = document.querySelector(".preferences");
        // prefBtn.addEventListener("click", savePreferences);
        $("#navbar").load("navbar.html");
        document.querySelector("form").addEventListener("submit", savePreferences);
        document.querySelector(".favGenres").addEventListener("click", removeGenre);
        loadPreferences();
        /**
        const form = document.querySelector("form");
        form.addEventListener("submit", savePreferences);
        */
    }

    // gets saved preferences from the database and fills the form/card
    function loadPreferences() {
        fetch(`${API_BASE}/preferences`)
        .then(res => res.json())
        .then(row => {
            favoriteGenres = [row.genre1, row.genre2, row.genre3].filter(Boolean);
            // document.getElementById("cert").value = row.certification || "";
            document.getElementById("rating").value = row.rating || "";
            document.getElementById("familyFriendly").checked = Boolean(row.familyFriendly);
            document.getElementById("incWatched").checked = Boolean(row.includeWatched);
            showPreferences();
        })
        .catch(err => console.error("Could not load preferences:", err));
    }

    // update the preferences card to match current settings
    function showPreferences() {
        const list = document.querySelector(".favGenres");
        
        if (favoriteGenres.length === 0) {
            list.innerHTML = `<li class="list-group-item bg-transparent text-muted">None yet</li>`;
        }else if (favoriteGenres.length <= 3){
            list.innerHTML = favoriteGenres.map(genre => `
                <li class="movieGenre list-group-item bg-transparent d-flex justify-content-between align-items-center">
                ${genre}
                <button type="button" class="btn-close remove-genre" data-genre="${genre}" aria-label="Remove ${genre}"></button>
                </li>
            `).join("");
        } else {
            list.innerHTML = `<li class="list-group-item bg-transparent text-muted">You can only add 3 genres at a time. Remove one genre to add another.</li>`;
        }

        // document.getElementById("certDisplay").textContent = document.getElementById("cert").value || "Any";
        document.getElementById("minRating").textContent = Number(document.getElementById("rating").value) || 0;
        document.getElementById("fam").textContent = document.getElementById("familyFriendly").checked ? "On" : "Off";
        document.getElementById("incWatchedDisplay").textContent = document.getElementById("incWatched").checked ? "On" : "Off";
    }

    // Function Not working at the moment
    function savePreferences(e){
        e.preventDefault();

        // add chosen genre (skip if blank or already in list)
        const genre = document.getElementById("genre").value;
        if (genre && !favoriteGenres.includes(genre)) {
            favoriteGenres.push(genre);
            if (favoriteGenres.length > 3) {
                favoriteGenres.shift(); // can only have three at a time
            }
        }

        sendPreferences();
        /**
        let genre = document.querySelector("#genre").value;

        let genreItem = document.createElement("li");
        genreItem.textContent = genre;
        console.log(genreItem);
        genreItem.classList.add("movieGenre");

        let parent = document.querySelector(".favGenres");
        parent.appendChild(genreItem);

        let rating = Number(document.getElementById("rating").value);

        let myRating = document.getElementById("minRating");
        myRating.textContent = rating;

        let family = document.getElementById("familyFriendly").checked;
        document.getElementById("fam").textContent = family ? "On" : "Off";
        */
    }

    function removeGenre(e) {
        if (!e.target.classList.contains("remove-genre")) return;
        favoriteGenres = favoriteGenres.filter(g => g !== e.target.dataset.genre);
        sendPreferences();
    }

    // sends to backend then updates the display card
    function sendPreferences() {
        const body = {
            genre1: favoriteGenres[0],
            genre2: favoriteGenres[1],
            genre3: favoriteGenres[2],
            // certification: document.getElementById("cert").value,
            rating: Number(document.getElementById("rating").value) || 0,
            familyFriendly: document.getElementById("familyFriendly").checked,
            includeWatched: document.getElementById("incWatched").checked
        };

        fetch(`${API_BASE}/preferences`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        })
        .then(res => {
            if (!res.ok) throw new Error("Save failed");
            showPreferences();
        })
        .catch(err => {
            console.error("Could not save preferences:", err);
            alert("Couldn't save preferences. Is the backend running?");
        });
    }

})();