// Detect if running locally or deployed
const isLocal = window.location.hostname === "localhost";

// Use local backend while developing
const API_BASE_URL = isLocal
  ? "http://127.0.0.1:8000"
  : "https://wealth-backend-wv7y.onrender.com";

export default API_BASE_URL;
