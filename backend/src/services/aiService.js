const Groq = require("groq-sdk");
const config = require("../config");
const appointmentService = require("./appointmentService");
const { resolveDateFromText } = require("../utils/dateParser");
const { getSystemPrompt } = require("./ai/aiPrompt");
const { runFallbackExtraction } = require("./ai/fallbackParser");

// Initialize Groq client if API key is present
let groqClient = null;
if (config.ai.groqApiKey) {
  try {
    groqClient = new Groq({ apiKey: config.ai.groqApiKey });
  } catch (err) {
    console.warn("[AI Service] Failed to initialize Groq client:", err.message);
  }
}

/**
 * Process a user message through the AI Integration Service
 * @param {object} params
 * @param {string} params.userMessage - User's latest input
 * @param {Array<object>} [params.history=[]] - Previous messages in current session
 * @param {object} [params.previousExtracted={}] - Accumulated booking details across turns
 * @returns {Promise<object>} Standardized AI response payload
 */
const processMessage = async ({
  userMessage,
  history = [],
  previousExtracted = {},
}) => {
  const startTime = Date.now();

  // 1. Resolve date to check database availability
  const resolvedDate =
    resolveDateFromText(userMessage) ||
    previousExtracted.appointment_date ||
    (/\b(available|availability|slot|slots|free|open|opening|openings)\b/i.test(userMessage)
      ? new Date().toISOString().split("T")[0]
      : null);

  let slotAvailability = null;
  if (resolvedDate) {
    try {
      slotAvailability = await appointmentService.getAvailabilityForDate(resolvedDate);
    } catch (err) {
      console.warn("[AI Service] Could not fetch slot availability:", err.message);
    }
  }

  // If Groq client is not available or key is not set, use fallback parser
  if (!groqClient || !config.ai.groqApiKey) {
    console.log("[AI Service Log] Mode: Fallback Parser (Zero Downtime)");
    const fallbackResult = runFallbackExtraction(
      userMessage,
      previousExtracted,
      slotAvailability,
    );
    const duration = Date.now() - startTime;
    console.log(
      `[AI Interaction Log] Latency: ${duration}ms | Mode: Fallback | Complete: ${fallbackResult.isComplete} | Extracted:`,
      fallbackResult.extracted,
    );
    return fallbackResult;
  }

  try {
    // Multi-turn context preparation
    const messages = [{ role: "system", content: getSystemPrompt() }];

    // Include recent conversation history (up to last 6 turns)
    const recentHistory = history.slice(-6);
    for (const msg of recentHistory) {
      if (msg.sender === "user") {
        messages.push({ role: "user", content: msg.text });
      } else if (msg.sender === "ai" || msg.sender === "assistant") {
        messages.push({ role: "assistant", content: msg.text });
      }
    }

    // Append context of previously accumulated parameters
    let contextualUserMessage = userMessage;
    if (
      previousExtracted &&
      (previousExtracted.appointment_date ||
        previousExtracted.appointment_time ||
        previousExtracted.description)
    ) {
      contextualUserMessage += `\n[Context from previous turns: ${JSON.stringify(previousExtracted)}]`;
    }

    // Inject live database slot availability
    if (slotAvailability) {
      contextualUserMessage += `\n[Live Database Slot Availability for ${slotAvailability.date}]:
- Available slots: ${slotAvailability.availableSlots.length > 0 ? slotAvailability.availableSlots.join(", ") : "None (All slots booked for this date)"}
- Booked slots: ${slotAvailability.bookedSlots.length > 0 ? slotAvailability.bookedSlots.join(", ") : "None"}`;
    }

    messages.push({ role: "user", content: contextualUserMessage });

    // Call Groq API with JSON mode enabled
    const response = await groqClient.chat.completions.create({
      model: config.ai.model || "qwen/qwen3.8-27b",
      messages,
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 400,
    });

    const rawContent = response.choices?.[0]?.message?.content;
    const duration = Date.now() - startTime;

    if (!rawContent) {
      throw new Error("Empty response received from LLM API");
    }

    let parsed;
    try {
      parsed =
        typeof rawContent === "string" ? JSON.parse(rawContent) : rawContent;
    } catch {
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
        appointment_date:
          parsed.extracted?.appointment_date ||
          previousExtracted.appointment_date ||
          null,
        appointment_time:
          parsed.extracted?.appointment_time ||
          previousExtracted.appointment_time ||
          null,
        description:
          parsed.extracted?.description ||
          previousExtracted.description ||
          (parsed.isComplete ? "General Appointment" : null),
      },
      isComplete: Boolean(parsed.isComplete),
      needsFormFallback: Boolean(parsed.needsFormFallback),
    };

    // Safeguard: If the slot is booked according to live DB, prevent isComplete: true
    if (
      result.isComplete &&
      slotAvailability &&
      result.extracted?.appointment_time &&
      slotAvailability.bookedSlots.includes(result.extracted.appointment_time)
    ) {
      result.isComplete = false;
      result.reply = `The slot at ${result.extracted.appointment_time} is already booked. Available slots are: ${slotAvailability.availableSlots.join(", ")}. Please choose an available time.`;
      result.extracted.appointment_time = null;
    }

    // Log AI interaction for debugging and analytics
    console.log(
      `[AI Interaction Log] Latency: ${duration}ms | Model: ${config.ai.model} | Tokens: ${response.usage?.total_tokens || "N/A"} | Complete: ${result.isComplete} | Extracted:`,
      result.extracted,
    );

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.warn(
      `[AI Service Log] Groq LLM unavailable (${error.message}). Smoothly utilizing fallback parser.`,
    );
    const fallbackResult = runFallbackExtraction(
      userMessage,
      previousExtracted,
      slotAvailability,
    );
    console.log(
      `[AI Interaction Log] Latency: ${duration}ms | Mode: Fallback | Complete: ${fallbackResult.isComplete} | Extracted:`,
      fallbackResult.extracted,
    );
    return fallbackResult;
  }
};

module.exports = {
  processMessage,
  runFallbackExtraction,
  resolveDateFromText,
};
