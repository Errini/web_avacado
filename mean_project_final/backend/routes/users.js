const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const multer = require("multer");
const jwt = require("jsonwebtoken"); // Import jsonwebtoken
const User = require("../models/user");

// Multer configuration (keep as is)
const MIME_TYPE_MAP = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg"
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isValid = MIME_TYPE_MAP[file.mimetype];
        let error = new Error("Invalid mime type");
        if (isValid) {
            error = null;
        }
        cb(error, "backend/images");
    },
    filename: (req, file, cb) => {
        const name = file.originalname.toLowerCase().split(" ").join("-");
        const ext = MIME_TYPE_MAP[file.mimetype];
        cb(null, name + "-" + Date.now() + "." + ext);
    }
});

const upload = multer({ storage: storage });

// User Signup (keep as is)
router.post("/signup", upload.single("image"), async (req, res, next) => {
    try {
        const url = req.protocol + "://" + req.get("host");
        const imagePath = req.file ? url + "/images/" + req.file.filename : null;

        const hashedPassword = await bcrypt.hash(req.body.password, 12);
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            imagePath: imagePath
        });
        const result = await user.save();
        res.status(201).json({
            message: "User created!",
            obj: { userId: result._id, username: result.username, email: result.email, imagePath: result.imagePath }
        });
    } catch (err) {
        let errorMessage = "An error occurred during signup.";
        if (err.code === 11000) {
            errorMessage = "Username or Email already exists.";
        } else if (err.errors) {
            errorMessage = Object.values(err.errors).map(e => e.message).join(", ");
        }
        return res.status(500).json({
            title: "Signup failed",
            error: { message: errorMessage, details: err }
        });
    }
});

// User Login
router.post("/login", async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(401).json({
                title: "Login failed",
                error: { message: "Invalid login credentials (email not found)" }
            });
        }

        const passwordMatch = await bcrypt.compare(req.body.password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({
                title: "Login failed",
                error: { message: "Invalid login credentials (password incorrect)" }
            });
        }

        // Passwords match, create JWT
        const token = jwt.sign(
            { userId: user._id, username: user.username, email: user.email },
            "this_is_a_secret_key_that_should_be_longer_and_in_env_vars", // Replace with a strong secret key, ideally from environment variables
            { expiresIn: "1h" } // Token expires in 1 hour
        );

        res.status(200).json({
            message: "Login successful!",
            token: token,
            expiresIn: 3600, // 1 hour in seconds
            userId: user._id,
            username: user.username,
            imagePath: user.imagePath
        });

    } catch (err) {
        return res.status(500).json({
            title: "An error occurred during login",
            error: err
        });
    }
});

module.exports = router;

