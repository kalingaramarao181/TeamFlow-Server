const express = require("express");
const router = express.Router();
const db = require("../Config/connection");

// Middleware to extract user ID from cookies
const authenticateUser = (req, res, next) => {
  const userId = req.cookies.userId; // Assuming `userId` is stored in cookies

  if (!userId) {
    return res.status(401).json({ message: "User ID is missing" });
  }

  req.user = { id: userId }; // Attach user ID to the request
  next();
};

// Fetch chat messages for a project
router.get("/projects/:projectId/chat", authenticateUser, (req, res) => {
  const projectId = req.params.projectId;

  const query = `
    SELECT m.id, m.message, m.created_at, u.id AS sender_id, u.full_name AS sender_name
    FROM chat_messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.project_id = ?
    ORDER BY m.created_at ASC
  `;

  db.query(query, [projectId], (err, results) => {
    if (err) {
      console.error("Error fetching chat messages:", err.message);
      return res.status(500).json({ message: "Failed to fetch chat messages" });
    }

    res.status(200).json({ success: true, messages: results });
  });
});

// Add a new chat message
router.post("/projects/:projectId/chat", authenticateUser, (req, res) => {
  const projectId = req.params.projectId;
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ message: "Message cannot be empty" });
  }

  const senderId = req.user.id;

  const query = `
    INSERT INTO chat_messages (project_id, sender_id, message, created_at)
    VALUES (?, ?, ?, NOW())
  `;

  db.query(query, [projectId, senderId, message], (err, result) => {
    if (err) {
      console.error("Error saving chat message:", err.message);
      return res.status(500).json({ message: "Failed to send message" });
    }

    const newMessage = {
      id: result.insertId,
      project_id: projectId,
      sender_id: senderId,
      message,
      created_at: new Date(),
    };

    res.status(201).json({ success: true, newMessage });
  });
});

module.exports = router;
