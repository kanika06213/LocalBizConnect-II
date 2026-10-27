const http = require("http");
const { app, server } = require("../server");

// Simple test runner without external dependencies
let passed = 0;
let failed = 0;

const assert = (condition, message) => {
    if (condition) {
        console.log(`  ✅ PASS: ${message}`);
        passed++;
    } else {
        console.error(`  ❌ FAIL: ${message}`);
        failed++;
    }
};

const makeRequest = (options, postData = null) => {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = "";
            res.on("data", (chunk) => (body += chunk));
            res.on("end", () => {
                let parsed;
                try {
                    parsed = JSON.parse(body);
                } catch (e) {
                    parsed = body;
                }
                resolve({ status: res.statusCode, headers: res.headers, body: parsed });
            });
        });
        req.on("error", reject);
        if (postData) {
            req.write(typeof postData === "string" ? postData : JSON.stringify(postData));
        }
        req.end();
    });
};

const runTests = async () => {
    console.log("\n🧪 Running LocalBizConnect Demo Mode (Without MongoDB) Tests...\n");

    const PORT = process.env.PORT || 5000;

    let customerToken = null;
    let sellerToken = null;
    let adminToken = null;
    let sampleBusinessId = null;

    // Test 1: Health check in demo mode
    try {
        const res = await makeRequest({
            hostname: "localhost",
            port: PORT,
            path: "/api/health",
            method: "GET"
        });
        assert(res.status === 200, "GET /api/health returns 200 OK");
        assert(res.body.status === "ok", "Health status is 'ok'");
        assert(res.body.database === "demo-memory", "Health database reports 'demo-memory'");
        assert(res.body.message === "Running with demo data", "Health message reports 'Running with demo data'");
    } catch (e) {
        assert(false, `Health check error: ${e.message}`);
    }

    // Test 2: 404 Route handling
    try {
        const res = await makeRequest({
            hostname: "localhost",
            port: PORT,
            path: "/api/unknown-endpoint-xyz",
            method: "GET"
        });
        assert(res.status === 404, "Unknown route returns 404 Not Found");
        assert(res.body.message.includes("Route not found"), "404 response contains proper message");
    } catch (e) {
        assert(false, `404 test error: ${e.message}`);
    }

    // Test 3: GET /api/businesses works with demo data
    try {
        const res = await makeRequest({
            hostname: "localhost",
            port: PORT,
            path: "/api/businesses",
            method: "GET"
        });
        assert(res.status === 200, "GET /api/businesses returns 200 OK without MongoDB");
        assert(Array.isArray(res.body.businesses) && res.body.businesses.length >= 12, "Returns multiple demo businesses");
        sampleBusinessId = res.body.businesses[0]._id;
    } catch (e) {
        assert(false, `Businesses API error: ${e.message}`);
    }

    // Test 4: Category filtering works for all six categories
    const categories = ["Food", "Medicine", "Carpenter", "Plumber", "Electrician", "Grocery"];
    for (const cat of categories) {
        try {
            const res = await makeRequest({
                hostname: "localhost",
                port: PORT,
                path: `/api/businesses?category=${cat}`,
                method: "GET"
            });
            const matches = res.body.businesses || [];
            const allMatch = matches.length > 0 && matches.every((b) => b.category.toLowerCase() === cat.toLowerCase());
            assert(res.status === 200 && allMatch, `Category filtering for '${cat}' works (${matches.length} items found)`);
        } catch (e) {
            assert(false, `Category filter for ${cat} failed: ${e.message}`);
        }
    }

    // Test 5: Search filtering works
    try {
        const res = await makeRequest({
            hostname: "localhost",
            port: PORT,
            path: "/api/businesses?search=pizza",
            method: "GET"
        });
        assert(res.status === 200, "Search query returns 200 OK");
        assert(res.body.businesses && res.body.businesses.length > 0, "Search for 'pizza' finds matching businesses");
    } catch (e) {
        assert(false, `Search test error: ${e.message}`);
    }

    // Test 6: Business details work
    try {
        const res = await makeRequest({
            hostname: "localhost",
            port: PORT,
            path: `/api/businesses/${sampleBusinessId}`,
            method: "GET"
        });
        assert(res.status === 200, "GET /api/businesses/:id returns 200 OK");
        assert(res.body.business && res.body.business._id === sampleBusinessId, "Returns complete business details");
        assert(Array.isArray(res.body.business.products), "Business contains associated products array");
        assert(Array.isArray(res.body.business.reviews), "Business contains associated reviews array");
    } catch (e) {
        assert(false, `Business details test error: ${e.message}`);
    }

    // Test 7: Products / Services work
    try {
        const res = await makeRequest({
            hostname: "localhost",
            port: PORT,
            path: "/api/products",
            method: "GET"
        });
        assert(res.status === 200, "GET /api/products returns 200 OK");
        assert(Array.isArray(res.body.products) && res.body.products.length > 0, "Returns list of products and trade services");
    } catch (e) {
        assert(false, `Products API error: ${e.message}`);
    }

    // Test 8: Register new customer works without MongoDB
    const testEmail = `newcustomer_${Date.now()}@demo.com`;
    try {
        const res = await makeRequest(
            {
                hostname: "localhost",
                port: PORT,
                path: "/api/users/register",
                method: "POST",
                headers: { "Content-Type": "application/json" }
            },
            {
                name: "New Student Customer",
                email: testEmail,
                password: "password123",
                role: "customer"
            }
        );
        assert(res.status === 201, "POST /api/users/register creates new customer with 201 Created");
        assert(res.body.token && typeof res.body.token === "string", "Registration returns signed JWT token");
        assert(res.body.user && res.body.user.role === "customer", "Registered user role is 'customer'");
    } catch (e) {
        assert(false, `Register test error: ${e.message}`);
    }

    // Test 9: Register prevents public admin registration
    try {
        const res = await makeRequest(
            {
                hostname: "localhost",
                port: PORT,
                path: "/api/users/register",
                method: "POST",
                headers: { "Content-Type": "application/json" }
            },
            {
                name: "Hacker Admin",
                email: "hacker@demo.com",
                password: "password123",
                role: "admin"
            }
        );
        assert(res.status === 400, "POST /api/users/register rejects public admin role registration with 400");
    } catch (e) {
        assert(false, `Admin register prevention error: ${e.message}`);
    }

    // Test 10: Demo Accounts Login & Real JWT Generation
    // Predefined Customer
    try {
        const res = await makeRequest(
            {
                hostname: "localhost",
                port: PORT,
                path: "/api/users/login",
                method: "POST",
                headers: { "Content-Type": "application/json" }
            },
            { email: "customer@demo.com", password: "customer123" }
        );
        assert(res.status === 200, "Login customer@demo.com succeeds with 200 OK");
        assert(res.body.token, "Customer login returns real JWT");
        customerToken = res.body.token;
    } catch (e) {
        assert(false, `Customer login error: ${e.message}`);
    }

    // Predefined Seller
    try {
        const res = await makeRequest(
            {
                hostname: "localhost",
                port: PORT,
                path: "/api/users/login",
                method: "POST",
                headers: { "Content-Type": "application/json" }
            },
            { email: "seller@demo.com", password: "seller123" }
        );
        assert(res.status === 200, "Login seller@demo.com succeeds with 200 OK");
        assert(res.body.token, "Seller login returns real JWT");
        sellerToken = res.body.token;
    } catch (e) {
        assert(false, `Seller login error: ${e.message}`);
    }

    // Predefined Admin
    try {
        const res = await makeRequest(
            {
                hostname: "localhost",
                port: PORT,
                path: "/api/users/login",
                method: "POST",
                headers: { "Content-Type": "application/json" }
            },
            { email: "admin@demo.com", password: "admin123" }
        );
        assert(res.status === 200, "Login admin@demo.com succeeds with 200 OK");
        assert(res.body.token, "Admin login returns real JWT");
        adminToken = res.body.token;
    } catch (e) {
        assert(false, `Admin login error: ${e.message}`);
    }

    // Test 11: Unauthenticated request to protected route is rejected with 401
    try {
        const res = await makeRequest({
            hostname: "localhost",
            port: PORT,
            path: "/api/users/profile",
            method: "GET"
        });
        assert(res.status === 401, "GET /api/users/profile without token returns 401 Unauthorized");
    } catch (e) {
        assert(false, `Unauthenticated guard test error: ${e.message}`);
    }

    // Test 12: Customer accessing own profile works
    try {
        const res = await makeRequest({
            hostname: "localhost",
            port: PORT,
            path: "/api/users/profile",
            method: "GET",
            headers: { Authorization: `Bearer ${customerToken}` }
        });
        assert(res.status === 200, "Customer profile access returns 200 OK");
        assert(res.body.user.email === "customer@demo.com", "Returned profile matches customer");
    } catch (e) {
        assert(false, `Customer profile test error: ${e.message}`);
    }

    // Test 13: Customer accessing admin endpoint is rejected with 403 Forbidden
    try {
        const res = await makeRequest({
            hostname: "localhost",
            port: PORT,
            path: "/api/users/admin",
            method: "GET",
            headers: { Authorization: `Bearer ${customerToken}` }
        });
        assert(res.status === 403, "Customer role accessing /api/users/admin is rejected with 403 Forbidden");
    } catch (e) {
        assert(false, `Customer admin rejection test error: ${e.message}`);
    }

    // Test 14: Seller accessing admin endpoint is rejected with 403 Forbidden
    try {
        const res = await makeRequest({
            hostname: "localhost",
            port: PORT,
            path: "/api/users/admin",
            method: "GET",
            headers: { Authorization: `Bearer ${sellerToken}` }
        });
        assert(res.status === 403, "Seller role accessing /api/users/admin is rejected with 403 Forbidden");
    } catch (e) {
        assert(false, `Seller admin rejection test error: ${e.message}`);
    }

    // Test 15: Admin accessing admin endpoint works with 200 OK
    try {
        const res = await makeRequest({
            hostname: "localhost",
            port: PORT,
            path: "/api/users/admin",
            method: "GET",
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        assert(res.status === 200, "Admin role accessing /api/users/admin returns 200 OK");
        assert(res.body.stats && res.body.stats.totalBusinesses > 0, "Admin endpoint returns accurate statistics");
    } catch (e) {
        assert(false, `Admin dashboard test error: ${e.message}`);
    }

    // Test 16: Customer submits review to business
    try {
        const res = await makeRequest(
            {
                hostname: "localhost",
                port: PORT,
                path: `/api/businesses/${sampleBusinessId}/reviews`,
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${customerToken}`
                }
            },
            {
                rating: 5,
                comment: "Automated test review - exceptional service!"
            }
        );
        assert(res.status === 201 || res.status === 200, "Customer review submission works in demo mode");
    } catch (e) {
        assert(false, `Review creation test error: ${e.message}`);
    }

    // Test 17: Customer retrieves own reviews
    try {
        const res = await makeRequest({
            hostname: "localhost",
            port: PORT,
            path: "/api/reviews/my/reviews",
            method: "GET",
            headers: { Authorization: `Bearer ${customerToken}` }
        });
        assert(res.status === 200, "GET /api/reviews/my/reviews returns 200 OK");
        assert(Array.isArray(res.body.reviews) && res.body.reviews.length > 0, "Returns customer's posted reviews");
    } catch (e) {
        assert(false, `My reviews test error: ${e.message}`);
    }

    // Test 18: Seller retrieves own businesses
    try {
        const res = await makeRequest({
            hostname: "localhost",
            port: PORT,
            path: "/api/businesses/seller/mine",
            method: "GET",
            headers: { Authorization: `Bearer ${sellerToken}` }
        });
        assert(res.status === 200, "GET /api/businesses/seller/mine returns 200 OK");
        assert(Array.isArray(res.body.businesses) && res.body.businesses.length > 0, "Seller receives their registered businesses");
    } catch (e) {
        assert(false, `Seller mine test error: ${e.message}`);
    }

    console.log(`\n📊 Demo Mode Test Summary: ${passed} Passed, ${failed} Failed\n`);

    server.close();
    process.exit(failed > 0 ? 1 : 0);
};

runTests();
