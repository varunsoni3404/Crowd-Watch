// server/routes/reports.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  createReport,
  getUserReports,
  getReportById,
  updateReportStatus,
  deleteReport,
} = require("../controllers/reportController");
const { auth } = require("../middleware/auth");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "report-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post("/", auth, upload.single("photo"), createReport);

router.get("/my-reports", auth, getUserReports);

router.get("/:id", auth, getReportById);

router.put("/:id/status", auth, updateReportStatus);

router.delete("/:id", auth, deleteReport);

module.exports = router;
