import axios from "axios";

// Create a pre-configured axios instance.
// Every request made with "api" starts from this base URL,
// so we write api.get("/tasks") instead of the full address.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

// REQUEST INTERCEPTOR
// Runs before EVERY request leaves the browser.
// This is why no component ever has to think about the token.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
// Runs after EVERY response arrives.
// If the backend says 401, the token is expired or invalid,
// so we clear it and send the user back to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Avoid an infinite redirect loop if we are already on /login
      if (!window.location.pathname.includes("login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;