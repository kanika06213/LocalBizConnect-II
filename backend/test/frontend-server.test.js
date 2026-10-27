const http = require("http");
const { app, server } = require("../server");

const files = [
    "/",
    "/index.html",
    "/businesses.html",
    "/business-details.html",
    "/login.html",
    "/register.html",
    "/dashboard.html",
    "/css/style.css",
    "/js/api.js",
    "/js/auth.js",
    "/js/main.js",
    "/js/businesses.js",
    "/js/business-details.js",
    "/js/dashboard.js",
    "/api/health"
];

const makeReq = (path) => {
    return new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:5000${path}`, (res) => {
            let data = "";
            res.on("data", (c) => (data += c));
            res.on("end", () => resolve({ status: res.statusCode, length: data.length }));
        });
        req.on("error", reject);
    });
};

const run = async () => {
    console.log("Testing frontend static and API file serving on http://localhost:5000...\n");
    let allOk = true;

    for (const f of files) {
        try {
            const res = await makeReq(f);
            if (res.status === 200 && res.length > 0) {
                console.log(`  ✅ 200 OK: ${f} (${res.length} bytes)`);
            } else {
                console.error(`  ❌ Failed: ${f} returned status ${res.status}`);
                allOk = false;
            }
        } catch (err) {
            console.error(`  ❌ Error on ${f}: ${err.message}`);
            allOk = false;
        }
    }

    server.close();
    if (allOk) {
        console.log("\n✨ All frontend files and APIs are correctly served by the backend server!");
        process.exit(0);
    } else {
        process.exit(1);
    }
};

run();
