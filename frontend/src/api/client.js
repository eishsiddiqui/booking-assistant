export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
/**
 * Shared authenticated fetch client with standardized error handling
 * @param {string} endpoint - API path (e.g. '/appointments', '/chat/message')
 * @param {string} [token] - JWT authentication token
 * @param {RequestInit} [options={}] - Custom fetch options (method, body, headers)
 * @returns {Promise<any>}
 */
export async function authFetch(endpoint, token, options = {}) {
  try {
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage =
        data?.message ||
        (response.status === 401
          ? "Your session has expired. Please log in again."
          : response.status === 409
            ? "This time slot is already booked. Please choose a different date or time."
            : `Request failed with status ${response.status}`);
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (
      err.name === "TypeError" &&
      err.message.toLowerCase().includes("fetch")
    ) {
      throw new Error(
        "Could not connect to the server. Please ensure the backend is running.",
        { cause: err },
      );
    }
    throw err;
  }
}
