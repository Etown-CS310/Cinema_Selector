import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';

const response = await fetch('http://localhost:3000/api/firebase-config');
const firebaseConfig = await response.json();

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export function friendlyError(error){
    const messages = {
        'auth/email-already-in-use': 'An account with this email exists already. Try logging in.',
        'auth/missing-password': 'Please enter a password.',
        'auth/user-not-found': 'Incorrect email or password',
        'auth/wrong-password': 'Incorrect email or password.',
    };
    console.error('error');
    return messages[error.code] || error.message;
}

export function showMessage(element, text, type = 'error'){
    element.textContent = text;
    element.className = `message ${type}`;
    element.hidden = false;
}

export function setLoading(button, isLoading, loadingText = 'Please wait...') {
  if (isLoading) {
    button.dataset.label = button.textContent;
    button.textContent = loadingText;
    button.disabled = true;
  } else {
    button.textContent = button.dataset.label || button.textContent;
    button.disabled = false;
  }
}