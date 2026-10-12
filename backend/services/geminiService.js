// The Gen AI SDK is an ES module, so in a CommonJS project we load it
// with dynamic import() inside an async function.
// We cache the client so we only create it once, not on every request.
let aiClient = null;

const getClient = async () => {
  if (aiClient) return aiClient;

  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing from your .env file");
  }

  const { GoogleGenAI } = await import("@google/genai");
  aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  return aiClient;
};

// SYSTEM INSTRUCTION: sets the assistant's persona and boundaries.
// It is sent with every request but never shown to the user.
const SYSTEM_INSTRUCTION = `You are TaskFlow Assistant, a helpful productivity
assistant inside a task management app.

Help users with: planning and breaking down tasks, prioritising work,
time management advice, and general productivity questions.

Keep answers short and practical - 2 to 4 sentences unless the user asks
for detail. Use plain text, not markdown formatting.

If asked something completely unrelated to productivity or tasks, answer
briefly and steer back to how you can help with their work.`;

/**
 * Send a message to Gemini and return the reply.
 *
 * @param {string} message              - the user's message
 * @param {string|null} previousId      - id of the last interaction, for context
 * @returns {Promise<{reply: string, interactionId: string}>}
 */
const sendMessageToGemini = async (message, previousId = null) => {
  const ai = await getClient();

  // Build the request. We only include previous_interaction_id when we
  // actually have one, so the first message starts a fresh conversation.
  const request = {
    model: "gemini-3.7-flash",
    input: message,
    system_instruction: SYSTEM_INSTRUCTION,
    generation_config: {
      temperature: 0.7,      // higher = more creative, lower = more predictable
      thinking_level: "low", // less internal reasoning = faster and cheaper
    },
  };

  if (previousId) {
    // The Interactions API stores conversation history server-side.
    // Passing the previous id is all we need for multi-turn memory -
    // we never have to send the whole chat log back.
    request.previous_interaction_id = previousId;
  }

  const interaction = await ai.interactions.create(request);

  return {
    // output_text is a convenience property that joins the final text blocks
    reply: interaction.output_text,
    interactionId: interaction.id,
  };
};

module.exports = { sendMessageToGemini };