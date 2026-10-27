// LocalBizConnect - Role-Adaptive Dashboard Script
// Manages Customer, Seller, and Admin workflows with real backend APIs

let activeUser = null;
let currentTab = "overview";

// Data cache for active session
let sellerBusinesses = [];
let selectedBusinessIdForProducts = null;

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Session Guard: protect page for authenticated users only
    if (!protectPage()) return;

    // 2. Fetch fresh user profile from backend
    await initUserProfile();

    // 3. Setup tabs & load default view
    setupDashboardTabs();
    loadActiveTabView();

    // 4. Initialize modal form handlers
    initModalHandlers();
});

// Fetch user profile from GET /api/users/profile
async function initUserProfile() {
    try {
        const data = await api.get("/users/profile");
        activeUser = data.user;
        // Update stored user object
        localStorage.setItem("user", JSON.stringify(activeUser));
    } catch (e) {
        // Fallback to local storage if offline or DB error
        activeUser = getCurrentUser();
    }

    if (!activeUser) {
        logout();
        return;
    }

    // Update banner
    const nameEl = document.getElementById("user-welcome-name");
    const emailEl = document.getElementById("user-email-text");
    const roleTagEl = document.getElementById("user-role-tag");

    if (nameEl) nameEl.textContent = `Welcome, ${activeUser.name || "Member"}!`;
    if (emailEl) emailEl.innerHTML = `Signed in as <strong>${activeUser.email}</strong> • Role: <span class="role-badge badge-${activeUser.role}">${activeUser.role}</span>`;
    if (roleTagEl) roleTagEl.textContent = `${activeUser.role ? activeUser.role.toUpperCase() : "USER"} DASHBOARD`;
}

// Generate tabs according to user role
function setupDashboardTabs() {
    const tabsContainer = document.getElementById("dashboard-tabs-container");
    if (!tabsContainer || !activeUser) return;

    let tabs = [];

    if (activeUser.role === "seller") {
        tabs = [
            { id: "businesses", label: "🏪 My Businesses" },
            { id: "products", label: "📦 Products & Services" },
            { id: "profile", label: "👤 Profile" }
        ];
        currentTab = "businesses";
    } else if (activeUser.role === "admin") {
        tabs = [
            { id: "admin-overview", label: "📊 System Stats" },
            { id: "admin-businesses", label: "🏪 All Businesses" },
            { id: "profile", label: "👤 Profile" }
        ];
        currentTab = "admin-overview";
    } else {
        // Customer
        tabs = [
            { id: "overview", label: "🏠 Overview" },
            { id: "reviews", label: "💬 My Reviews" },
            { id: "profile", label: "👤 Profile" }
        ];
        currentTab = "overview";
    }

    tabsContainer.innerHTML = tabs
        .map(
            (t) => `
        <button class="dashboard-tab ${t.id === currentTab ? "active" : ""}" 
                onclick="switchTab('${t.id}')">
            ${t.label}
        </button>
    `
        )
        .join("");
}

function switchTab(tabId) {
    currentTab = tabId;

    // Update tab visual classes
    const allTabs = document.querySelectorAll(".dashboard-tab");
    allTabs.forEach((tab) => {
        if (tab.textContent.includes(tabId) || tab.getAttribute("onclick").includes(`'${tabId}'`)) {
            tab.classList.add("active");
        } else {
            tab.classList.remove("active");
        }
    });

    loadActiveTabView();
}

// Render active tab view
function loadActiveTabView() {
    const main = document.getElementById("dashboard-main-content");
    if (!main) return;

    switch (currentTab) {
        // Customer Views
        case "overview":
            renderCustomerOverview(main);
            break;
        case "reviews":
            renderCustomerReviews(main);
            break;

        // Seller Views
        case "businesses":
            renderSellerBusinesses(main);
            break;
        case "products":
            renderSellerProducts(main);
            break;

        // Admin Views
        case "admin-overview":
            renderAdminOverview(main);
            break;
        case "admin-businesses":
            renderAdminBusinesses(main);
            break;

        // Shared
        case "profile":
            renderUserProfile(main);
            break;

        default:
            renderUserProfile(main);
    }
}

