
import { useEffect, useState } from "react";
import "./UserStories.css";

const API_URL = "https://productmanagercopilot.onrender.com";

function UserStories({ onBack }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const getToken = () => localStorage.getItem("access_token");

  // Handle JSON responses safely
  const getResponseData = async (response) => {
    const text = await response.text();

    try {
      return text ? JSON.parse(text) : {};
    } catch {
      throw new Error(
        "Invalid response from backend. Please check the API endpoint."
      );
    }
  };

  // Load existing user stories
  const loadStories = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const token = getToken();

      if (!token) {
        throw new Error("Please login again. Authentication token not found.");
      }

      const response = await fetch(`${API_URL}/api/user-stories/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await getResponseData(response);

      if (!response.ok) {
        throw new Error(
          data.detail || data.message || "Failed to load user stories."
        );
      }

      const userStories = Array.isArray(data)
        ? data
        : data.user_stories || data.stories || [];

      setStories(Array.isArray(userStories) ? userStories : []);
      setMessage(data.message || "");
    } catch (err) {
      console.error("Load user stories error:", err);
      setError(
        err.message ||
          "Could not connect to the backend. Please check the server."
      );
    } finally {
      setLoading(false);
    }
  };

  // Generate user stories
  const generateStories = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const token = getToken();

      if (!token) {
        throw new Error("Please login again. Authentication token not found.");
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

      const data = await getResponseData(response);

      if (!response.ok) {
        throw new Error(
          data.detail || data.message || "Failed to generate user stories."
        );
      }

      const userStories = Array.isArray(data)
        ? data
        : data.user_stories || data.stories || [];

      setStories(Array.isArray(userStories) ? userStories : []);
      setMessage(
        data.message || "User stories generated successfully!"
      );
    } catch (err) {
      console.error("Generate user stories error:", err);
      setError(
        err.message ||
          "Could not connect to the backend. Please check the server."
      );
    } finally {
      setLoading(false);
    }
  };

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
              Generate actionable user stories and acceptance criteria
              from your product features.
            </p>
          </div>

          <button
            type="button"
            className="us-generate-button"
            onClick={generateStories}
            disabled={loading}
          >
            {loading ? "Please wait..." : "✦ Generate User Stories"}
          </button>
        </header>

        {error && (
          <div className="us-error" role="alert">
            <strong>Error:</strong> {error}
          </div>
        )}

        {message && !error && (
          <div className="us-success" role="status">
            {message}
          </div>
        )}

        <section className="us-stories-card">
          <div className="us-section-header">
            <div>
              <h2>Generated User Stories</h2>
              <p>
                User stories and acceptance criteria for your product.
              </p>
            </div>

            <span className="us-count">
              {stories.length} {stories.length === 1 ? "Story" : "Stories"}
            </span>
          </div>

          {loading && stories.length === 0 ? (
            <div className="us-empty-state">
              <p>Loading user stories...</p>
            </div>
          ) : stories.length === 0 ? (
            <div className="us-empty-state">
              <h3>No user stories yet</h3>
              <p>
                Click “Generate User Stories” to create stories from
                your product features.
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
                        {story.title || `User Story ${index + 1}`}
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
                          story.description ||
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
