import { useEffect, useState } from "react";
import "./Prioritization.css";

function Prioritization({ onBack }) {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPrioritization = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("You are not logged in.");
      }

      const response = await fetch(
        "http://127.0.0.1:8000/api/prioritization",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load prioritization."
        );
      }

      setFeatures(
        Array.isArray(data.features)
          ? data.features
          : []
      );
    } catch (err) {
      console.error(
        "Prioritization error:",
        err
      );

      setError(
        err.message ||
          "Could not load prioritization."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrioritization();
  }, []);

  const getPriorityClass = (priority) => {
    if (priority === "High") {
      return "priority-high";
    }

    if (priority === "Medium") {
      return "priority-medium";
    }

    return "priority-low";
  };

  return (
    <div className="prioritization-page">
      <header className="prioritization-header">
        <div>
          <button
            className="back-button"
            onClick={onBack}
          >
            ← Back to Dashboard
          </button>

          <p className="page-eyebrow">
            PRODUCT INTELLIGENCE
          </p>

          <h1>
            Feature Prioritization
          </h1>

          <p className="page-description">
            Prioritize feature opportunities using
            customer demand and AI confidence.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchPrioritization}
        >
          ↻ Refresh
        </button>
      </header>

      {error && (
        <div className="priority-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="priority-loading">
          <div className="loading-icon">✦</div>

          <h3>
            Calculating priorities...
          </h3>

          <p>
            AI is analyzing your feature
            opportunities.
          </p>
        </div>
      ) : features.length === 0 ? (
        <div className="priority-empty">
          <div className="empty-icon">
            ✦
          </div>

          <h3>
            No feature requests found
          </h3>

          <p>
            Import customer feedback first to
            generate feature opportunities.
          </p>
        </div>
      ) : (
        <>
          <section className="priority-summary">
            <div className="summary-card">
              <span className="summary-icon">
                ✦
              </span>

              <div>
                <small>
                  FEATURE OPPORTUNITIES
                </small>

                <strong>
                  {features.length}
                </strong>
              </div>
            </div>

            <div className="summary-card">
              <span className="summary-icon">
                ↑
              </span>

              <div>
                <small>
                  HIGH PRIORITY
                </small>

                <strong>
                  {
                    features.filter(
                      (feature) =>
                        feature.priority ===
                        "High"
                    ).length
                  }
                </strong>
              </div>
            </div>

            <div className="summary-card">
              <span className="summary-icon">
                ◉
              </span>

              <div>
                <small>
                  TOTAL REQUESTS
                </small>

                <strong>
                  {features.reduce(
                    (total, feature) =>
                      total +
                      Number(
                        feature.request_count ||
                          0
                      ),
                    0
                  )}
                </strong>
              </div>
            </div>
          </section>

          <section className="priority-section">
            <div className="section-title">
              <div>
                <h2>
                  Prioritized Features
                </h2>

                <p>
                  Features are sorted by priority
                  score.
                </p>
              </div>
            </div>

            <div className="feature-list">
              {features.map(
                (feature, index) => (
                  <div
                    className="priority-card"
                    key={
                      feature.id || index
                    }
                  >
                    <div className="feature-top">
                      <div className="feature-number">
                        #{index + 1}
                      </div>

                      <span
                        className={`priority-badge ${getPriorityClass(
                          feature.priority
                        )}`}
                      >
                        {feature.priority}
                      </span>
                    </div>

                    <div className="feature-main">
                      <h3>
                        {feature.feature_name}
                      </h3>

                      <p>
                        {feature.summary}
                      </p>
                    </div>

                    <div className="feature-metrics">
                      <div className="metric">
                        <span>
                          REQUESTS
                        </span>

                        <strong>
                          {
                            feature.request_count
                          }
                        </strong>
                      </div>

                      <div className="metric">
                        <span>
                          AI CONFIDENCE
                        </span>

                        <strong>
                          {Math.round(
                            Number(
                              feature.confidence
                            ) * 100
                          )}
                          %
                        </strong>
                      </div>

                      <div className="metric">
                        <span>
                          PRIORITY SCORE
                        </span>

                        <strong>
                          {
                            feature.priority_score
                          }
                        </strong>
                      </div>

                      <div className="metric">
                        <span>
                          CLUSTER
                        </span>

                        <strong>
                          #
                          {
                            feature.cluster_id
                          }
                        </strong>
                      </div>
                    </div>

                    <div className="score-section">
                      <div className="score-label">
                        <span>
                          Priority Score
                        </span>

                        <strong>
                          {
                            feature.priority_score
                          }
                          /100
                        </strong>
                      </div>

                      <div className="score-bar">
                        <div
                          className="score-fill"
                          style={{
                            width: `${Math.min(
                              Number(
                                feature.priority_score
                              ),
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default Prioritization;