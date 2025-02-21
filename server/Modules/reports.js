const express = require("express");
const db = require("../Config/connection");
const upload = require("../Config/multer");

const router = express.Router();


router.post("/upload-report", upload.single("reportImage"), (req, res) => {
  const { userId, reportText } = req.body;
  console.log(req.body);
  
  const reportImage = req.file ? "uploads/" + req.file.filename : null;

  if (!userId || !reportText || !reportImage) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  const query = "INSERT INTO reports (userId, reportText, reportImage) VALUES (?, ?, ?)";
  db.query(query, [userId, reportText, reportImage], (err, result) => {
    if (err) {
      console.error("Error uploading report:", err.message);
      return res.status(500).json({ success: false, message: "Failed to upload report" });
    }
    res.status(201).json({ success: true, message: "Report uploaded successfully" });
  });
});

router.get("/reports/:userId", (req, res) => {
  const { userId } = req.params;
  const query = "SELECT * FROM reports WHERE userId = ? ORDER BY createdAt DESC";
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching reports:", err.message);
      return res.status(500).json({ success: false, message: "Failed to fetch reports" });
    }
    res.status(200).json({ success: true, reports: results });
  });
});

router.get("/reports", (req, res) => {
  const query = "SELECT users.full_name, reports.* FROM reports JOIN users ON reports.userId = users.id ORDER BY reports.createdAt DESC";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching reports:", err.message);
      return res.status(500).json({ success: false, message: "Failed to fetch reports" });
    }
    res.status(200).json({ success: true, reports: results });
  });
});



module.exports = router;
