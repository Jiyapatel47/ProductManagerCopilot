import { useEffect, useState } from "react";
import "./PainPoints.css";

function PainPoints({ onBack }) {
  const [painPoints, setPainPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPainPoints = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("You are not logged in.");
      }

      const response = await fetch(
        "http://127.0.0.1:8000/api/insights/pain-points",
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const rawResponse = await response.text();

      console.log("Pain Points status:", response.status);
      console.log("Pain Points response:", rawResponse);

      let data = {};

      try {
        data = JSON.parse(rawResponse);
      } catch {
        data = {
          detail: rawResponse || "Invalid server response",
        };
      }

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load pain points."
        );
      }

      setPainPoints(
        Array.isArray(data.pain_points)
          ? data.pain_points
          : []
      );
    } catch (err) {
      console.error("Pain Points error:", err);

      setError(
        err.message || "Could not connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPainPoints();
  }, []);

  const totalPainPoints = painPoints.length;

  const averageConfidence =
    painPoints.length > 0
      ? painPoints.reduce(
          (sum, item) =>
            sum + Number(item.confidence || 0),
          0
        ) / painPoints.length
      : 0;

  const totalFeedback = painPoints.reduce(
    (sum, item) =>
      sum + Number(item.feedback_count || 0),
    0
  );

  if (loading) {
    return (
      <div className="pain-points-page">
        <div className="pain-points-container">
          <button className="back-button" onClick={onBack}>
            ← Back
          </button>

          <div className="loading-state">
            Loading AI pain points...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pain-points-page">
        <div className="pain-points-container">
          <button className="back-button" onClick={onBack}>
            ← Back
          </button>

          <div className="error-message">
            {error}
          </div>

          <button
            className="retry-button"
            onClick={fetchPainPoints}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pain-points-page">
      <div className="pain-points-container">

        <button className="back-button" onClick={onBack}>
          ← Back
        </button>

        <div className="pain-points-header">
          <div>
            <h1>Customer Pain Points</h1>

            <p>
              AI-identified problems and customer difficulties
              from your feedback.
            </p>
          </div>

          <button
            className="refresh-button"
            onClick={fetchPainPoints}
          >
            ↻ Refresh
          </button>
        </div>

        <div className="summary-grid">

          <div className="summary-card">
            <div className="summary-icon">⚠️</div>

            <div>
              <h3>Total Pain Points</h3>

              <div className="summary-value">
                {totalPainPoints}
              </div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">💬</div>

            <div>
              <h3>Related Feedback</h3>

              <div className="summary-value">
                {totalFeedback}
              </div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">🤖</div>

            <div>
              <h3>AI Confidence</h3>

              <div className="summary-value">
                {(averageConfidence * 100).toFixed(0)}%
              </div>
            </div>
          </div>

        </div>

        <div className="pain-points-card">

          <div className="section-header">
            <div>
              <h2>Identified Pain Points</h2>

              <p>
                Problems detected from customer feedback
              </p>
            </div>

            <span className="count-badge">
              {totalPainPoints} Issues
            </span>
          </div>

          {painPoints.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>

              <h3>No pain points found</h3>

              <p>
                Import customer feedback to generate
                AI-powered pain points.
              </p>
            </div>
          ) : (
            <div className="pain-points-list">

              {painPoints.map((item, index) => (
                <div
                  className="pain-point-item"
                  key={item._id || index}
                >

                  <div className="pain-point-number">
                    {index + 1}
                  </div>

                  <div className="pain-point-content">

                    <div className="pain-point-title-row">

                      <h3>
                        {item.pain_point ||
                          "Unnamed Pain Point"}
                      </h3>

                      <span className="confidence-badge">
                        {(
                          Number(item.confidence || 0) *
                          100
                        ).toFixed(0)}
                        %
                      </span>

                    </div>

                    <div className="pain-point-tags">

                      <span className="type-badge">
                        {item.pain_point_type ||
                          "General"}
                      </span>

                      <span className="theme-badge">
                        Theme:{" "}
                        {item.theme_name ||
                          "General"}
                      </span>

                    </div>

                    <p className="pain-point-summary">
                      {item.summary ||
                        "No summary available."}
                    </p>

                    <div className="pain-point-meta">

                      <span>
                        💬 Feedback:{" "}
                        {Number(
                          item.feedback_count || 0
                        )}
                      </span>

                      <span>
                        🔗 Cluster:{" "}
                        {item.cluster_id ?? "-"}
                      </span>

                    </div>

                    {Array.isArray(
                      item.supporting_feedback
                    ) &&
                      item.supporting_feedback.length >
                        0 && (
                        <div className="supporting-feedback">

                          <h4>
                            Supporting Feedback
                          </h4>

                          <ul>
                            {item.supporting_feedback
                              .slice(0, 3)
                              .map(
                                (
                                  feedback,
                                  feedbackIndex
                                ) => (
                                  <li
                                    key={
                                      feedbackIndex
                                    }
                                  >
                                    {feedback}
                                  </li>
                                )
                              )}
                          </ul>

                        </div>
                      )}

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default PainPoints;