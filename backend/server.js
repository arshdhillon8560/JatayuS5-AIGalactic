require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();


app.use(cors());
app.use(express.json());
app.use(morgan("dev"));


app.use("/auth", require("./src/routes/auth.routes"));
app.use("/application", require("./src/routes/application.routes"));
app.use("/kyc", require("./src/routes/kyc.routes"));
app.use("/officer", require("./src/routes/officer.routes"));


app.get("/", (req, res) => {
  res.send("🚀 Loan Backend Running");
});


app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(500).json({
    error: err.message || "Internal Server Error",
  });
});


const PORT = process.env.PORT || 5000;


const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err.message);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err.message);
  process.exit(1);
});


process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received...");
  server.close(() => process.exit(0));
});

process.on("SIGINT", () => {
  console.log("🛑 SIGINT received...");
  server.close(() => process.exit(0));
});