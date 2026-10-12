import { useState, useRef, useEffect } from "react";
import api from "../services/api";

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! I'm your TaskFlow assistant. Ask me about planning or prioritising your work." },
  ]);

  // Holds the id of the last interaction so Gemini remembers the conversation
  const [interactionId, setInteractionId] = useState(null);

  // useRef gives us a direct handle on a DOM node without re-rendering
  const bottomRef = useRef(null);

  // Scroll to the newest message whenever the list changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();

    const text = input.trim();
    if (!text || loading) return;

    // Show the user's message immediately, before the request finishes.
    // This is called an optimistic update - it makes the UI feel instant.
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/ai/chat", {
        message: text,
        previousInteractionId: interactionId,
      });

      setMessages((prev) => [...prev, { role: "ai", text: res.data.reply }]);

      // Save the new id so the next message continues this conversation
      setInteractionId(res.data.interactionId);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: err.response?.data?.message || "Something went wrong. Try again.",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FLOATING BUTTON */}
      <button
        className="chat-fab"
        onClick={() => setOpen(!open)}
        aria-label="Toggle AI assistant"
      >
        {open ? "✕" : "AI"}
      </button>

      {/* CHAT PANEL */}
      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <strong>TaskFlow Assistant</strong>
            <span className="chat-badge">AI</span>
          </div>

          <div className="chat-body">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chat-msg chat-msg-${msg.role} ${msg.isError ? "chat-msg-error" : ""}`}
              >
                {msg.text}
              </div>
            ))}

            {loading && (
              <div className="chat-msg chat-msg-ai chat-typing">Thinking...</div>
            )}

            {/* Invisible anchor we scroll to */}
            <div ref={bottomRef} />
          </div>

          <form className="chat-input-row" onSubmit={handleSend}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
              disabled={loading}
              maxLength={1000}
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={loading || !input.trim()}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatBot;