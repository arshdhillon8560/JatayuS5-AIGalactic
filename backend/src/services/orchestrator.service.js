const axios = require("axios");


const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_URL;

// axios instance
const api = axios.create({
  baseURL: ORCHESTRATOR_URL,
  timeout: 60000, 
});


exports.sendToOrchestrator = async (application_id) => {
  try {
    console.log("📤 Sending to orchestrator:", application_id);

    const response = await api.post("/", {
      application_id,
    });

    console.log("✅ Orchestrator response received");

    return response.data;

  } catch (error) {
    console.error(
      "❌ Orchestrator Error:",
      error.response?.data || error.message
    );

    return {
      success: false,
      message: "Failed to process application",
    };
  }
};