/* ==========================================================================
   CUSTOMER DASHBOARD VIEWS
   ========================================================================== */

function renderCustomerOverview(container) {
    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">🛍️</div>
                <div class="stat-info">
                    <h4>Customer</h4>
                    <p>Account Type</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: #e0f2fe; color: #0284c7;">📍</div>
                <div class="stat-info">
                    <h4>Local</h4>
                    <p>Community Access</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: #dcfce7; color: #10b981;">⚡</div>
                <div class="stat-info">
                    <h4>Active</h4>
                    <p>Status</p>
                </div>
            </div>
        </div>

        <div style="background: #fff; padding: 2.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); margin-bottom: 2rem;">
            <h2 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 0.75rem;">Your Local Marketplace Hub</h2>
            <p style="color: var(--text-secondary); margin-bottom: 1.75rem; max-width: 650px;">
                As a verified LocalBizConnect customer, you can browse all neighborhood shops, contact service technicians directly, and leave transparent 5-star ratings.
            </p>

            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                <a href="businesses.html" class="btn btn-primary btn-lg">Browse Local Businesses →</a>
                <button class="btn btn-outline btn-lg" onclick="switchTab('reviews')">View Your Reviews</button>
            </div>
        </div>

        <!-- Category Shortcuts -->
        <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem;">Quick Category Search</h3>
        <div class="category-grid">
            <div class="category-card" onclick="window.location.href='businesses.html?category=Food'">
                <span class="category-icon">🍔</span>
                <span class="category-name">Food</span>
            </div>
            <div class="category-card" onclick="window.location.href='businesses.html?category=Medicine'">
                <span class="category-icon">💊</span>
                <span class="category-name">Medicine</span>
            </div>
            <div class="category-card" onclick="window.location.href='businesses.html?category=Carpenter'">
                <span class="category-icon">🔨</span>
                <span class="category-name">Carpenter</span>
            </div>
            <div class="category-card" onclick="window.location.href='businesses.html?category=Plumber'">
                <span class="category-icon">🔧</span>
                <span class="category-name">Plumber</span>
            </div>
            <div class="category-card" onclick="window.location.href='businesses.html?category=Electrician'">
                <span class="category-icon">⚡</span>
                <span class="category-name">Electrician</span>
            </div>
            <div class="category-card" onclick="window.location.href='businesses.html?category=Grocery'">
                <span class="category-icon">🛒</span>
                <span class="category-name">Grocery</span>
            </div>
        </div>
    `;
}

async function renderCustomerReviews(container) {
    container.innerHTML = `
        <div class="state-container">
            <div class="spinner"></div>
            <p class="state-desc">Loading your reviews...</p>
        </div>
    `;

    try {
        const data = await api.get("/reviews/my/reviews");
        const reviews = data.reviews || [];

        if (reviews.length === 0) {
            container.innerHTML = `
                <div class="state-container">
                    <div class="state-icon">💬</div>
                    <h3 class="state-title">No Reviews Yet</h3>
                    <p class="state-desc">You haven't written any reviews yet. Visit local business pages to share your experience!</p>
                    <a href="businesses.html" class="btn btn-primary">Find Businesses to Review</a>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h2 style="font-size: 1.5rem; font-weight: 800;">Your Posted Reviews (${reviews.length})</h2>
            </div>
            <div class="review-list">
                ${reviews
                    .map((r) => {
                        const biz = r.business || { name: "Business", category: "General" };
                        const dateStr = r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "";

                        return `
                        <div class="review-card">
                            <div class="review-card-header">
                                <div>
                                    <h4 style="font-size: 1.15rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.25rem;">
                                        ${biz.name}
                                    </h4>
                                    <span class="role-badge badge-customer" style="font-size: 0.72rem;">${biz.category || "Service"}</span>
                                    <span class="review-date" style="margin-left: 0.5rem;">Posted on ${dateStr}</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <div style="font-size: 1.1rem;">${renderStars(r.rating)}</div>
                                    <button class="btn btn-outline btn-sm" onclick="openEditReviewModal('${r._id}', ${r.rating}, '${escapeHtml(r.comment)}')">Edit</button>
                                    <button class="btn btn-danger btn-sm" onclick="deleteCustomerReview('${r._id}')">Delete</button>
                                </div>
                            </div>
                            <p class="review-comment" style="margin-top: 0.75rem;">${r.comment}</p>
                        </div>
                    `;
                    })
                    .join("")}
            </div>
        `;
    } catch (e) {
        container.innerHTML = `
            <div class="state-container">
                <div class="state-icon">⚠️</div>
                <h3 class="state-title">Unable to Load Reviews</h3>
                <p class="state-desc">${e.message}</p>
            </div>
        `;
    }
}

/* ==========================================================================
   SELLER DASHBOARD VIEWS
   ========================================================================== */

async function renderSellerBusinesses(container) {
    container.innerHTML = `
        <div class="state-container">
            <div class="spinner"></div>
            <p class="state-desc">Loading your businesses...</p>
        </div>
    `;

    try {
        const data = await api.get("/businesses/seller/mine");
        sellerBusinesses = data.businesses || [];

        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.75rem; flex-wrap: wrap; gap: 1rem;">
                <div>
                    <h2 style="font-size: 1.6rem; font-weight: 800;">Your Registered Businesses</h2>
                    <p style="color: var(--text-secondary); font-size: 0.95rem;">Manage your store profiles, contact details, and catalog offerings.</p>
                </div>
                <button class="btn btn-primary btn-lg" onclick="openCreateBusinessModal()">
                    + Register New Business
                </button>
            </div>

            ${
                sellerBusinesses.length === 0
                    ? `
                <div class="state-container">
                    <div class="state-icon">🏪</div>
                    <h3 class="state-title">You Haven't Registered Any Businesses Yet</h3>
                    <p class="state-desc">List your shop, clinic, or trade service today so local customers can discover you.</p>
                    <button class="btn btn-primary" onclick="openCreateBusinessModal()">Register Your First Business</button>
                </div>
            `
                    : `
                <div class="business-grid">
                    ${sellerBusinesses
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

                                    <div style="display: flex; gap: 0.5rem; margin-top: auto; padding-top: 1rem; border-top: 1px solid #f1f5f9;">
                                        <button class="btn btn-primary btn-sm" style="flex: 1;" onclick="manageProductsForBusiness('${biz._id}')">
                                            Manage Catalog
                                        </button>
                                        <button class="btn btn-outline btn-sm" onclick="openEditBusinessModal('${biz._id}')">
                                            Edit
                                        </button>
                                        <button class="btn btn-danger btn-sm" onclick="deleteSellerBusiness('${biz._id}')">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                        })
                        .join("")}
                </div>
            `
            }
        `;
    } catch (e) {
        container.innerHTML = `
            <div class="state-container">
                <div class="state-icon">⚠️</div>
                <h3 class="state-title">Unable to Load Businesses</h3>
                <p class="state-desc">${e.message}</p>
            </div>
        `;
    }
}

