// Add this to your existing routes file (e.g. routes/application.js)
// alongside your other application routes
 
const { analyzeRisk } = require("../controllers/applicationController");
const { verifyToken } = require("../middleware/auth"); // your existing auth middleware
 
// POST /api/analyze-risk
router.post("/analyze-risk", verifyToken, analyzeRisk);