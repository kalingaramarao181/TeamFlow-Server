const express = require("express");
const router = express.Router();
const db = require("../Config/connection");
const upload = require("../Config/multer");

// GET Issues - Callback-based Query
router.get("/issues", (req, res) => {
  const query = "SELECT * FROM issues ORDER BY created_at DESC";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching issues:", err.message);
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch issues" });
    }

    res.status(200).json({ success: true, issues: results });
  });
});

// POST Issues - Insert a new issue
router.post("/issues", upload.single("attachment"), (req, res) => {
  const {
    project,
    issueType,
    status,
    summary,
    description,
    priority,
    team,
    labels,
    sprint,
    linkedIssueType,
    linkedIssue,
    assignee,
  } = req.body;

  const attachment = req.file ? req.file.filename : null;

  const sql = `
    INSERT INTO issues 
    (project, issue_type, status, summary, description, priority, team, labels, sprint, 
    linked_issue_type, linked_issue, assignee, attachment)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      project,
      issueType,
      status || "To Do",
      summary,
      description,
      priority || "Medium",
      team,
      labels,
      sprint,
      linkedIssueType || "blocks",
      linkedIssue,
      assignee || "Automatic",
      attachment,
    ],
    (err, result) => {
      if (err) {
        console.error("Database Insert Error:", err);
        return res
          .status(500)
          .send({ message: "Failed to create issue", error: err });
      }

      res
        .status(200)
        .send({ message: "Issue created successfully", id: result.insertId });
    }
  );
});

module.exports = router;
