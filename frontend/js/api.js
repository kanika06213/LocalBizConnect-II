// LocalBizConnect Reusable API Client
// Handles fetch requests, headers, JWT tokens, and error parsing

const API_BASE_URL = "http://localhost:5000/api";

// Reusable toast notification system
function showToast(message, type = "info", duration = 4000) {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    const icons = {
        success: "✓",
        error: "✕",
        warning: "⚠",
        info: "ℹ"
    };

    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || "ℹ"}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(toast);

    // Fade out and remove
    setTimeout(() => {
        toast.classList.add("toast-fade-out");
        setTimeout(() => toast.remove(), 400);
    }, duration);
}

// Core API fetch wrapper
async function apiRequest(endpoint, options = {}) {
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem("token");

    const defaultHeaders = {
        "Content-Type": "application/json"
    };

    if (token) {
        defaultHeaders["Authorization"] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...(options.headers || {})
        }
    };

    try {
        const response = await fetch(url, config);
        let data = null;

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            data = { message: await response.text() };
        }

        if (!response.ok) {
            // Handle 401 Unauthorized (expired token)
            if (response.status === 401 && token) {
                console.warn("Session expired or invalid token. Clearing auth.");
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                if (window.updateNavbarAuth) window.updateNavbarAuth();
            }

            const error = new Error(data.message || `Request failed with status ${response.status}`);
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data;
    } catch (err) {
        // Network errors (backend not running)
        if (err.name === "TypeError" && err.message.includes("fetch")) {
            const netErr = new Error("Unable to connect to LocalBizConnect Backend. Please make sure the server is running on http://localhost:5000");
            netErr.status = 0;
            throw netErr;
        }
        throw err;
    }
}

// Convenience API helpers
const api = {
    get: (endpoint) => apiRequest(endpoint, { method: "GET" }),
    post: (endpoint, body) => apiRequest(endpoint, { method: "POST", body: JSON.stringify(body) }),
    put: (endpoint, body) => apiRequest(endpoint, { method: "PUT", body: JSON.stringify(body) }),
    delete: (endpoint) => apiRequest(endpoint, { method: "DELETE" }),
    checkHealth: () => apiRequest("/health", { method: "GET" })
};

// Category curated imagery for premium look & feel
const CATEGORY_IMAGES = {
    Food: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    Medicine: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
    Carpenter: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
    Plumber: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80",
    Electrician: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
    Grocery: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
};

const CATEGORY_ICONS = {
    Food: "🍔",
    Medicine: "💊",
    Carpenter: "🔨",
    Plumber: "🔧",
    Electrician: "⚡",
    Grocery: "🛒"
};

// Helper to get image for a business or fallback
function getBusinessImage(business) {
    if (business && business.image && business.image.trim().startsWith("http")) {
        return business.image.trim();
    }
    return CATEGORY_IMAGES[business?.category] || CATEGORY_IMAGES.Food;
}

// Helper to render star rating HTML
function renderStars(rating = 0) {
    const num = Math.round(Number(rating) || 0);
    let stars = "";
    for (let i = 1; i <= 5; i++) {
        if (i <= num) {
            stars += '<span class="star filled">★</span>';
        } else {
            stars += '<span class="star empty">☆</span>';
        }
    }
    return stars;
}
