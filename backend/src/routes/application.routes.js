const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

const controller = require("../controllers/application.controller");

// Create application
router.post("/create", authMiddleware, controller.createApplication);

// Step 1: Profile
router.post("/profile", authMiddleware, controller.saveProfile);

// Step 2: Employment
router.post("/employment", authMiddleware, controller.saveEmployment);

// Step 3: Financial
router.post("/financial", authMiddleware, controller.saveFinancial);

// Step 4: Upload documents (S3)
router.post(
  "/upload",
  authMiddleware,
  upload.fields([
    { name: "bank_statement", maxCount: 1 },
    { name: "salary_slip", maxCount: 1 },
    { name: "itr_document", maxCount: 1 },
    { name: "collateral_document", maxCount: 1 },
  ]),
  controller.uploadDocuments
);

// Track application
router.get("/status/:id", authMiddleware, controller.trackApplication);

// Get all user applications
router.get("/all", authMiddleware, controller.getUserApplications);

router.get(
  "/:id/ai-analysis",authMiddleware,
  controller.getApplicationAIAnalysis
);

module.exports = router;