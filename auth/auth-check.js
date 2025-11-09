// Import the functions you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

// Your web app's Firebase configuration
// (This MUST be the same as in login.js)
const firebaseConfig = {
    apiKey: "AIzaSyBEppbjXj-GuzOHXji3Yyrk1t2iVlCIWVA",
    authDomain: "digipine-login-page.firebaseapp.com",
    projectId: "digipine-login-page",
    storageBucket: "digipine-login-page.firebasestorage.app",
    messagingSenderId: "1053165028649",
    appId: "1:1053165028649:web:72d777cd55cf83477aa338",
    measurementId: "G-1GN22ZCGTN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Get references to the new navbar elements
const profileBtn = document.getElementById('navbar-profile-btn');
const profileEmail = document.getElementById('navbar-profile-email'); // <-- Get the email element
const profileDropdown = document.getElementById('navbar-profile-dropdown');
const logoutBtn = document.getElementById('navbar-logout-btn');

// --- Main Auth Check ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in.
        
        // 1. Show the profile button
        if (profileBtn) profileBtn.style.display = 'flex'; // Use 'flex' to center icon
        
        // 2. Set the user's email *inside the dropdown*
        if (profileEmail) profileEmail.textContent = user.email; // <-- UPDATED

        // 3. Add dropdown toggle functionality
        if (profileBtn) {
            profileBtn.addEventListener('click', () => {
                profileDropdown.classList.toggle('show');
            });
        }

        // 4. Add logout functionality
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                signOut(auth).then(() => {
                    // Sign-out successful.
                    console.log('User signed out.');
                    // ⚠️ FIXED: Go from root (dashboard.html) DOWN to auth/login.html
                    window.location.href = 'auth/login.html'; 
                }).catch((error) => {
                    console.error('Sign out error:', error);
                });
            });
        }

    } else {
        // User is signed out.
        // Redirect them to the login page.
        console.log('No user signed in. Redirecting to login...');
        
        // ⚠️ FIXED: Go from root (dashboard.html) DOWN to auth/login.html
        window.location.href = 'auth/login.html';
    }
});

// Close dropdown if user clicks outside of it
window.addEventListener('click', (event) => {
    if (profileDropdown && profileDropdown.classList.contains('show')) {
        // Check if click is outside the button AND outside the dropdown
        if (!profileBtn.contains(event.target) && !profileDropdown.contains(event.target)) {
            profileDropdown.classList.remove('show');
        }
    }
});