// LocalBizConnect - Main Landing Page Script (Home)

document.addEventListener("DOMContentLoaded", () => {
    initHeroSearch();
    checkSystemHealth();
    loadFeaturedBusinesses();
});

// Setup hero search form redirect
function initHeroSearch() {
    const searchForm = document.getElementById("hero-search-form");
    if (!searchForm) return;

    searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const searchInput = document.getElementById("hero-search-input").value.trim();
        const categorySelect = document.getElementById("hero-search-category").value;

        const params = new URLSearchParams();
        if (searchInput) params.set("search", searchInput);
        if (categorySelect) params.set("category", categorySelect);

        window.location.href = `businesses.html?${params.toString()}`;
    });
}

// Check backend status & demo/database connectivity
async function checkSystemHealth() {
    const dbStatusEl = document.getElementById("footer-db-status");
    const dbAlertContainer = document.getElementById("db-alert-container");

    try {
        const health = await api.checkHealth();
        if (health) {
            if (health.database === "demo-memory") {
                if (dbStatusEl) {
                    dbStatusEl.innerHTML = `Database: <strong style="color: #10b981;">Demo Mode (In-Memory)</strong>`;
                }
                if (dbAlertContainer) {
                    dbAlertContainer.style.display = "block";
                    dbAlertContainer.innerHTML = `
                        <div class="db-notice-banner" style="background: #f0fdf4; border-color: #86efac; color: #166534;">
                            <span class="db-notice-icon">⚡</span>
                            <div class="db-notice-content">
                                <h4 style="color: #15803d;">Demo Ready (In-Memory Mode)</h4>
                                <p style="color: #166534;">
                                    LocalBizConnect is operating in full demo mode without requiring MongoDB. Browse 6 categories, register, log in, manage businesses, and leave reviews!
                                </p>
                            </div>
                        </div>
                    `;
                }
            } else if (health.database && typeof health.database === "object") {
                const isConnected = health.database.connected;
                if (dbStatusEl) {
                    dbStatusEl.innerHTML = `MongoDB Atlas: <strong style="color: ${isConnected ? '#10b981' : '#f59e0b'};">${health.database.state}</strong>`;
                }
            }
        }
    } catch (err) {
        if (dbStatusEl) {
            dbStatusEl.innerHTML = `Backend API: <strong style="color: #ef4444;">Offline (run 'npm start' in /backend)</strong>`;
        }
        if (dbAlertContainer) {
            dbAlertContainer.style.display = "block";
            dbAlertContainer.innerHTML = `
                <div class="db-notice-banner danger">
                    <span class="db-notice-icon">🔌</span>
                    <div class="db-notice-content">
                        <h4>Backend Not Reachable</h4>
                        <p>
                            Unable to connect to <code>http://localhost:5000</code>. Please start the backend server by running <code>npm start</code> in the <code>backend/</code> folder.
                        </p>
                    </div>
                </div>
            `;
        }
    }
}

// Load preview of businesses from real backend API
async function loadFeaturedBusinesses() {
    const container = document.getElementById("featured-businesses-container");
    if (!container) return;

    try {
        const data = await api.get("/businesses");
        const businesses = data.businesses || [];

        if (businesses.length === 0) {
            container.innerHTML = `
                <div class="state-container" style="grid-column: 1 / -1;">
                    <div class="state-icon">🏪</div>
                    <h3 class="state-title">No Businesses Listed Yet</h3>
                    <p class="state-desc">
                        Be the first seller to register your local shop or trade service on LocalBizConnect!
                    </p>
                    <a href="register.html" class="btn btn-primary">Register as Seller</a>
                </div>
            `;
            return;
        }

        // Render first 3-6 businesses
        const featured = businesses.slice(0, 6);
        container.innerHTML = featured
            .map((biz) => {
                const categoryClass = `cat-badge-${biz.category.toLowerCase()}`;
                const icon = CATEGORY_ICONS[biz.category] || "🏪";
                const img = getBusinessImage(biz);

                return `
                    <div class="business-card">
                        <div class="business-card-media">
                            <img src="${img}" alt="${biz.name}" onerror="this.src='https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'">
                            <span class="business-card-badge category-badge ${categoryClass}">
                                ${icon} ${biz.category}
                            </span>
                        </div>
                        <div class="business-card-body">
                            <h3 class="business-title">${biz.name}</h3>
                            <p class="business-desc">${biz.description}</p>
                            
                            <div class="business-rating">
                                ${renderStars(biz.averageRating)}
                                <span class="rating-score">${biz.averageRating > 0 ? biz.averageRating : 'New'}</span>
                                <span class="review-count">(${biz.reviewCount || 0} reviews)</span>
                            </div>

                            <div class="business-meta">
                                <div class="meta-item">📍 ${biz.address}</div>
                                <div class="meta-item">📞 ${biz.phone}</div>
                            </div>

                            <div class="business-card-footer">
                                <a href="business-details.html?id=${biz._id}" class="btn btn-outline" style="width: 100%;">
                                    View Details & Services →
                                </a>
                            </div>
                        </div>
                    </div>
                `;
            })
            .join("");
    } catch (error) {
        container.innerHTML = `
            <div class="state-container" style="grid-column: 1 / -1;">
                <div class="state-icon">ℹ️</div>
                <h3 class="state-title">Live Database Setup Needed</h3>
                <p class="state-desc">
                    ${error.message || "Configure MongoDB Atlas URI in backend/.env to view live businesses."}
                </p>
                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <a href="register.html" class="btn btn-primary">Create Seller Account</a>
                    <a href="businesses.html" class="btn btn-outline">Explore Directory</a>
                </div>
            </div>
        `;
    }
}
