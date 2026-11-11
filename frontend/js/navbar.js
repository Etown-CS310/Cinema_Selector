import { auth } from './firebase.js';
import {
  onAuthStateChanged,
  signOut,
} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';


$("#navbar").load("navbar.html", initButton);

function initButton(){
    const logBtn = document.getElementById('nav-log');

    if(!logBtn) return;

    onAuthStateChanged(auth, (user) => {
        logBtn.textContent = user ? 'Sign Out' : 'Log In';
    });

    logBtn.addEventListener('click', async (event) => {
        if(!auth.currentUser) return;

        event.preventDefault();

        try{
            await signOut(auth);
            window.location.href = '/frontend/login.html';
        } catch (error) {
            console.error("Sign out failed: ", error);
        }
    });
}