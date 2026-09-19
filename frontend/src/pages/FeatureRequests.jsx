import { useEffect, useState } from "react";
import "./FeatureRequests.css";

function FeatureRequests({ onBack }) {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("You are not logged in.");
      }

      const response = await fetch(
        "http://127.0.0.1:8000/api/features",
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const rawResponse = await response.text();

      console.log("Features status:", response.status);
      console.log("Features response:", rawResponse);

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
          data.detail || "Failed to load feature requests."
        );
      }

      setFeatures(
        Array.isArray(data.features)
          ? data.features
          : []
      );
    } catch (err) {
      console.error("Feature Requests error:", err);

      setError(
        err.message ||
          "Could not connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const totalFeatures = features.length;

  const totalRequests = features.reduce(
    (sum, feature) =>
      sum + Number(feature.request_count || 0),
    0
  );

  const averageConfidence =
    features.length > 0
      ? features.reduce(
          (sum, feature) =>
            sum + Number(feature.confidence || 0),
          0
        ) / features.length
      : 0;

  if (loading) {
    return (
      <div className="feature-page">
        <div className="feature-container">
          <button
            className="back-button"
            onClick={onBack}
          >
            ← Back
          </button>

          <div className="loading-state">
            Loading feature requests...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="feature-page">
        <div className="feature-container">
          <button
            className="back-button"
            onClick={onBack}
          >
            ← Back
          </button>

          <div className="error-message">
            {error}
          </div>

          <button
            className="retry-button"
            onClick={fetchFeatures}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="feature-page">
      <div className="feature-container">

        <button
          className="back-button"
          onClick={onBack}
        >
          ← Back
        </button>

        <div className="feature-header">
          <div>
            <h1>Feature Requests</h1>

            <p>
              AI-identified feature ideas based on
              customer feedback.
            </p>
          </div>

          <button
            className="refresh-button"
            onClick={fetchFeatures}
          >
            ↻ Refresh
          </button>
        </div>

        <div className="summary-grid">

          <div className="summary-card">
            <div className="summary-icon">
              💡
            </div>

            <div>
              <h3>Feature Ideas</h3>

              <div className="summary-value">
                {totalFeatures}
              </div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">
              💬
            </div>

            <div>
              <h3>Total Requests</h3>

              <div className="summary-value">
                {totalRequests}
              </div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">
              🤖
            </div>

            <div>
              <h3>AI Confidence</h3>

              <div className="summary-value">
                {(averageConfidence * 100).toFixed(0)}%
              </div>
            </div>
          </div>

        </div>

        <div className="features-card">

          <div className="section-header">
            <div>
              <h2>Identified Feature Requests</h2>

              <p>
                Feature opportunities detected from
                customer feedback
              </p>
            </div>

            <span className="count-badge">
              {totalFeatures} Features
            </span>
          </div>

          {features.length === 0 ? (
            <div className="empty-state">

              <div className="empty-icon">
                💡
              </div>

              <h3>
                No feature requests found
              </h3>

              <p>
                Import customer feedback to generate
                feature suggestions.
              </p>

            </div>
          ) : (
            <div className="features-list">

              {features.map((feature, index) => (
                <div
                  className="feature-item"
                  key={feature._id || index}
                >

                  <div className="feature-number">
                    {index + 1}
                  </div>

                  <div className="feature-content">

                    <div className="feature-title-row">

                      <h3>
                        {feature.feature_name ||
                          "Unnamed Feature"}
                      </h3>

                      <span className="confidence-badge">
                        {(
                          Number(
                            feature.confidence || 0
                          ) * 100
                        ).toFixed(0)}
                        %
                      </span>

                    </div>

                    <p className="feature-summary">
                      {feature.summary ||
                        "No summary available."}
                    </p>

                    <div className="feature-meta">

                      <span>
                        💬 Requests:{" "}
                        {Number(
                          feature.request_count || 0
                        )}
                      </span>

                      <span>
                        🔗 Cluster:{" "}
                        {feature.cluster_id ?? "-"}
                      </span>

                    </div>

                    {Array.isArray(
                      feature.supporting_requests
                    ) &&
                      feature.supporting_requests
                        .length > 0 && (
                        <div className="supporting-requests">

                          <h4>
                            Supporting Requests
                          </h4>

                          <ul>
                            {feature.supporting_requests
                              .slice(0, 5)
                              .map(
                                (
                                  request,
                                  requestIndex
                                ) => (
                                  <li
                                    key={
                                      requestIndex
                                    }
                                  >
                                    {request}
                                  </li>
                                )
                              )}
                          </ul>

                        </div>
                      )}

                    {Array.isArray(
                      feature.request_dates
                    ) &&
                      feature.request_dates.length >
                        0 && (
                        <div className="request-dates">

                          <span>
                            📅{" "}
                            {
                              feature.request_dates
                                .length
                            } dated requests
                          </span>

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

export default FeatureRequests;