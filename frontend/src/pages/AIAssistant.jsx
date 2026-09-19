import { useState } from "react";
import "./AIAssistant.css";

function AIAssistant({ onBack }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const askAssistant = async (customQuestion = null) => {
    const text = (
      customQuestion !== null
        ? customQuestion
        : question
    ).trim();

    if (!text || loading) {
      return;
    }

    setQuestion("");
    setError("");

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: text,
      },
    ]);

    try {
      setLoading(true);

      const token =
        localStorage.getItem("access_token");

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      const response = await fetch(
        "http://127.0.0.1:8000/api/assistant/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization:
              "Bearer " + token,
          },
          body: JSON.stringify({
            question: text,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            "Failed to get AI response."
        );
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            data.answer ||
            "No answer received.",
        },
      ]);
    } catch (err) {
      console.error(
        "AI Assistant error:",
        err
      );

      setError(
        err.message ||
          "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    askAssistant();
  };

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  const formatAnswer = (text) => {
    return text
      .split("\n")
      .map((line, index) => (
        <span key={index}>
          {line}
          {index <
            text.split("\n").length - 1 && (
            <br />
          )}
        </span>
      ));
  };

  return (
    <div className="assistant-page">
      <header className="assistant-header">
        <div>
          <button
            className="assistant-back-button"
            onClick={onBack}
          >
            ← Back to Dashboard
          </button>

          <p className="assistant-eyebrow">
            GENERATIVE AI
          </p>

          <h1>AI Product Assistant</h1>

          <p className="assistant-description">
            Ask questions about customer feedback,
            themes, pain points, feature requests
            and product priorities.
          </p>
        </div>
      </header>

      <main className="assistant-container">
        {messages.length === 0 ? (
          <section className="assistant-welcome">
            <div className="assistant-icon">
              ✦
            </div>

            <h2>
              How can I help with your product?
            </h2>

            <p>
              Ask the AI Product Assistant
              questions based on your customer
              feedback and product insights.
            </p>

            <div className="suggestion-grid">
              <button
                onClick={() =>
                  askAssistant(
                    "Which feature is requested most by customers?"
                  )
                }
              >
                <span>↗</span>
                Most requested feature
              </button>

              <button
                onClick={() =>
                  askAssistant(
                    "What are the main customer pain points?"
                  )
                }
              >
                <span>⚠</span>
                Main customer pain points
              </button>

              <button
                onClick={() =>
                  askAssistant(
                    "What themes are present in the customer feedback?"
                  )
                }
              >
                <span>◈</span>
                Customer themes
              </button>

              <button
                onClick={() =>
                  askAssistant(
                    "Which product areas should the team focus on?"
                  )
                }
              >
                <span>✦</span>
                Product focus areas
              </button>
            </div>
          </section>
        ) : (
          <section className="chat-area">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message-row ${
                  message.role === "user"
                    ? "user-row"
                    : "assistant-row"
                }`}
              >
                {message.role ===
                  "assistant" && (
                  <div className="message-avatar">
                    ✦
                  </div>
                )}

                <div
                  className={`message-bubble ${
                    message.role === "user"
                      ? "user-bubble"
                      : "assistant-bubble"
                  }`}
                >
                  {formatAnswer(
                    message.content
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="message-row assistant-row">
                <div className="message-avatar">
                  ✦
                </div>

                <div className="assistant-bubble typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </section>
        )}

        {error && (
          <div className="assistant-error">
            {error}
          </div>
        )}

        <form
          className="assistant-input-area"
          onSubmit={handleSubmit}
        >
          <textarea
            value={question}
            onChange={(event) =>
              setQuestion(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Ask about your product..."
            rows="1"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={
              loading ||
              !question.trim()
            }
          >
            {loading ? "..." : "➤"}
          </button>
        </form>

        <p className="assistant-hint">
          Press Enter to send · Shift + Enter for
          a new line
        </p>
      </main>
    </div>
  );
}

export default AIAssistant;