async function renderSellerProducts(container) {
    if (sellerBusinesses.length === 0) {
        // Fetch seller businesses first
        try {
            const data = await api.get("/businesses/seller/mine");
            sellerBusinesses = data.businesses || [];
        } catch (e) {
            sellerBusinesses = [];
        }
    }

    if (sellerBusinesses.length === 0) {
        container.innerHTML = `
            <div class="state-container">
                <div class="state-icon">🏪</div>
                <h3 class="state-title">Create a Business First</h3>
                <p class="state-desc">You need at least one registered business before adding products or trade services.</p>
                <button class="btn btn-primary" onclick="openCreateBusinessModal()">Create Business Now</button>
            </div>
        `;
        return;
    }

    if (!selectedBusinessIdForProducts) {
        selectedBusinessIdForProducts = sellerBusinesses[0]._id;
    }

    container.innerHTML = `
        <div style="background: #fff; padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
                <label style="font-weight: 700; color: var(--text-primary);">Select Business:</label>
                <select id="seller-biz-select" class="form-control" style="width: auto; min-width: 240px;" onchange="onSellerBusinessSelected(this.value)">
                    ${sellerBusinesses
                        .map(
                            (b) => `
                        <option value="${b._id}" ${b._id === selectedBusinessIdForProducts ? "selected" : ""}>
                            ${b.name} (${b.category})
                        </option>
                    `
                        )
                        .join("")}
                </select>
            </div>
            <button class="btn btn-primary" onclick="openAddProductModal()">
                + Add Product / Service
            </button>
        </div>

        <div id="seller-products-list-container">
            <div class="state-container">
                <div class="spinner"></div>
                <p class="state-desc">Loading offerings...</p>
            </div>
        </div>
    `;

    loadProductsForSelectedBusiness();
}

