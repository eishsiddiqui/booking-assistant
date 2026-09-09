/**
 * Resolve target date from natural language text relative to referenceDate
 * @param {string} text - User message text
 * @param {Date} [referenceDate=new Date()] - Base date to calculate relative dates from
 * @returns {string|null} YYYY-MM-DD or null if no date recognized
 */
function resolveDateFromText(text, referenceDate = new Date()) {
  const lower = (text || "").toLowerCase();
  const ref = new Date(referenceDate);

  if (lower.includes("day after tomorrow")) {
    ref.setDate(ref.getDate() + 2);
    return ref.toISOString().split("T")[0];
  }
  if (lower.includes("tomorrow")) {
    ref.setDate(ref.getDate() + 1);
    return ref.toISOString().split("T")[0];
  }
  if (lower.includes("today") || lower.includes("tonight")) {
    return ref.toISOString().split("T")[0];
  }

  // Check ISO format YYYY-MM-DD
  const isoMatch = lower.match(/\b(20\d\d)-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/);
  if (isoMatch) {
    return isoMatch[0];
  }

  // Weekday names
  const weekdays = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  for (let i = 0; i < weekdays.length; i++) {
    if (new RegExp(`\\b${weekdays[i]}\\b`, "i").test(lower)) {
      const currentDay = ref.getDay();
      let diff = i - currentDay;
      if (diff <= 0) diff += 7; // Next upcoming occurrence
      ref.setDate(ref.getDate() + diff);
      return ref.toISOString().split("T")[0];
    }
  }

  return null;
}

module.exports = {
  resolveDateFromText,
};
