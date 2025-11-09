// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    GoogleAuthProvider,       // <-- NEW
    signInWithPopup,          // <-- NEW
    sendPasswordResetEmail    // <-- NEW
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

// Your web app's Firebase configuration
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
// Initialize the auth service
const auth = getAuth(app);


document.addEventListener('DOMContentLoaded', () => {

    // --- Tab Switching Logic ---
    const tabSignup = document.getElementById('tab-signup');
    const tabSignin = document.getElementById('tab-signin');
    const signupContainer = document.getElementById('signup-container');
    const signinContainer = document.getElementById('signin-container');

    if (tabSignup) {
        tabSignup.addEventListener('click', () => {
            tabSignup.classList.add('active');
            tabSignin.classList.remove('active');
            signupContainer.classList.add('active');
            signinContainer.classList.remove('active');
            clearMessages(signupMessageContainer);
            clearMessages(signinMessageContainer);
        });
    }

    if (tabSignin) {
        tabSignin.addEventListener('click', () => {
            tabSignin.classList.add('active');
            tabSignup.classList.remove('active');
            signinContainer.classList.add('active');
            signupContainer.classList.remove('active');
            clearMessages(signupMessageContainer);
            clearMessages(signinMessageContainer);
        });
    }

    // --- Message Containers ---
    const signupMessageContainer = document.getElementById('signup-message-container');
    const signinMessageContainer = document.getElementById('signin-message-container');


    // --- NEW: Google Sign-In Logic ---
    const googleSignInButton = document.getElementById('google-signin-btn');
    if (googleSignInButton) {
        googleSignInButton.addEventListener('click', (e) => {
            e.preventDefault();
            const provider = new GoogleAuthProvider();
            
            signInWithPopup(auth, provider)
                .then((result) => {
                    // This gives you a Google Access Token. You can use it to access the Google API.
                    const credential = GoogleAuthProvider.credentialFromResult(result);
                    const token = credential.accessToken;
                    // The signed-in user info.
                    const user = result.user;
                    console.log('Google user signed in:', user);
                    
                    // Redirect to dashboard
                    window.location.href = '../dashboard.html';
                }).catch((error) => {
                    // Handle Errors here.
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    showMessage(errorMessage, 'error', signupMessageContainer);
                });
        });
    }


    // --- Sign Up Form Logic ---
    const signupForm = document.getElementById('signup-form');
    const signupPasswordInput = document.getElementById('signup-password');
    const passwordStrength = document.getElementById('password-strength');
    const signupSubmitButton = document.getElementById('signup-submit-button');

    if (signupForm) {
        signupForm.addEventListener('submit', (event) => {
            event.preventDefault(); 
            clearMessages(signupMessageContainer);
            signupSubmitButton.disabled = true; 
            signupSubmitButton.textContent = 'Processing...';

            const companyName = document.getElementById('company-name').value.trim();
            const fullName = document.getElementById('full-name').value.trim();
            const email = document.getElementById('signup-email').value.trim();
            const password = signupPasswordInput.value;
            const confirmPassword = document.getElementById('confirm-password').value;

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            // --- Local Validation ---
            if (!companyName || !fullName || !email || !password || !confirmPassword) {
                showMessage('All required fields must be filled.', 'error', signupMessageContainer);
                signupSubmitButton.disabled = false; 
                signupSubmitButton.textContent = 'Create Account';
                return;
            }
            if (!emailRegex.test(email)) {
                showMessage('Please enter a valid email address.', 'error', signupMessageContainer);
                signupSubmitButton.disabled = false;
                signupSubmitButton.textContent = 'Create Account';
                return;
            }
            if (password.length < 8) {
                showMessage('Password must be at least 8 characters long.', 'error', signupMessageContainer);
                signupSubmitButton.disabled = false;
                signupSubmitButton.textContent = 'Create Account';
                return;
            }
            if (password !== confirmPassword) {
                showMessage('Passwords do not match.', 'error', signupMessageContainer);
                signupSubmitButton.disabled = false;
                signupSubmitButton.textContent = 'Create Account';
                return;
            }

            // --- Firebase Auth ---
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    console.log('User created:', user);
                    showMessage('Account created successfully! Redirecting...', 'success', signupMessageContainer);
                    setTimeout(() => {
                        if (typeof handleLoginSuccess === 'function') {
                            handleLoginSuccess();
                        } else {
                            window.location.href = '../index.html';
                        }
                    }, 1200);
                })
                .catch((error) => {
                    const errorMessage = error.message;
                    showMessage(errorMessage, 'error', signupMessageContainer);
                    signupSubmitButton.disabled = false; 
                    signupSubmitButton.textContent = 'Create Account';
                });
        });
    }

    if (signupPasswordInput) {
        signupPasswordInput.addEventListener('input', () => {
            const pass = signupPasswordInput.value;
            if (pass.length === 0) {
                passwordStrength.textContent = 'Minimum 8 characters.';
                passwordStrength.style.color = 'var(--text-secondary)';
            } else if (pass.length < 8) {
                passwordStrength.textContent = 'Password is too short.';
                passwordStrength.style.color = 'var(--danger-color)';
            } else if (pass.length < 12) {
                passwordStrength.textContent = 'Password strength: Medium';
                passwordStrength.style.color = 'var(--warning-color)';
            } else {
                passwordStrength.textContent = 'Password strength: Strong';
                passwordStrength.style.color = 'var(--success-color)';
            }
        });
    }

    // --- Sign In Form Logic ---
    const signinForm = document.getElementById('signin-form');
    const signinSubmitButton = document.getElementById('signin-submit-button');

    if (signinForm) {
        signinForm.addEventListener('submit', (event) => {
            event.preventDefault();
            clearMessages(signinMessageContainer);
            signinSubmitButton.disabled = true;
            signinSubmitButton.textContent = 'Signing In...';

            const email = document.getElementById('signin-email').value.trim();
            const password = document.getElementById('signin-password').value;

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!email || !password) {
                showMessage('All fields are required.', 'error', signinMessageContainer);
                signinSubmitButton.disabled = false;
                signinSubmitButton.textContent = 'Sign In';
                return;
            }
            if (!emailRegex.test(email)) {
                showMessage('Please enter a valid email address.', 'error', signinMessageContainer);
                signinSubmitButton.disabled = false;
                signinSubmitButton.textContent = 'Sign In';
                return;
            }

            // --- Firebase Sign In ---
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    console.log('User signed in:', user);
                    showMessage('Sign in successful! Redirecting...', 'success', signinMessageContainer);
                    setTimeout(() => {
                        if (typeof handleLoginSuccess === 'function') {
                            handleLoginSuccess();
                        } else {
                            window.location.href = '../index.html';
                        }
                    }, 1200);
                })
                .catch((error) => {
                    const errorMessage = error.message;
                    showMessage(errorMessage, 'error', signinMessageContainer);
                    signinSubmitButton.disabled = false; 
                    signinSubmitButton.textContent = 'Sign In';
                });
        });
    }

    // --- NEW: Forgot Password Logic ---
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            clearMessages(signinMessageContainer);
            
            const emailInput = document.getElementById('signin-email');
            const email = emailInput.value.trim();
            
            if (!email) {
                showMessage('Please enter your email address to reset your password.', 'error', signinMessageContainer);
                emailInput.focus();
                return;
            }

            sendPasswordResetEmail(auth, email)
                .then(() => {
                    showMessage('Password reset email sent! Check your inbox.', 'success', signinMessageContainer);
                })
                .catch((error) => {
                    const errorMessage = error.message;
                    showMessage(errorMessage, 'error', signinMessageContainer);
                });
        });
    }


    // --- Helper function to show messages ---
    function showMessage(message, type, container) {
        if (container) {
            container.textContent = message;
            // Clear existing classes and add new ones
            container.className = 'message-container';
            container.classList.add(`message-${type}`);
        }
    }

    // --- Helper function to clear messages ---
    function clearMessages(container) {
        if (container) {
            container.textContent = '';
            container.className = 'message-container';
        }
    }

    // --- Page transition logic ---
    document.querySelectorAll('a[href]').forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // Only apply to non-functional links
            if (href && href.endsWith('.html') && !href.includes('#')) {
                e.preventDefault();
                document.body.classList.add('page-exit');
                setTimeout(() => {
                    window.location.href = href;
                }, 300);
            }
        });
    });
});