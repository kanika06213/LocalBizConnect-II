// LocalBizConnect - Business Details & Reviews Script

let currentBusinessId = null;

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    currentBusinessId = urlParams.get("id");

    if (!currentBusinessId) {
        renderError("No business ID specified. Please select a business from the directory.");
        return;
    }

    loadBusinessDetails(currentBusinessId);
});

// Load business, its products, and its reviews
async function loadBusinessDetails(id) {
    const container = document.getElementById("business-details-container");
    const breadcrumbCurrent = document.getElementById("breadcrumb-current-business");

    try {
        const data = await api.get(`/businesses/${id}`);
        const business = data.business;

        if (!business) {
            renderError("Business not found.");
            return;
        }

        if (breadcrumbCurrent) {
            breadcrumbCurrent.textContent = business.name;
        }

        document.title = `${business.name} - LocalBizConnect`;

        const categoryClass = `cat-badge-${business.category.toLowerCase()}`;
        const icon = CATEGORY_ICONS[business.category] || "🏪";
        const coverImg = getBusinessImage(business);

        const products = business.products || [];
        const reviews = business.reviews || [];
        const avgRating = business.averageRating || 0;
        const reviewCount = business.reviewCount || reviews.length;

        const currentUser = getCurrentUser();
        const userIsCustomer = currentUser && (currentUser.role === "customer" || currentUser.role === "admin");

        container.innerHTML = `
            <!-- Business Hero Info -->
            <div class="business-hero">
                <div class="business-hero-cover">
                    <img src="${coverImg}" alt="${business.name}" onerror="this.src='https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'">
                </div>
                <div class="business-hero-details">
                    <div class="business-header-left">
                        <span class="category-badge ${categoryClass}" style="margin-bottom: 0.75rem;">
                            ${icon} ${business.category}
                        </span>
                        <h1 class="business-name-lg">${business.name}</h1>
                        <p style="color: var(--text-secondary); font-size: 1.05rem; line-height: 1.6; max-width: 700px;">
                            ${business.description}
                        </p>

                        <div class="business-contact-grid">
                            <div class="contact-card">
                                <div class="contact-card-icon">📍</div>
                                <div>
                                    <strong style="color: var(--text-primary); display: block;">Address</strong>
                                    <span>${business.address}</span>
                                </div>
                            </div>
                            <div class="contact-card">
                                <div class="contact-card-icon">📞</div>
                                <div>
                                    <strong style="color: var(--text-primary); display: block;">Phone</strong>
                                    <a href="tel:${business.phone}" style="color: var(--primary);">${business.phone}</a>
                                </div>
                            </div>
                            <div class="contact-card">
                                <div class="contact-card-icon">✉️</div>
                                <div>
                                    <strong style="color: var(--text-primary); display: block;">Email</strong>
                                    <a href="mailto:${business.email}" style="color: var(--primary);">${business.email}</a>
                                </div>
                            </div>
                            <div class="contact-card">
                                <div class="contact-card-icon">👤</div>
                                <div>
                                    <strong style="color: var(--text-primary); display: block;">Owner</strong>
                                    <span>${business.owner ? business.owner.name : "Verified Seller"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.5rem; text-align: center; min-width: 200px;">
                        <span style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary);">Overall Rating</span>
                        <div style="font-size: 2.75rem; font-weight: 800; color: var(--text-primary); margin: 0.25rem 0;">
                            ${avgRating > 0 ? avgRating : "—"}
                        </div>
                        <div style="margin-bottom: 0.5rem;">
                            ${renderStars(avgRating)}
                        </div>
                        <p style="font-size: 0.85rem; color: var(--text-muted);">${reviewCount} verified reviews</p>
                    </div>
                </div>
            </div>

            <!-- Products & Services Section -->
            <section style="margin-top: 3rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <h2 style="font-size: 1.75rem; font-weight: 800;">Offered Products & Services</h2>
                        <p style="color: var(--text-secondary); font-size: 0.95rem;">Catalog of available goods and professional trades offered by this business.</p>
                    </div>
                    <span class="role-badge badge-customer" style="padding: 0.35rem 0.85rem;">${products.length} Items Listed</span>
                </div>

                ${renderProductsHtml(products)}
            </section>

            <!-- Customer Reviews & Rating Section -->
            <section class="reviews-section">
                <div style="margin-bottom: 1.5rem;">
                    <h2 style="font-size: 1.75rem; font-weight: 800;">Customer Reviews & Feedback</h2>
                    <p style="color: var(--text-secondary); font-size: 0.95rem;">Real opinions and service evaluations from community customers.</p>
                </div>

                <!-- Review Submission Card -->
                <div style="background: #fff; border-radius: var(--radius-md); border: 1px solid var(--border-color); padding: 2rem; margin-bottom: 2.5rem; box-shadow: var(--shadow-sm);">
                    <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">Leave a Review</h3>
                    
                    ${
                        !isLoggedIn()
                            ? `
                            <p style="color: var(--text-secondary); margin-bottom: 1.25rem;">
                                Have you used this service or bought products from this business? Log in as a customer to share your rating and review.
                            </p>
                            <a href="login.html" class="btn btn-primary">Log in to Review</a>
                        `
                            : !userIsCustomer
                            ? `
                            <p style="color: var(--text-secondary);">
                                You are currently logged in as a <strong>Seller</strong>. Reviews on LocalBizConnect are reserved for customer accounts.
                            </p>
                        `
                            : `
                            <form id="review-form">
                                <div class="form-group">
                                    <label class="form-label">Select Your Rating</label>
                                    <div class="star-rating-select">
                                        <input type="radio" id="star5" name="rating" value="5" required><label for="star5" title="5 stars">★</label>
                                        <input type="radio" id="star4" name="rating" value="4"><label for="star4" title="4 stars">★</label>
                                        <input type="radio" id="star3" name="rating" value="3"><label for="star3" title="3 stars">★</label>
                                        <input type="radio" id="star2" name="rating" value="2"><label for="star2" title="2 stars">★</label>
                                        <input type="radio" id="star1" name="rating" value="1"><label for="star1" title="1 star">★</label>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" for="review-comment">Your Feedback & Experience</label>
                                    <textarea id="review-comment" class="form-control" rows="3" required placeholder="Write your honest review (service quality, punctuality, pricing, communication)..."></textarea>
                                </div>
                                <button type="submit" id="submit-review-btn" class="btn btn-primary">
                                    Submit Review
                                </button>
                            </form>
                        `
                    }
                </div>

                <!-- List of Existing Reviews -->
                <div class="review-list">
                    ${renderReviewsListHtml(reviews)}
                </div>
            </section>
        `;

        // Bind review submission handler if form exists
        const reviewForm = document.getElementById("review-form");
        if (reviewForm) {
            reviewForm.addEventListener("submit", handleReviewSubmit);
        }
    } catch (error) {
        renderError(error.message || "Failed to load business details.");
    }
}

