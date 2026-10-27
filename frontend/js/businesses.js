// LocalBizConnect - Businesses Directory Page Script

let currentCategory = "All";
let currentSearch = "";

document.addEventListener("DOMContentLoaded", () => {
    // Read URL parameters if coming from Home page links
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get("category");
    const searchParam = urlParams.get("search");

    if (catParam) {
        currentCategory = catParam;
    }

    if (searchParam) {
        currentSearch = searchParam;
        const searchInput = document.getElementById("business-search-input");
        if (searchInput) searchInput.value = currentSearch;
    }

    // Mark active category pill
    highlightActivePill(currentCategory);

    // Setup events
    initEventListeners();

    // Fetch live data
    fetchBusinesses();
});

// Setup event listeners for filtering & searching
function initEventListeners() {
    const searchInput = document.getElementById("business-search-input");
    const searchBtn = document.getElementById("search-btn");
    const resetBtn = document.getElementById("reset-filter-btn");
    const pillsContainer = document.getElementById("category-pills");

    if (searchBtn) {
        searchBtn.addEventListener("click", () => {
            currentSearch = searchInput ? searchInput.value.trim() : "";
            updateUrlAndFetch();
        });
    }

    if (searchInput) {
        searchInput.addEventListener("keyup", (e) => {
            if (e.key === "Enter") {
                currentSearch = searchInput.value.trim();
                updateUrlAndFetch();
            }
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            currentCategory = "All";
            currentSearch = "";
            if (searchInput) searchInput.value = "";
            highlightActivePill("All");
            updateUrlAndFetch();
        });
    }

    if (pillsContainer) {
        pillsContainer.addEventListener("click", (e) => {
            const btn = e.target.closest(".pill-btn");
            if (!btn) return;
            currentCategory = btn.getAttribute("data-category") || "All";
            highlightActivePill(currentCategory);
            updateUrlAndFetch();
        });
    }
}

// Visual active state for pills
function highlightActivePill(catName) {
    const pills = document.querySelectorAll("#category-pills .pill-btn");
    pills.forEach((p) => {
        if (p.getAttribute("data-category") === catName) {
            p.classList.add("active");
        } else {
            p.classList.remove("active");
        }
    });
}

// Sync browser URL and fetch
function updateUrlAndFetch() {
    const params = new URLSearchParams();
    if (currentCategory && currentCategory !== "All") params.set("category", currentCategory);
    if (currentSearch) params.set("search", currentSearch);

    const newUrl = `${window.location.pathname}${params.toString() ? "?" + params.toString() : ""}`;
    window.history.replaceState({}, "", newUrl);

    fetchBusinesses();
}

// Fetch businesses from real backend API: GET /api/businesses?category=...&search=...
async function fetchBusinesses() {
    const container = document.getElementById("businesses-container");
    const countEl = document.getElementById("results-count");
    const alertEl = document.getElementById("businesses-db-alert");

    // Show loading state
    container.innerHTML = `
        <div class="state-container" style="grid-column: 1 / -1;">
            <div class="spinner"></div>
            <h3 class="state-title">Loading businesses...</h3>
            <p class="state-desc">Fetching live records from LocalBizConnect backend API.</p>
        </div>
    `;

    try {
        const queryParams = new URLSearchParams();
        if (currentCategory && currentCategory !== "All") {
            queryParams.set("category", currentCategory);
        }
        if (currentSearch && currentSearch.trim() !== "") {
            queryParams.set("search", currentSearch.trim());
        }

        const endpoint = `/businesses${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
        const data = await api.get(endpoint);
        const businesses = data.businesses || [];

        if (alertEl) alertEl.style.display = "none";

        if (countEl) {
            countEl.textContent = `Showing ${businesses.length} ${businesses.length === 1 ? 'business' : 'businesses'} ${currentCategory !== 'All' ? `in ${currentCategory}` : ''}`;
        }

        if (businesses.length === 0) {
            container.innerHTML = `
                <div class="state-container" style="grid-column: 1 / -1;">
                    <div class="state-icon">🔍</div>
                    <h3 class="state-title">No Businesses Found</h3>
                    <p class="state-desc">
                        We couldn't find any businesses matching your search${currentSearch ? ` for "${currentSearch}"` : ""}${currentCategory !== 'All' ? ` in category "${currentCategory}"` : ""}.
                    </p>
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        <button class="btn btn-outline" onclick="document.getElementById('reset-filter-btn').click()">
                            Reset Filters
                        </button>
                        <a href="register.html" class="btn btn-primary">
                            Register This Business
                        </a>
                    </div>
                </div>
            `;
            return;
        }

        // Render business cards
        container.innerHTML = businesses
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
                                <div class="meta-item">✉️ ${biz.email}</div>
                            </div>

                            <div class="business-card-footer">
                                <a href="business-details.html?id=${biz._id}" class="btn btn-primary" style="width: 100%;">
                                    View Details & Reviews →
                                </a>
                            </div>
                        </div>
                    </div>
                `;
            })
            .join("");
    } catch (error) {
        if (countEl) countEl.textContent = "Directory offline";

        if (alertEl) {
            alertEl.style.display = "block";
            alertEl.innerHTML = `
                <div class="db-notice-banner warning">
                    <span class="db-notice-icon">⚠️</span>
                    <div class="db-notice-content">
                        <h4>Backend Database Notice</h4>
                        <p>${error.message || "To load live businesses, configure MONGO_URI in backend/.env"}</p>
                    </div>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="state-container" style="grid-column: 1 / -1;">
                <div class="state-icon">⚠️</div>
                <h3 class="state-title">Backend Connection Required</h3>
                <p class="state-desc">${error.message}</p>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button class="btn btn-primary" onclick="fetchBusinesses()">Retry Connection</button>
                    <a href="register.html" class="btn btn-outline">Join as Seller</a>
                </div>
            </div>
        `;
    }
}
