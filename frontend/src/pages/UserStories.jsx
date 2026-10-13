
import { useEffect, useState } from "react";
import "./UserStories.css";

const API_URL = "http://127.0.0.1:8000";

function UserStories({ onBack }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const getToken = () => localStorage.getItem("access_token");

  // Fetch existing user stories
  const loadStories = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const token = getToken();

      if (!token) {
        throw new Error("You are not logged in. Please login again.");
      }

      const response = await fetch(
        `${API_URL}/api/user-stories/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load user stories."
        );
      }

      setStories(
        Array.isArray(data.user_stories)
          ? data.user_stories
          : []
      );

      setMessage(data.message || "");
    } catch (err) {
      console.error("Load user stories error:", err);
      setError(
        err.message || "Could not connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  // Generate new user stories
  const generateStories = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const token = getToken();

      if (!token) {
        throw new Error("You are not logged in. Please login again.");
      }

      const response = await fetch(
        `${API_URL}/api/user-stories/generate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || data.message || "Failed to generate user stories."
        );
      }

      setStories(
        Array.isArray(data.user_stories)
          ? data.user_stories
          : []
      );

      setMessage(
        data.message || "User stories generated successfully!"
      );
    } catch (err) {
      console.error("Generate user stories error:", err);
      setError(
        err.message || "Could not connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  // Load stories when the page opens
  useEffect(() => {
    loadStories();
  }, []);

  return (
    <div className="user-stories-page">
      <div className="user-stories-container">

        <button
          type="button"
          className="us-back-button"
          onClick={onBack}
        >
          ← Back to Dashboard
        </button>

        <header className="us-header">
          <div>
            <p className="us-eyebrow">GENERATIVE AI</p>

            <h1>User Stories</h1>

            <p className="us-description">
              Generate actionable user stories and acceptance
              criteria from your product features.
            </p>
          </div>

          <button
            type="button"
            className="us-generate-button"
            onClick={generateStories}
            disabled={loading}
          >
            {loading ? "Generating..." : "✦ Generate User Stories"}
          </button>
        </header>

        {error && (
          <div className="us-error">
            <strong>Error</strong>
            <p>{error}</p>

            <button
              type="button"
              onClick={loadStories}
              disabled={loading}
            >
              Try Again
            </button>
          </div>
        )}

        {message && !error && (
          <p className="us-message">{message}</p>
        )}

        <section className="us-stories-card">
          <div className="us-section-header">
            <div>
              <h2>Generated Stories</h2>
              <p>Your workspace user stories</p>
            </div>

            <span className="us-count">
              {stories.length} Stories
            </span>
          </div>

          {loading && stories.length === 0 ? (
            <div className="us-empty-state">
              Loading user stories...
            </div>
          ) : stories.length === 0 ? (
            <div className="us-empty-state">
              <div className="us-empty-icon">✦</div>

              <h3>No user stories yet</h3>

              <p>
                Click Generate User Stories to create stories
                from your workspace features.
              </p>
            </div>
          ) : (
            <div className="us-stories-list">
              {stories.map((story, index) => (
                <article
                  className="us-story-item"
                  key={story.id || story._id || index}
                >
                  <div className="us-story-number">
                    {index + 1}
                  </div>

                  <div className="us-story-content">
                    <div className="us-story-title-row">
                      <h3>
                        {story.title || "Untitled User Story"}
                      </h3>

                      <span className="us-priority">
                        {story.priority || "Medium"}
                      </span>
                    </div>

                    {story.feature_name && (
                      <p className="us-feature-name">
                        Feature: {story.feature_name}
                      </p>
                    )}

                    <div className="us-story-text">
                      <h4>User Story</h4>

                      <p>
                        {story.user_story ||
                          "No user story description available."}
                      </p>
                    </div>

                    <div className="us-criteria">
                      <h4>Acceptance Criteria</h4>

                      {Array.isArray(story.acceptance_criteria) ? (
                        story.acceptance_criteria.length > 0 ? (
                          <ul>
                            {story.acceptance_criteria.map(
                              (criterion, i) => (
                                <li key={i}>
                                  {typeof criterion === "string"
                                    ? criterion
                                    : JSON.stringify(criterion)}
                                </li>
                              )
                            )}
                          </ul>
                        ) : (
                          <p>No acceptance criteria available.</p>
                        )
                      ) : (
                        <p>
                          {story.acceptance_criteria ||
                            "No acceptance criteria available."}
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="us-footer">
          <button
            type="button"
            onClick={loadStories}
            disabled={loading}
          >
            ↻ Refresh Stories
          </button>
        </div>

      </div>
    </div>
  );
}

export default UserStories;
