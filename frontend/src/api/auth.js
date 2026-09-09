import { authFetch } from "./client";

/**
 * Log in a user with email and password
 * @param {Object} credentials
 * @param {string} credentials.email
 * @param {string} credentials.password
 * @returns {Promise<{ success: boolean, token: string, user: Object, message: string }>}
 */
export async function loginUser({ email, password }) {
  return authFetch("/auth/login", null, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Register a new user with name, email, and password
 * @param {Object} userData
 * @param {string} userData.name
 * @param {string} userData.email
 * @param {string} userData.password
 * @returns {Promise<{ success: boolean, token: string, user: Object, message: string }>}
 */
export async function signupUser({ name, email, password }) {
  return authFetch("/auth/signup", null, {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}
