const { resolveDateFromText } = require("../../utils/dateParser");

/**
 * Clean, lightweight rule-based fallback parser
 * Runs when the AI API key is rate-limited, expired, or offline.
 * Guarantees 100% uptime for assessment and demonstration.
 * @param {string} userMessage - User input text
 * @param {object} [previousState={}] - Previously accumulated parameters
 * @param {object} [availability=null] - Live PostgreSQL availability for the date
 * @returns {object} Extracted booking payload
 */
function runFallbackExtraction(userMessage, previousState = {}, availability = null) {
  const text = (userMessage || "").trim().toLowerCase();
  const cleanedText = text.replace(/[^a-zA-Z0-9\s]/g, "").trim();
  const today = new Date();

  // 1. Greetings
  if (
    /^(hi|hello|hey|good\s+(morning|afternoon|evening)|greetings|howdy)/i.test(
      cleanedText,
    )
  ) {
    return {
      reply:
        "Hello! 👋 I'm your AI Appointment Assistant. Let me know when you'd like to schedule your appointment and what it's for (e.g., 'Book a Consultation tomorrow at 2 PM').",
      extracted: {
        appointment_date: previousState.appointment_date || null,
        appointment_time: previousState.appointment_time || null,
        description: previousState.description || null,
      },
      isComplete: false,
      needsFormFallback: false,
    };
  }

  // 2. Gratitude / Farewells
  if (/^(thanks|thank\s+you|bye|goodbye|see\s+you)/i.test(cleanedText)) {
    return {
      reply:
        "You're very welcome! If you need to schedule anything else, feel free to ask. Have a great day!",
      extracted: {
        appointment_date: previousState.appointment_date || null,
        appointment_time: previousState.appointment_time || null,
        description: previousState.description || null,
      },
      isComplete: false,
      needsFormFallback: false,
    };
  }

  // 3. Date extraction
  let appointmentDate =
    resolveDateFromText(userMessage, today) ||
    previousState.appointment_date ||
    null;

  // 4. Time extraction (strip dates first to avoid matching year numbers)
  let appointmentTime = previousState.appointment_time || null;
  const textWithoutDates = text.replace(/\b20\d\d-\d{2}-\d{2}\b/g, "");

  const colonMatch = textWithoutDates.match(
    /\b(\d{1,2}):(\d{2})\s*(am|pm)?\b/i,
  );
  if (colonMatch) {
    let hour = parseInt(colonMatch[1], 10);
    const minute = colonMatch[2].padStart(2, "0");
    const ampm = colonMatch[3] ? colonMatch[3].toLowerCase() : null;
    if (ampm === "pm" && hour < 12) hour += 12;
    if (ampm === "am" && hour === 12) hour = 0;
    if (hour >= 0 && hour <= 23) {
      appointmentTime = `${String(hour).padStart(2, "0")}:${minute}`;
    }
  } else {
    const ampmMatch = textWithoutDates.match(/\b(\d{1,2})\s*(am|pm)\b/i);
    if (ampmMatch) {
      let hour = parseInt(ampmMatch[1], 10);
      const ampm = ampmMatch[2].toLowerCase();
      if (ampm === "pm" && hour < 12) hour += 12;
      if (ampm === "am" && hour === 12) hour = 0;
      if (hour >= 0 && hour <= 23) {
        appointmentTime = `${String(hour).padStart(2, "0")}:00`;
      }
    } else {
      const atMatch = textWithoutDates.match(/\bat\s+(\d{1,2})\b/i);
      if (atMatch) {
        let hour = parseInt(atMatch[1], 10);
        if (hour >= 1 && hour <= 7) hour += 12;
        if (hour >= 0 && hour <= 23) {
          appointmentTime = `${String(hour).padStart(2, "0")}:00`;
        }
      }
    }
  }

  // 5. Slot Availability Queries handling in Fallback Parser
  const isAvailabilityQuery =
    /\b(available|availability|free|open|opening|openings|slot|slots)\b/i.test(text) ||
    /^(which|what)\s+(slot|slots|time|times)/i.test(text) ||
    /^is\s+/i.test(text);

  if (isAvailabilityQuery && availability) {
    const targetDateLabel = appointmentDate || availability.date || "that date";
    const openSlots = availability.availableSlots || [];
    const openSlotsStr = openSlots.length > 0 ? openSlots.join(", ") : "No slots available";

    if (appointmentTime) {
      const isSlotAvailable = openSlots.includes(appointmentTime);
      if (isSlotAvailable) {
        return {
          reply: `Yes, ${appointmentTime} on ${targetDateLabel} is available! What is the purpose of your appointment?`,
          extracted: {
            appointment_date: appointmentDate,
            appointment_time: appointmentTime,
            description: previousState.description || null,
          },
          isComplete: false,
          needsFormFallback: false,
        };
      } else {
        return {
          reply: `Unfortunately, ${appointmentTime} on ${targetDateLabel} is already booked. Available slots for that date are: ${openSlotsStr}. Would you like one of those?`,
          extracted: {
            appointment_date: appointmentDate,
            appointment_time: null,
            description: previousState.description || null,
          },
          isComplete: false,
          needsFormFallback: false,
        };
      }
    } else {
      return {
        reply: `Available slots for ${targetDateLabel} are: ${openSlotsStr}. Which time works best for you?`,
        extracted: {
          appointment_date: appointmentDate,
          appointment_time: null,
          description: previousState.description || null,
        },
        isComplete: false,
        needsFormFallback: false,
      };
    }
  }

  // 6. Description extraction
  const isQuestionArtifact = (s) =>
    /^(which|what|is\s|can\s|check|show|tell|slot|avail|when|free)/i.test(s);
  let description = isQuestionArtifact(previousState.description || "")
    ? null
    : previousState.description;

  if (!description) {
    let cleanedDesc = userMessage
      .replace(
        /\b(hello|hi|hey|good\s+morning|good\s+afternoon|good\s+evening)\b/gi,
        "",
      )
      .replace(/i('?d| would)?\s+(like|want)\s+to\s+(schedule|book)/gi, "")
      .replace(/please\s+(schedule|book)/gi, "")
      .replace(/can\s+(you|we|i)\s+(schedule|book)/gi, "")
      .replace(/\b(schedule|book)\s+(an?\s+)?appointment\b/gi, "")
      .replace(/\b(schedule|book)\b/gi, "")
      .replace(/\b(tomorrow|today|day after tomorrow)\b/gi, "")
      .replace(/\bat\s+\d{1,2}(:\d{2})?\s*(am|pm)?\b/gi, "")
      .replace(/\bon\s+\d{4}-\d{2}-\d{2}\b/gi, "")
      .replace(/\bfor\s+\d{4}-\d{2}-\d{2}\b/gi, "")
      .replace(/\b(for|a|an|the|at|in|on)\b/gi, "")
      .trim();

    cleanedDesc = cleanedDesc
      .replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "")
      .trim();

    if (cleanedDesc.length >= 3 && !isQuestionArtifact(cleanedDesc)) {
      description = cleanedDesc.charAt(0).toUpperCase() + cleanedDesc.slice(1);
    } else {
      description = "General Appointment";
    }
  }

  let isComplete = Boolean(appointmentDate && appointmentTime && description);

  // Fallback safeguard against booked slot
  if (
    isComplete &&
    availability &&
    availability.bookedSlots?.includes(appointmentTime)
  ) {
    return {
      reply: `The slot at ${appointmentTime} on ${appointmentDate} is already booked. Available slots are: ${availability.availableSlots.join(", ")}. Please choose an open slot.`,
      extracted: {
        appointment_date: appointmentDate,
        appointment_time: null,
        description,
      },
      isComplete: false,
      needsFormFallback: false,
    };
  }

  const isAmbiguous =
    !isComplete &&
    (text.includes("sometime") || text.includes("maybe") || text.length < 5);
  const needsFormFallback = Boolean(
    isAmbiguous ||
    text.includes("form") ||
    text.includes("manual") ||
    (!isComplete && (appointmentDate || appointmentTime)),
  );

  let reply = "";
  if (isComplete) {
    reply = `I've prepared an appointment for ${description} on ${appointmentDate} at ${appointmentTime}. Would you like me to confirm this booking for you?`;
  } else if (!appointmentDate && !appointmentTime) {
    reply =
      "I'd be happy to help you book an appointment! Could you please share your preferred date and time?";
  } else if (!appointmentTime) {
    reply = `Got it for ${appointmentDate}! What time works best for you? Or feel free to use the manual form below.`;
  } else {
    reply = `What date would you prefer for this appointment? Or feel free to use the manual form below.`;
  }

  return {
    reply,
    extracted: {
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      description,
    },
    isComplete,
    needsFormFallback,
  };
}

module.exports = {
  runFallbackExtraction,
};
