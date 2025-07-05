const express = require("express");
const router = express.Router();
const {
  getAvailableDates,
  getBookedSlots,
  scheduleMeeting,
} = require("../controllers/scheduleController");

router.post("/api/schedule", scheduleMeeting);
router.get("/api/available-dates", getAvailableDates);

// GET /api/booked-slots
router.get("/api/booked-slots", getBookedSlots);

module.exports = router;
