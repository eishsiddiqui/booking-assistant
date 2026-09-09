/**
 * Safe date and time formatting utilities
 * Prevents "Invalid Date" bugs from ISO string / timezone conversions
 */

/**
 * Helper to parse and format date strings with given Intl options
 * @param {string|Date} dateInput
 * @param {Intl.DateTimeFormatOptions} options
 * @returns {string}
 */
function formatDateWithOptions(dateInput, options) {
  if (!dateInput) return "";

  try {
    let cleanDate = typeof dateInput === "string" ? dateInput.trim() : "";

    // If it is an ISO string like "2026-09-09T00:00:00.000Z", grab just the date portion
    if (cleanDate.includes("T")) {
      cleanDate = cleanDate.split("T")[0];
    }

    const parts = cleanDate.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);

      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-US", options);
      }
    }

    const fallback = new Date(dateInput);
    if (!isNaN(fallback.getTime())) {
      return fallback.toLocaleDateString("en-US", options);
    }

    return String(dateInput);
  } catch {
    return String(dateInput);
  }
}

/**
 * Format date string (YYYY-MM-DD or ISO string) into readable format (e.g., "Sep 9, 2026")
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatDate(dateInput) {
  return formatDateWithOptions(dateInput, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format date string with weekday for detail views (e.g., "Wed, Sep 9, 2026")
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatFullDate(dateInput) {
  if (!dateInput) return "Not specified";
  return formatDateWithOptions(dateInput, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format time (HH:MM or HH:MM:SS) into 12-hour format (e.g., "10:00 AM" or "2:30 PM")
 * @param {string} timeStr
 * @returns {string}
 */
export function formatTime(timeStr) {
  if (!timeStr) return "";

  try {
    const cleanTime = String(timeStr).trim();
    const parts = cleanTime.split(":");
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1] ? parts[1].slice(0, 2) : "00";

    if (isNaN(hours)) return cleanTime;

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${hours}:${minutes} ${ampm}`;
  } catch {
    return String(timeStr);
  }
}
