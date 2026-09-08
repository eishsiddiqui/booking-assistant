/**
 * Generate a unique ID with optional prefix
 * @param {string} prefix
 * @returns {string}
 */
export function generateUniqueId(prefix = "apt") {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Math.floor(Math.random() * 1e9).toString(36)}`;
}
