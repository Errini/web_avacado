const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {
        // Expecting token in "Authorization: Bearer <token>"
        const token = req.headers.authorization.split(" ")[1];
        if (!token) {
            throw new Error("Authentication failed! No token provided.");
        }
        // Verify token
        const decodedToken = jwt.verify(token, "this_is_a_secret_key_that_should_be_longer_and_in_env_vars"); // Use the same secret as in login
        // Attach user data to the request for subsequent middleware/routes
        req.userData = { userId: decodedToken.userId, username: decodedToken.username }; 
        next(); // Proceed if token is valid
    } catch (error) {
        console.error("Auth error:", error);
        return res.status(401).json({
            title: "Authentication failed",
            error: { message: "Invalid or missing token." }
        });
    }
};

