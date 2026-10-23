// stub login page: loads shared nav bar and shows placeholder message
// TODO: replace with real authentication once backend is ready

$("#navbar").load("navbar.html");

document.getElementById("login-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const message = document.getElementById("login-message");
    message.textContent = "Login isn't connected yet. This is a placeholder until accounts are added.";

    message.classList.remove("d-none");
})