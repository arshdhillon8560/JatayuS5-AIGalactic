const BASE_URL = "https://jatayu-s5-ai-galactic.vercel.app";

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`
});

export const authAPI = {
  login: async (data) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return res.json();
  }
};

export const officerAPI = {
  getEscalated: async () => {
    const res = await fetch(`${BASE_URL}/officer/escalated`, {
      headers: getHeaders()
    });
    return res.json();
  },

  getDetails: async (id) => {
    const res = await fetch(`${BASE_URL}/officer/application/${id}`, {
      headers: getHeaders()
    });
    const data = await res.json();
    return data;
  },

  updateDecision: async (data) => {
    const res = await fetch(`${BASE_URL}/officer/decision`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  analyzeRisk: async (payload) => {
    const res = await fetch(`${BASE_URL}/officer/analyze-risk`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }

    return res.json();
  }
};