function onSellerBusinessSelected(bizId) {
    selectedBusinessIdForProducts = bizId;
    loadProductsForSelectedBusiness();
}

function manageProductsForBusiness(bizId) {
    selectedBusinessIdForProducts = bizId;
    switchTab("products");
}

async function loadProductsForSelectedBusiness() {
    const listContainer = document.getElementById("seller-products-list-container");
    if (!listContainer || !selectedBusinessIdForProducts) return;

    try {
        const data = await api.get(`/businesses/${selectedBusinessIdForProducts}/products`);
        const products = data.products || [];

        if (products.length === 0) {
            listContainer.innerHTML = `
                <div class="state-container">
                    <div class="state-icon">📦</div>
                    <h3 class="state-title">No Offerings Added Yet</h3>
                    <p class="state-desc">Add specific goods or services with price details to attract neighborhood customers.</p>
                    <button class="btn btn-primary" onclick="openAddProductModal()">Add First Offering</button>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = `
            <div class="product-grid">
                ${products
                    .map((p) => {
                        const isService = p.type === "service";
                        const badgeClass = isService ? "type-service" : "type-product";

                        return `
                        <div class="product-card">
                            <div class="product-header">
                                <span class="product-type-badge ${badgeClass}">${p.type || "Product"}</span>
                                <span class="product-price">₹${p.price}</span>
                            </div>
                            <h4 class="product-name">${p.name}</h4>
                            <p class="product-desc">${p.description}</p>
                            <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem;">
                                Category: ${p.category}
                            </div>
                            <div style="display: flex; gap: 0.5rem; margin-top: auto; padding-top: 0.75rem; border-top: 1px solid #f1f5f9;">
                                <button class="btn btn-outline btn-sm" style="flex: 1;" onclick="openEditProductModal('${p._id}', '${escapeHtml(p.name)}', '${escapeHtml(p.description)}', ${p.price}, '${p.type}', '${escapeHtml(p.category)}')">
                                    Edit
                                </button>
                                <button class="btn btn-danger btn-sm" onclick="deleteProductItem('${p._id}')">
                                    Delete
                                </button>
                            </div>
                        </div>
                    `;
                    })
                    .join("")}
            </div>
        `;
    } catch (e) {
        listContainer.innerHTML = `
            <div class="state-container">
                <div class="state-icon">⚠️</div>
                <h3 class="state-title">Unable to Load Products</h3>
                <p class="state-desc">${e.message}</p>
            </div>
        `;
    }
}

/* ==========================================================================
   ADMIN DASHBOARD VIEWS
   ========================================================================== */

async function renderAdminOverview(container) {
    container.innerHTML = `
        <div class="state-container">
            <div class="spinner"></div>
            <p class="state-desc">Loading system analytics...</p>
        </div>
    `;

    try {
        const data = await api.get("/users/admin");
        const stats = data.stats || {};
        const recentUsers = data.recentUsers || [];

        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon" style="background: #e0e7ff; color: #4338ca;">👥</div>
                    <div class="stat-info">
                        <h4>${stats.totalUsers || 0}</h4>
                        <p>Total Registered Users</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: #dbeafe; color: #1d4ed8;">🛍️</div>
                    <div class="stat-info">
                        <h4>${stats.totalCustomers || 0}</h4>
                        <p>Customers</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: #fef3c7; color: #b45309;">🏪</div>
                    <div class="stat-info">
                        <h4>${stats.totalSellers || 0}</h4>
                        <p>Sellers / Trades</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: #dcfce7; color: #10b981;">🏢</div>
                    <div class="stat-info">
                        <h4>${stats.totalBusinesses || 0}</h4>
                        <p>Live Businesses</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: #fee2e2; color: #ef4444;">📦</div>
                    <div class="stat-info">
                        <h4>${stats.totalProducts || 0}</h4>
                        <p>Listed Products/Services</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: #f3e8ff; color: #7e22ce;">⭐</div>
                    <div class="stat-info">
                        <h4>${stats.totalReviews || 0}</h4>
                        <p>Customer Reviews</p>
                    </div>
                </div>
            </div>

            <!-- Recent Registrations -->
            <div style="background: #fff; padding: 2rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); margin-top: 2rem;">
                <h3 style="font-size: 1.35rem; font-weight: 800; margin-bottom: 1.25rem;">Recent User Registrations</h3>
                ${
                    recentUsers.length === 0
                        ? `<p style="color: var(--text-muted);">No users found.</p>`
                        : `
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.92rem;">
                            <thead>
                                <tr style="border-bottom: 2px solid var(--border-color); color: var(--text-secondary);">
                                    <th style="padding: 0.75rem 1rem;">Name</th>
                                    <th style="padding: 0.75rem 1rem;">Email</th>
                                    <th style="padding: 0.75rem 1rem;">Role</th>
                                    <th style="padding: 0.75rem 1rem;">Joined Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${recentUsers
                                    .map(
                                        (u) => `
                                    <tr style="border-bottom: 1px solid var(--border-color);">
                                        <td style="padding: 0.75rem 1rem; font-weight: 600;">${u.name}</td>
                                        <td style="padding: 0.75rem 1rem; color: var(--text-secondary);">${u.email}</td>
                                        <td style="padding: 0.75rem 1rem;">
                                            <span class="role-badge badge-${u.role}">${u.role}</span>
                                        </td>
                                        <td style="padding: 0.75rem 1rem; color: var(--text-muted); font-size: 0.85rem;">
                                            ${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
                                        </td>
                                    </tr>
                                `
                                    )
                                    .join("")}
                            </tbody>
                        </table>
                    </div>
                `
                }
            </div>
        `;
    } catch (e) {
        container.innerHTML = `
            <div class="state-container">
                <div class="state-icon">⚠️</div>
                <h3 class="state-title">Unable to Load Admin Stats</h3>
                <p class="state-desc">${e.message}</p>
            </div>
        `;
    }
}

async function renderAdminBusinesses(container) {
    container.innerHTML = `
        <div class="state-container">
            <div class="spinner"></div>
            <p class="state-desc">Loading all businesses...</p>
        </div>
    `;

    try {
        const data = await api.get("/businesses");
        const businesses = data.businesses || [];

        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h2 style="font-size: 1.5rem; font-weight: 800;">All Platform Businesses (${businesses.length})</h2>
            </div>
            
            ${
                businesses.length === 0
                    ? `
                <div class="state-container">
                    <p class="state-desc">No businesses found in directory.</p>
                </div>
            `
                    : `
                <div class="business-grid">
                    ${businesses
                        .map((b) => {
                            const icon = CATEGORY_ICONS[b.category] || "🏪";
                            const img = getBusinessImage(b);

                            return `
                            <div class="business-card">
                                <div class="business-card-media">
                                    <img src="${img}" alt="${b.name}">
                                    <span class="business-card-badge category-badge cat-badge-${b.category.toLowerCase()}">
                                        ${icon} ${b.category}
                                    </span>
                                </div>
                                <div class="business-card-body">
                                    <h3 class="business-title">${b.name}</h3>
                                    <p class="business-desc">${b.description}</p>
                                    <div class="business-meta">
                                        <div class="meta-item">📍 ${b.address}</div>
                                        <div class="meta-item">📞 ${b.phone}</div>
                                        <div class="meta-item">👤 Owner: ${b.owner ? b.owner.name : "Unknown"}</div>
                                    </div>
                                    <div style="display: flex; gap: 0.5rem; margin-top: auto; padding-top: 1rem; border-top: 1px solid #f1f5f9;">
                                        <a href="business-details.html?id=${b._id}" class="btn btn-outline btn-sm" style="flex: 1;">
                                            View Details
                                        </a>
                                        <button class="btn btn-danger btn-sm" onclick="adminDeleteBusiness('${b._id}')">
                                            Admin Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                        })
                        .join("")}
                </div>
            `
            }
        `;
    } catch (e) {
        container.innerHTML = `
            <div class="state-container">
                <div class="state-icon">⚠️</div>
                <h3 class="state-title">Unable to Load Businesses</h3>
                <p class="state-desc">${e.message}</p>
            </div>
        `;
    }
}

