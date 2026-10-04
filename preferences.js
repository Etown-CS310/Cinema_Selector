// This javascript file will cover the user preferences page.

"use strict";

(function(){
    window.addEventListener("load", init);

    function init(){
        // const prefBtn = document.querySelector(".preferences");
        // prefBtn.addEventListener("click", savePreferences);
        const form = document.querySelector("form");
        form.addEventListener("submit", savePreferences);
    }
    // Function Not working at the moment
    function savePreferences(e){
        e.preventDefault();

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
    }
})();