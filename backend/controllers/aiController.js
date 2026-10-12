const { sendMessageToGemini } = require("../services/geminiService");

// @desc   Send a message to the AI assistant
// @route  POST /api/ai/chat
// @access Private
const chatWithAI = async (req, res) => {
  try {
    const { message, previousInteractionId } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // Guard against very long inputs running up token costs
    if (message.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Message is too long (max 1000 characters)",
      });
    }

    const result = await sendMessageToGemini(
      message.trim(),
      previousInteractionId || null
    );

    res.status(200).json({
      success: true,
      reply: result.reply,
      interactionId: result.interactionId,
    });
  } catch (error) {
    console.error("Gemini error:", error.message);

    // Translate common upstream failures into useful messages.
    // Never leak the raw SDK error to the client.
    let userMessage = "The AI assistant is unavailable right now.";

    if (error.message.includes("GEMINI_API_KEY")) {
      userMessage = "AI is not configured on the server.";
    } else if (error.message.includes("429") || error.message.includes("quota")) {
      userMessage = "Rate limit reached. Please wait a moment and try again.";
    } else if (error.message.includes("API key")) {
      userMessage = "Invalid API key. Check the server configuration.";
    }

    res.status(500).json({ success: false, message: userMessage });
  }
};

module.exports = { chatWithAI };