/* ==========================================================================
   USER PROFILE VIEW (SHARED)
   ========================================================================== */

function renderUserProfile(container) {
    if (!activeUser) return;

    container.innerHTML = `
        <div style="max-width: 680px; background: #fff; padding: 2.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);">
            <h2 style="font-size: 1.65rem; font-weight: 800; margin-bottom: 1.5rem;">User Account Profile</h2>
            
            <div style="display: flex; align-items: center; gap: 1.25rem; margin-bottom: 2rem; padding-bottom: 1.75rem; border-bottom: 1px solid var(--border-color);">
                <div style="width: 64px; height: 64px; border-radius: 50%; background: var(--primary-gradient); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; font-weight: 800;">
                    ${activeUser.name ? activeUser.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                    <h3 style="font-size: 1.35rem; font-weight: 700;">${activeUser.name}</h3>
                    <p style="color: var(--text-secondary);">${activeUser.email}</p>
                    <span class="role-badge badge-${activeUser.role}" style="margin-top: 0.35rem; display: inline-block;">
                        ${activeUser.role ? activeUser.role.toUpperCase() : "CUSTOMER"}
                    </span>
                </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                <div style="display: flex; justify-content: space-between; padding-bottom: 0.75rem; border-bottom: 1px solid #f1f5f9;">
                    <span style="color: var(--text-secondary); font-weight: 600;">User ID:</span>
                    <span style="font-family: monospace; font-size: 0.88rem; color: #475569;">${activeUser._id || activeUser.userId || "N/A"}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding-bottom: 0.75rem; border-bottom: 1px solid #f1f5f9;">
                    <span style="color: var(--text-secondary); font-weight: 600;">Registered Email:</span>
                    <span style="font-weight: 600;">${activeUser.email}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding-bottom: 0.75rem; border-bottom: 1px solid #f1f5f9;">
                    <span style="color: var(--text-secondary); font-weight: 600;">Role Permissions:</span>
                    <span style="text-transform: capitalize; font-weight: 600;">${activeUser.role} Account</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding-bottom: 0.75rem; border-bottom: 1px solid #f1f5f9;">
                    <span style="color: var(--text-secondary); font-weight: 600;">Security Token:</span>
                    <span style="color: #10b981; font-weight: 600;">JWT Authenticated</span>
                </div>
            </div>

            <div style="margin-top: 2rem; display: flex; gap: 1rem;">
                <button class="btn btn-danger" onclick="logout()">Log Out of Account</button>
            </div>
        </div>
    `;
}