// Render Products Grid HTML
function renderProductsHtml(products) {
    if (products.length === 0) {
        return `
            <div class="state-container">
                <div class="state-icon">📦</div>
                <h3 class="state-title">No Products or Services Listed</h3>
                <p class="state-desc">The business owner hasn't added individual menu items or trade rates yet.</p>
            </div>
        `;
    }

    return `
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
                        <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: auto;">
                            Category: ${p.category}
                        </div>
                    </div>
                `;
                })
                .join("")}
        </div>
    `;
}

// Render Reviews List HTML
function renderReviewsListHtml(reviews) {
    if (reviews.length === 0) {
        return `
            <div class="state-container">
                <div class="state-icon">💬</div>
                <h3 class="state-title">No Reviews Yet</h3>
                <p class="state-desc">Be the first customer to leave feedback for this business!</p>
            </div>
        `;
    }

    return reviews
        .map((r) => {
            const userName = r.user ? r.user.name : "Verified Customer";
            const userInitial = userName.charAt(0).toUpperCase();
            const dateStr = r.createdAt ? new Date(r.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "";

            return `
            <div class="review-card">
                <div class="review-card-header">
                    <div class="review-user-info">
                        <div class="review-avatar">${userInitial}</div>
                        <div>
                            <strong style="color: var(--text-primary); display: block; font-size: 0.95rem;">${userName}</strong>
                            <span class="review-date">${dateStr}</span>
                        </div>
                    </div>
                    <div style="font-size: 1.05rem;">
                        ${renderStars(r.rating)}
                    </div>
                </div>
                <p class="review-comment">${r.comment}</p>
            </div>
        `;
        })
        .join("");
}

// Handle Customer Review Form Submission
async function handleReviewSubmit(e) {
    e.preventDefault();
    const submitBtn = document.getElementById("submit-review-btn");
    const commentEl = document.getElementById("review-comment");
    const selectedRatingEl = document.querySelector('input[name="rating"]:checked');

    if (!selectedRatingEl) {
        showToast("Please select a star rating between 1 and 5", "warning");
        return;
    }

    const rating = Number(selectedRatingEl.value);
    const comment = commentEl ? commentEl.value.trim() : "";

    if (!comment) {
        showToast("Please enter a review comment", "warning");
        return;
    }

    try {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Submitting...";
        }

        const res = await api.post(`/businesses/${currentBusinessId}/reviews`, {
            rating,
            comment
        });

        showToast(res.message || "Review submitted successfully!", "success");

        // Reload business details and reviews
        setTimeout(() => {
            loadBusinessDetails(currentBusinessId);
        }, 600);
    } catch (error) {
        showToast(error.message || "Failed to submit review", "error");
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Submit Review";
        }
    }
}

// Helper to render error state
function renderError(message) {
    const container = document.getElementById("business-details-container");
    if (!container) return;

    container.innerHTML = `
        <div class="state-container">
            <div class="state-icon">⚠️</div>
            <h3 class="state-title">Unable to Load Business</h3>
            <p class="state-desc">${message}</p>
            <a href="businesses.html" class="btn btn-primary">Return to Directory</a>
        </div>
    `;
}
