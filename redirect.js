// redirect.js
// Ensures login.html is always shown first if not authenticated
// Place this script in index.html, dashboard.html, upload.html, and subscription.html (before any sensitive content)

(function() {
    // Only run on top-level window (not in iframes)
    if (window.top !== window.self) return;
    // If already on login page, do nothing
    if (window.location.pathname.includes('login.html')) return;
    // If Firebase is available, let auth-check.js handle it
    if (window.location.pathname.includes('auth/')) return;
    // If user is not logged in, redirect to login.html
    // Use localStorage/sessionStorage as a fallback for non-Firebase pages
    var isLoggedIn = localStorage.getItem('digipine_logged_in');
    if (!isLoggedIn) {
        window.location.href = 'auth/login.html';
    }
})();
