const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Log in a user with email and password
 * @param {Object} credentials
 * @param {string} credentials.email
 * @param {string} credentials.password
 * @returns {Promise<{ success: boolean, token: string, user: Object, message: string }>}
 */
export async function loginUser({ email, password }) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage =
        data?.message ||
        (response.status === 401
          ? "Invalid email or password."
          : `Login failed with status ${response.status}`);
      throw new Error(errorMessage);
    }

    return data;
  } catch (err) {
    if (err.name === "TypeError" && err.message.toLowerCase().includes("fetch")) {
      throw new Error(
        "Could not connect to the authentication server. Please check your network or ensure the backend server is running.",
        { cause: err }
      );
    }
    throw err;
  }
}
