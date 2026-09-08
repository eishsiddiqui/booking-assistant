const { Mistral } = require("@mistralai/mistralai");
const config = require("../config");

// Initialize Mistral client if API key is present
let mistralClient = null;
if (config.ai.mistralApiKey) {
  try {
    mistralClient = new Mistral({ apiKey: config.ai.mistralApiKey });
  } catch (err) {
    console.warn("[AI Service] Warning: Failed to initialize Mistral client:", err.message);
  }
}

/**
 * Format system prompt with temporal grounding
 * @param {Date} referenceDate - Current server date for resolving relative dates
 * @returns {string} System prompt
 */
function getSystemPrompt(referenceDate = new Date()) {
  const dateStr = referenceDate.toISOString().split("T")[0];
  const dayName = referenceDate.toLocaleDateString("en-US", { weekday: "long" });

  return `You are an intelligent appointment booking AI assistant for a SaaS scheduling platform.
Current temporal context: Today is ${dayName}, ${dateStr}.

Your goals:
1. Converse naturally, politely, and concisely with users to help them schedule appointments.
2. Accurately understand requests and extract booking details:
   - appointment_date: normalize strictly to YYYY-MM-DD. Resolve relative dates like 'tomorrow', 'next Monday', 'September 12' relative to today (${dateStr}).
   - appointment_time: normalize strictly to 24-hour HH:MM format (e.g., '2 PM' -> '14:00', '9:30 AM' -> '09:30').
   - description: brief purpose of the appointment (e.g., 'Dental Checkup', 'General Consultation').
3. Multi-turn continuity: preserve previously agreed details across turns. If the user only provides missing details (e.g. 'at 3 PM'), merge with existing context.
4. Fallback guardrails:
   - If user input is ambiguous, vague, or missing key booking parameters (e.g., 'I want an appointment next week' without date/time), ask clarifying questions, set isAmbiguous: true, and set needsFormFallback: true.
   - If the user explicitly asks for a manual form or prefers entering details themselves, set needsFormFallback: true.
   - If all 3 fields (appointment_date, appointment_time, description) are successfully identified, set isComplete: true and invite confirmation.

CRITICAL: You MUST respond ONLY with a valid JSON object adhering to this schema:
{
  "reply": "Friendly response to the user",
  "extracted": {
    "appointment_date": "YYYY-MM-DD or null",
    "appointment_time": "HH:MM or null",
    "description": "string or null"
  },
  "isComplete": true/false,
  "isAmbiguous": true/false,
  "needsFormFallback": true/false
}
Do not include markdown codeblocks (no \`\`\`json). Output pure JSON only.`;
}

/**
 * Heuristic/Rule-based Fallback Parser
 * Used when Mistral API key is not configured, offline, or rate-limited.
 * Guarantees zero downtime and complete testability.
 */
function runFallbackExtraction(userMessage, previousState = {}) {
  const text = userMessage.trim().toLowerCase();
  const today = new Date();

  let appointmentDate = previousState.appointment_date || null;
  let appointmentTime = previousState.appointment_time || null;
  let description = previousState.description || null;

  // Relative Date detection
  if (text.includes("today")) {
    appointmentDate = today.toISOString().split("T")[0];
  } else if (text.includes("tomorrow")) {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    appointmentDate = d.toISOString().split("T")[0];
  } else if (text.includes("day after tomorrow")) {
    const d = new Date(today);
    d.setDate(d.getDate() + 2);
    appointmentDate = d.toISOString().split("T")[0];
  } else {
    // Check YYYY-MM-DD format
    const isoDateMatch = text.match(/\b(20\d\d)-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/);
    if (isoDateMatch) {
      appointmentDate = isoDateMatch[0];
    }
  }

  // Time detection (e.g. 2pm, 2:30pm, 14:00, 10 am)
  const timeMatch = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[2] ? timeMatch[2].padStart(2, "0") : "00";
    const ampm = timeMatch[3] ? timeMatch[3].toLowerCase() : null;

    if (ampm === "pm" && hour < 12) hour += 12;
    if (ampm === "am" && hour === 12) hour = 0;

    // Validate sane hour
    if (hour >= 0 && hour <= 23 && !text.includes("202")) {
      appointmentTime = `${String(hour).padStart(2, "0")}:${minute}`;
    }
  }

  // Description detection
  if (!description) {
    let cleanedDesc = userMessage
      .replace(/i('?d| would)?\s+(like|want)\s+to\s+(schedule|book)/gi, "")
      .replace(/please\s+(schedule|book)/gi, "")
      .replace(/can\s+(you|we|i)\s+(schedule|book)/gi, "")
      .replace(/\b(schedule|book)\s+(an?\s+)?appointment\b/gi, "")
      .replace(/\b(schedule|book)\b/gi, "")
      .replace(/\b(tomorrow|today|day after tomorrow)\b/gi, "")
      .replace(/\bat\s+\d{1,2}(:\d{2})?\s*(am|pm)?\b/gi, "")
      .replace(/\bon\s+\d{4}-\d{2}-\d{2}\b/gi, "")
      .replace(/\b(for|a|an|the)\b/gi, "")
      .trim();

    // Clean leading/trailing punctuation and spaces
    cleanedDesc = cleanedDesc.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "").trim();

    if (cleanedDesc.length >= 3) {
      description = cleanedDesc.charAt(0).toUpperCase() + cleanedDesc.slice(1);
    } else {
      description = "General Consultation";
    }
  }

  const isComplete = Boolean(appointmentDate && appointmentTime && description);
  const isAmbiguous = !isComplete && (text.includes("sometime") || text.includes("maybe") || text.includes("later") || text.length < 5);
  const needsFormFallback = isAmbiguous || text.includes("form") || text.includes("manual");

  let reply = "";
  if (isComplete) {
    reply = `I've prepared an appointment for ${description} on ${appointmentDate} at ${appointmentTime}. Would you like me to confirm this booking for you?`;
  } else if (!appointmentDate && !appointmentTime) {
    reply = `I'd be glad to help you book an appointment! Could you please let me know your preferred date and time?`;
  } else if (!appointmentTime) {
    reply = `Got it for ${appointmentDate}! What time works best for you?`;
  } else {
    reply = `What date would you prefer for this appointment?`;
  }

  return {
    reply,
    extracted: {
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      description,
    },
    isComplete,
    isAmbiguous,
    needsFormFallback,
  };
}

