const express = require("express");
const router = express.Router();

const officerController = require("../controllers/officer.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");



// Get escalated applications
router.get(
  "/escalated",
  authMiddleware,
  roleMiddleware("officer"),
  officerController.getEscalatedApplications
);

// Get full application details
router.get(
  "/application/:id",
  authMiddleware,
  roleMiddleware("officer"),
  officerController.getApplicationDetails
);

// Officer decision (approve/reject)
router.post(
  "/decision",
  authMiddleware,
  roleMiddleware("officer"),
  officerController.updateDecision
);

router.post(
  "/analyze-risk",
  authMiddleware,
  roleMiddleware("officer"),
  officerController.analyzeRisk
);

module.exports = router;