/* ==========================================================================
   MODAL CONTROLLERS & FORM SUBMISSIONS
   ========================================================================== */

function initModalHandlers() {
    // Business Form
    const bizForm = document.getElementById("business-form");
    if (bizForm) {
        bizForm.addEventListener("submit", handleBusinessSubmit);
    }

    // Product Form
    const prodForm = document.getElementById("product-form");
    if (prodForm) {
        prodForm.addEventListener("submit", handleProductSubmit);
    }

    // Edit Review Form
    const reviewForm = document.getElementById("edit-review-form");
    if (reviewForm) {
        reviewForm.addEventListener("submit", handleEditReviewSubmit);
    }
}

// Business Modal
function openCreateBusinessModal() {
    document.getElementById("business-modal-title").textContent = "Register New Business";
    document.getElementById("biz-id").value = "";
    document.getElementById("biz-name").value = "";
    document.getElementById("biz-category").value = "Food";
    document.getElementById("biz-desc").value = "";
    document.getElementById("biz-address").value = "";
    document.getElementById("biz-phone").value = "";
    document.getElementById("biz-email").value = activeUser?.email || "";
    document.getElementById("biz-image").value = "";

    document.getElementById("business-modal").classList.add("open");
}

function openEditBusinessModal(bizId) {
    const biz = sellerBusinesses.find((b) => b._id === bizId);
    if (!biz) return;

    document.getElementById("business-modal-title").textContent = "Edit Business Profile";
    document.getElementById("biz-id").value = biz._id;
    document.getElementById("biz-name").value = biz.name;
    document.getElementById("biz-category").value = biz.category;
    document.getElementById("biz-desc").value = biz.description;
    document.getElementById("biz-address").value = biz.address;
    document.getElementById("biz-phone").value = biz.phone;
    document.getElementById("biz-email").value = biz.email;
    document.getElementById("biz-image").value = biz.image || "";

    document.getElementById("business-modal").classList.add("open");
}

