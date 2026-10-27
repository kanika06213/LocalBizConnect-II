const jwt = require("jsonwebtoken");

// ─────────────────────────────────────────────────────────────
// Authentication Middleware
// Verifies the JWT sent in the Authorization header.
//
// Expected header format:
//   Authorization: Bearer <token>
//
// On success  → attaches decoded payload to req.user and calls next()
// On failure  → returns 401 Unauthorized
// ─────────────────────────────────────────────────────────────
const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // 1. Check that Authorization header is present and well-formed
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Not authorized. No token provided."
        });
    }

    // 2. Extract the token (part after "Bearer ")
    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_jwt_secret_key");

        // 4. Attach decoded user info to req so downstream handlers can use it
        //    Payload shape: { userId, role }
        req.user = decoded;

        // 5. Pass control to the next middleware / route handler
        next();
    } catch (error) {
        // Covers: expired tokens, tampered tokens, invalid signatures
        return res.status(401).json({
            message: "Not authorized. Token is invalid or expired."
        });
    }
};

// ─────────────────────────────────────────────────────────────
// Authorization Middleware Factory
// Returns middleware that restricts access to specific roles.
//
// Usage (in a route file):
//   router.get("/admin", protect, authorizeRoles("admin"), handler)
//   router.get("/sell",  protect, authorizeRoles("seller", "admin"), handler)
//
// On success  → calls next()
// On failure  → returns 403 Forbidden
// ─────────────────────────────────────────────────────────────
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // req.user is guaranteed to exist here because protect() ran first
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied. Role '${req.user.role}' is not permitted to access this resource.`
            });
        }
        next();
    };
};

module.exports = { protect, authorizeRoles };