/**
 * Process a user message through the AI Integration Service
 * @param {object} params
 * @param {string} params.userMessage - User's latest input
 * @param {Array<object>} [params.history=[]] - Previous messages in current session
 * @param {object} [params.previousExtracted={}] - Slot state accumulated so far
 * @returns {Promise<object>} Standardized AI response payload
 */
const processMessage = async ({ userMessage, history = [], previousExtracted = {} }) => {
  const startTime = Date.now();

  // If Mistral client is not available or key is not set, use fallback parser
  if (!mistralClient || !config.ai.mistralApiKey) {
    console.log("[AI Service] MISTRAL_API_KEY not configured. Utilizing intelligent fallback extraction engine.");
    const fallbackResult = runFallbackExtraction(userMessage, previousExtracted);
    const duration = Date.now() - startTime;
    console.log(`[AI Service Log] Mode: Fallback | Latency: ${duration}ms | Complete: ${fallbackResult.isComplete} | Extracted:`, fallbackResult.extracted);
    return fallbackResult;
  }

  try {
    // Prepare multi-turn context
    const messages = [
      { role: "system", content: getSystemPrompt() },
    ];

    // Include previous history (up to last 8 turns)
    const recentHistory = history.slice(-8);
    for (const msg of recentHistory) {
      if (msg.sender === "user") {
        messages.push({ role: "user", content: msg.text });
      } else if (msg.sender === "ai" || msg.sender === "assistant") {
        messages.push({ role: "assistant", content: msg.text });
      }
    }

    // Append context of previously accumulated parameters if any
    let contextualUserMessage = userMessage;
    if (previousExtracted && (previousExtracted.appointment_date || previousExtracted.appointment_time || previousExtracted.description)) {
      contextualUserMessage += `\n[Context from previous turns: ${JSON.stringify(previousExtracted)}]`;
    }

    messages.push({ role: "user", content: contextualUserMessage });

    // Call Mistral Chat API
    const response = await mistralClient.chat.complete({
      model: config.ai.model || "mistral-small-latest",
      messages,
      responseFormat: { type: "json_object" },
      temperature: 0.2,
      maxTokens: 500,
    });

    const rawContent = response.choices?.[0]?.message?.content;
    const duration = Date.now() - startTime;

    if (!rawContent) {
      throw new Error("Empty response received from Mistral API");
    }

    // Parse JSON
    let parsed;
    try {
      parsed = typeof rawContent === "string" ? JSON.parse(rawContent) : rawContent;
    } catch {
      // Regex recovery if JSON was wrapped in markdown
      const match = rawContent.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error("Invalid JSON structure returned by LLM");
      }
    }

    const result = {
      reply: parsed.reply || "I'm ready to help you schedule your appointment.",
      extracted: {
        appointment_date: parsed.extracted?.appointment_date || previousExtracted.appointment_date || null,
        appointment_time: parsed.extracted?.appointment_time || previousExtracted.appointment_time || null,
        description: parsed.extracted?.description || previousExtracted.description || null,
      },
      isComplete: Boolean(parsed.isComplete),
      isAmbiguous: Boolean(parsed.isAmbiguous),
      needsFormFallback: Boolean(parsed.needsFormFallback),
    };

    // Logging AI interaction for debugging and observability
    console.log(`[AI Service Log] Mode: Mistral (${config.ai.model}) | Latency: ${duration}ms | Tokens: ${response.usage?.totalTokens || "N/A"} | Complete: ${result.isComplete} | Extracted:`, result.extracted);

    return result;
  } catch (error) {
    console.error("[AI Service Error] Mistral API error, gracefully degrading to fallback parser:", error.message);
    const fallbackResult = runFallbackExtraction(userMessage, previousExtracted);
    return fallbackResult;
  }
};

module.exports = {
  processMessage,
  runFallbackExtraction,
};
