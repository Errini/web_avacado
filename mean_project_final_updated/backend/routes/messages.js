const express = require("express");
const router = express.Router();
const Message = require("../models/message");
const User = require("../models/user");
const checkAuth = require("../middleware/check-auth"); // Import authentication middleware

// GET all messages (public route, no auth needed)
router.get("/", async (req, res, next) => {
    try {
        const messages = await Message.find().populate("user", "username imagePath"); // Populate username and imagePath
        res.status(200).json({
            message: "Messages fetched successfully!",
            obj: messages
        });
    } catch (err) {
        return res.status(500).json({
            title: "An error occurred",
            error: err
        });
    }
});

// Apply auth middleware to all subsequent routes in this file
router.use("/", checkAuth); 

// POST a new message (protected by checkAuth)
router.post("/", async (req, res, next) => {
    const userId = req.userData.userId; // Get userId from decoded token (provided by checkAuth middleware)

    try {
        const user = await User.findById(userId);
        if (!user) {
            // This case should ideally not happen if token is valid, but good practice to check
            return res.status(404).json({
                title: "User not found",
                error: { message: "Authenticated user not found in database" }
            });
        }

        const message = new Message({
            content: req.body.content,
            user: user._id // Associate user ID from token
        });

        const savedMessage = await message.save();
        user.messages.push(savedMessage);
        await user.save();

        // Populate user info for the response object
        const populatedMessage = await Message.findById(savedMessage._id).populate("user", "username imagePath");

        res.status(201).json({
            message: "Message saved",
            obj: populatedMessage
        });
    } catch (err) {
        return res.status(500).json({
            title: "An error occurred",
            error: err
        });
    }
});

// PUT (update) a message (protected by checkAuth)
router.put("/:id", async (req, res, next) => {
    const userId = req.userData.userId; // Get userId from token

    try {
        const message = await Message.findById(req.params.id);
        if (!message) {
            return res.status(404).json({
                title: "No Message Found!",
                error: { message: "Message not found" }
            });
        }
        // Authorization check: Ensure the user updating the message is the owner
        if (message.user.toString() !== userId) {
             return res.status(403).json({ // 403 Forbidden is more appropriate than 401 Unauthorized here
                 title: "Not Authorized",
                 error: { message: "User is not authorized to update this message" }
             });
        }

        message.content = req.body.content;
        const result = await message.save();
        // Populate user info for the response object
        const populatedResult = await Message.findById(result._id).populate("user", "username imagePath");

        res.status(200).json({
            message: "Updated message",
            obj: populatedResult
        });
    } catch (err) {
        return res.status(500).json({
            title: "An error occurred",
            error: err
        });
    }
});

// DELETE a message (protected by checkAuth)
router.delete("/:id", async (req, res, next) => {
    const userId = req.userData.userId; // Get userId from token

    try {
        const message = await Message.findById(req.params.id);
        if (!message) {
            return res.status(404).json({
                title: "No Message Found!",
                error: { message: "Message not found" }
            });
        }
        // Authorization check: Ensure the user deleting the message is the owner
        if (message.user.toString() !== userId) {
             return res.status(403).json({ // 403 Forbidden
                 title: "Not Authorized",
                 error: { message: "User is not authorized to delete this message" }
             });
        }

        const result = await Message.deleteOne({ _id: req.params.id });
        if (result.deletedCount === 0) {
             return res.status(500).json({
                title: "An error occurred during deletion",
                error: { message: "Could not delete message" }
            });
        }
        // Remove message from user's list (optional cleanup)
        await User.updateOne({ _id: message.user }, { $pull: { messages: message._id } });

        res.status(200).json({
            message: "Deleted message",
            obj: result
        });
    } catch (err) {
        return res.status(500).json({
            title: "An error occurred",
            error: err
        });
    }
});

module.exports = router;