function closeBusinessModal() {
    document.getElementById("business-modal").classList.remove("open");
}

async function handleBusinessSubmit(e) {
    e.preventDefault();
    const saveBtn = document.getElementById("biz-save-btn");
    const bizId = document.getElementById("biz-id").value;

    const payload = {
        name: document.getElementById("biz-name").value.trim(),
        category: document.getElementById("biz-category").value,
        description: document.getElementById("biz-desc").value.trim(),
        address: document.getElementById("biz-address").value.trim(),
        phone: document.getElementById("biz-phone").value.trim(),
        email: document.getElementById("biz-email").value.trim(),
        image: document.getElementById("biz-image").value.trim()
    };

    try {
        saveBtn.disabled = true;
        saveBtn.textContent = "Saving...";

        if (bizId) {
            // PUT /api/businesses/:id
            await api.put(`/businesses/${bizId}`, payload);
            showToast("Business updated successfully!", "success");
        } else {
            // POST /api/businesses
            await api.post("/businesses", payload);
            showToast("Business registered successfully!", "success");
        }

        closeBusinessModal();
        renderSellerBusinesses(document.getElementById("dashboard-main-content"));
    } catch (err) {
        showToast(err.message || "Failed to save business", "error");
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = "Save Business";
    }
}

async function deleteSellerBusiness(bizId) {
    if (!confirm("Are you sure you want to delete this business? All associated products and reviews will also be removed.")) {
        return;
    }

    try {
        await api.delete(`/businesses/${bizId}`);
        showToast("Business deleted successfully", "success");
        renderSellerBusinesses(document.getElementById("dashboard-main-content"));
    } catch (err) {
        showToast(err.message || "Failed to delete business", "error");
    }
}

// Product Modal
function openAddProductModal() {
    if (!selectedBusinessIdForProducts) {
        showToast("Please select a business first", "warning");
        return;
    }

    document.getElementById("product-modal-title").textContent = "Add Product or Service";
    document.getElementById("prod-id").value = "";
    document.getElementById("prod-business-id").value = selectedBusinessIdForProducts;
    document.getElementById("prod-name").value = "";
    document.getElementById("prod-desc").value = "";
    document.getElementById("prod-price").value = "";
    document.getElementById("prod-type").value = "product";

    const currentBiz = sellerBusinesses.find((b) => b._id === selectedBusinessIdForProducts);
    document.getElementById("prod-category").value = currentBiz?.category || "";

    document.getElementById("product-modal").classList.add("open");
}

function openEditProductModal(id, name, desc, price, type, cat) {
    document.getElementById("product-modal-title").textContent = "Edit Offering";
    document.getElementById("prod-id").value = id;
    document.getElementById("prod-business-id").value = selectedBusinessIdForProducts;
    document.getElementById("prod-name").value = name;
    document.getElementById("prod-desc").value = desc;
    document.getElementById("prod-price").value = price;
    document.getElementById("prod-type").value = type || "product";
    document.getElementById("prod-category").value = cat || "";

    document.getElementById("product-modal").classList.add("open");
}

