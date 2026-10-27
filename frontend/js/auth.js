// LocalBizConnect Authentication & Navigation Management

// Get JWT token from storage
function getToken() {
    return localStorage.getItem("token");
}

// Get current user object
function getCurrentUser() {
    try {
        const userStr = localStorage.getItem("user");
        return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
        return null;
    }
}

// Check if authenticated
function isLoggedIn() {
    return Boolean(getToken());
}

// Perform logout
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    showToast("You have been logged out successfully.", "info");
    setTimeout(() => {
        window.location.href = "login.html";
    }, 500);
}

// Protect private pages
function protectPage(allowedRoles = []) {
    if (!isLoggedIn()) {
        showToast("Please log in to access this page.", "warning");
        sessionStorage.setItem("redirect_after_login", window.location.href);
        setTimeout(() => {
            window.location.href = "login.html";
        }, 600);
        return false;
    }

    const user = getCurrentUser();
    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
        showToast(`Access restricted to ${allowedRoles.join(" or ")} accounts.`, "error");
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1000);
        return false;
    }

    return true;
}

// Redirect already logged-in users away from login/register pages
function redirectIfLoggedIn() {
    if (isLoggedIn()) {
        window.location.href = "dashboard.html";
    }
}

// Dynamically update navbar auth links across all pages
function updateNavbarAuth() {
    const navAuthContainer = document.getElementById("nav-auth-actions");
    if (!navAuthContainer) return;

    const loggedIn = isLoggedIn();
    const user = getCurrentUser();

    if (loggedIn && user) {
        const roleColors = {
            admin: "badge-admin",
            seller: "badge-seller",
            customer: "badge-customer"
        };
        const badgeClass = roleColors[user.role] || "badge-customer";

        navAuthContainer.innerHTML = `
            <div class="user-nav-dropdown">
                <a href="dashboard.html" class="nav-btn nav-btn-dashboard">
                    <span class="user-avatar">${user.name ? user.name.charAt(0).toUpperCase() : "U"}</span>
                    <span class="user-name">${user.name || "My Account"}</span>
                    <span class="role-badge ${badgeClass}">${user.role || "user"}</span>
                </a>
                <button class="nav-btn nav-btn-logout" onclick="logout()" title="Logout">
                    <span>Logout</span>
                </button>
            </div>
        `;
    } else {
        navAuthContainer.innerHTML = `
            <a href="login.html" class="nav-link nav-btn-outline">Login</a>
            <a href="register.html" class="nav-btn nav-btn-primary">Get Started</a>
        `;
    }

    // Initialize mobile menu toggle if present
    const toggleBtn = document.querySelector(".nav-toggle");
    const navMenu = document.querySelector(".nav-menu");
    if (toggleBtn && navMenu) {
        toggleBtn.onclick = () => {
            navMenu.classList.toggle("open");
            toggleBtn.classList.toggle("active");
        };
    }
}

// Auto-run on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    updateNavbarAuth();
});
