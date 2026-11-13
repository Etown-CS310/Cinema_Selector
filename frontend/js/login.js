import { auth, friendlyError, showMessage, setLoading } from './firebase.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';

$("#navbar").load("navbar.html");

async function syncUser(user) {
  try {
    const token = await user.getIdToken(true);
    const res = await fetch('http://localhost:3000/api/users/sync', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('sync response:', res.status, await res.text());
  } catch (err) {
    console.error('User sync failed:', err);
  }
}

const form = document.getElementById('login-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmInput = document.getElementById('confirm');
const loginBtn = document.getElementById('login-btn');

const registerBtn = document.getElementById('register-btn');
const message = document.getElementById('login-message');

let creatingAccount = false;

onAuthStateChanged(auth, async (user) => {
  if (user && !creatingAccount){
    await syncUser(user);
    window.location.href = '/frontend/index.html';
  } 
});

// Email + password login
form.addEventListener('submit', async (event) => {
  event.preventDefault(); // stop the page from reloading

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if(event.submitter === registerBtn){
    const name = nameInput.value.trim();

    if (!name) return showMessage(message, 'Please enter your name.');
    if (password !== confirmInput.value) return showMessage(message, 'Passwords do not match.');

    creatingAccount = true;
    setLoading(registerBtn, true, 'Creating account...');

    try {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(user, { displayName: name });
        await syncUser(user);
        window.location.href = '/frontend/index.html';
    } catch (error) {
        creatingAccount = false;
        showMessage(message, friendlyError(error));
        setLoading(registerBtn, false);
    }
  } else {
    if (!email || !password) return showMessage(message, 'Please enter your email and password.');
    setLoading(loginBtn, true, 'Logging in...');
    try {
        await signInWithEmailAndPassword(auth, email, password);
        // onAuthStateChanged will handle the redirect
    } catch (error) {
        console.error(error.code, error.message);
        showMessage(message, friendlyError(error));
        setLoading(loginBtn, false);
    }
    }
});