function closeProductModal() {
    document.getElementById("product-modal").classList.remove("open");
}

async function handleProductSubmit(e) {
    e.preventDefault();
    const saveBtn = document.getElementById("prod-save-btn");
    const prodId = document.getElementById("prod-id").value;
    const businessId = document.getElementById("prod-business-id").value;

    const payload = {
        name: document.getElementById("prod-name").value.trim(),
        description: document.getElementById("prod-desc").value.trim(),
        price: Number(document.getElementById("prod-price").value),
        type: document.getElementById("prod-type").value,
        category: document.getElementById("prod-category").value.trim(),
        business: businessId
    };

    try {
        saveBtn.disabled = true;
        saveBtn.textContent = "Saving...";

        if (prodId) {
            // PUT /api/products/:id
            await api.put(`/products/${prodId}`, payload);
            showToast("Product/Service updated successfully!", "success");
        } else {
            // POST /api/products
            await api.post("/products", payload);
            showToast("Product/Service added successfully!", "success");
        }

        closeProductModal();
        loadProductsForSelectedBusiness();
    } catch (err) {
        showToast(err.message || "Failed to save product/service", "error");
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = "Save Offering";
    }
}

async function deleteProductItem(id) {
    if (!confirm("Are you sure you want to delete this product/service?")) {
        return;
    }

    try {
        await api.delete(`/products/${id}`);
        showToast("Product/Service deleted successfully", "success");
        loadProductsForSelectedBusiness();
    } catch (err) {
        showToast(err.message || "Failed to delete item", "error");
    }
}

// Review Edit Modal
function openEditReviewModal(reviewId, rating, comment) {
    document.getElementById("edit-review-id").value = reviewId;
    document.getElementById("edit-review-rating").value = String(rating);
    document.getElementById("edit-review-comment").value = comment;

    document.getElementById("review-modal").classList.add("open");
}

function closeReviewModal() {
    document.getElementById("review-modal").classList.remove("open");
}

async function handleEditReviewSubmit(e) {
    e.preventDefault();
    const saveBtn = document.getElementById("save-review-btn");
    const reviewId = document.getElementById("edit-review-id").value;
    const rating = Number(document.getElementById("edit-review-rating").value);
    const comment = document.getElementById("edit-review-comment").value.trim();

    try {
        saveBtn.disabled = true;
        saveBtn.textContent = "Updating...";

        // PUT /api/reviews/:id
        await api.put(`/reviews/${reviewId}`, { rating, comment });
        showToast("Review updated successfully!", "success");
        closeReviewModal();
        renderCustomerReviews(document.getElementById("dashboard-main-content"));
    } catch (err) {
        showToast(err.message || "Failed to update review", "error");
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = "Update Review";
    }
}

async function deleteCustomerReview(reviewId) {
    if (!confirm("Are you sure you want to delete this review?")) {
        return;
    }

    try {
        await api.delete(`/reviews/${reviewId}`);
        showToast("Review deleted successfully", "success");
        renderCustomerReviews(document.getElementById("dashboard-main-content"));
    } catch (err) {
        showToast(err.message || "Failed to delete review", "error");
    }
}

// Admin Action: Delete any business
async function adminDeleteBusiness(bizId) {
    if (!confirm("ADMIN CONFIRMATION: Are you sure you want to permanently delete this business and all its offerings and reviews?")) {
        return;
    }

    try {
        await api.delete(`/businesses/${bizId}`);
        showToast("Business removed by administrator", "success");
        renderAdminBusinesses(document.getElementById("dashboard-main-content"));
    } catch (err) {
        showToast(err.message || "Admin delete failed", "error");
    }
}

// Helper utility
function escapeHtml(text) {
    if (!text) return "";
    return text.replace(/'/g, "\\'").replace(/"/g, "&quot;");
}
