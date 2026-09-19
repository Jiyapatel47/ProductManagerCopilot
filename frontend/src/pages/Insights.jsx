
import { useEffect, useState } from "react";
import "./Insights.css";

function Insights({ onBack }) {
  const [themes, setThemes] = useState([]);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("You are not logged in.");
      }

      const headers = {
        Authorization: "Bearer " + token,
      };

      const [themesResponse, trendsResponse] =
        await Promise.all([
          fetch("http://127.0.0.1:8000/api/insights/themes", {
            headers,
          }),
          fetch("http://127.0.0.1:8000/api/insights/trends", {
            headers,
          }),
        ]);

      const themesText = await themesResponse.text();
      const trendsText = await trendsResponse.text();

      let themesData = {};
      let trendsData = {};

      try {
        themesData = JSON.parse(themesText);
      } catch {
        themesData = {};
      }

      try {
        trendsData = JSON.parse(trendsText);
      } catch {
        trendsData = {};
      }

      if (!themesResponse.ok) {
        throw new Error(
          themesData.detail || "Failed to load themes."
        );
      }

      if (!trendsResponse.ok) {
        throw new Error(
          trendsData.detail || "Failed to load trends."
        );
      }

      setThemes(
        Array.isArray(themesData.themes)
          ? themesData.themes
          : []
      );

      setTrends(trendsData);
    } catch (err) {
      console.error("Insights error:", err);

      setError(
        err.message || "Could not connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const sourceTrends = Array.isArray(trends?.trends)
    ? trends.trends
    : [];

  const timeTrends = Array.isArray(trends?.time_trends)
    ? trends.time_trends
    : [];

  const totalFeedback = Number(
    trends?.total_feedback || 0
  );

  const totalThemes = themes.length;

  const averageConfidence =
    themes.length > 0
      ? themes.reduce(
          (sum, theme) =>
            sum + Number(theme.confidence || 0),
          0
        ) / themes.length
      : 0;

  const maxTimeTrendValue =
    timeTrends.length > 0
      ? Math.max(
          ...timeTrends.map((item) =>
            Number(item.feedback_count || 0)
          )
        )
      : 0;

  const maxSourceValue =
    sourceTrends.length > 0
      ? Math.max(
          ...sourceTrends.map((item) =>
            Number(item.feedback_count || 0)
          )
        )
      : 0;

  if (loading) {
    return (
      <div className="insights-page">
        <div className="insights-container">
          <button
            className="back-button"
            onClick={onBack}
          >
            ← Back
          </button>

          <div className="loading-state">
            Loading AI insights...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="insights-page">
        <div className="insights-container">
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
            onClick={fetchInsights}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="insights-page">
      <div className="insights-container">

        <button
          className="back-button"
          onClick={onBack}
        >
          ← Back
        </button>

        <div className="insights-header">
          <h1>AI Insights</h1>

          <p>
            AI-powered analysis of your customer feedback.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="summary-grid">

          <div className="summary-card">
            <h3>Total Feedback</h3>

            <div className="summary-value">
              {totalFeedback}
            </div>
          </div>

          <div className="summary-card">
            <h3>Themes Identified</h3>

            <div className="summary-value">
              {totalThemes}
            </div>
          </div>

          <div className="summary-card">
            <h3>AI Confidence</h3>

            <div className="summary-value">
              {(averageConfidence * 100).toFixed(0)}%
            </div>
          </div>

          <div className="summary-card">
            <h3>Feedback Sources</h3>

            <div className="summary-value">
              {sourceTrends.length}
            </div>
          </div>

        </div>

        {/* Date-based Feedback Trends */}
        <div className="insights-card">

          <div className="section-header">
            <h2>Feedback Trends</h2>
          </div>

          <p className="section-description">
            Feedback volume over time based on imported
            customer feedback.
          </p>

          {timeTrends.length === 0 ? (
            <p>No time-based trend data available.</p>
          ) : (
            <div className="trend-chart">

              {timeTrends.map((item, index) => {
                const value = Number(
                  item.feedback_count || 0
                );

                const width =
                  maxTimeTrendValue > 0
                    ? (value / maxTimeTrendValue) * 100
                    : 0;

                return (
                  <div
                    className="trend-row"
                    key={`${item.date}-${index}`}
                  >
                    <div className="trend-label">
                      {item.date}
                    </div>

                    <div className="trend-bar-container">
                      <div
                        className="trend-bar"
                        style={{
                          width: `${width}%`,
                        }}
                      />
                    </div>

                    <div className="trend-value">
                      {value}
                    </div>
                  </div>
                );
              })}

            </div>
          )}

        </div>

        {/* Feedback Sources */}
        <div className="insights-card">

          <div className="section-header">
            <h2>Feedback Sources</h2>
          </div>

          <p className="section-description">
            Distribution of feedback by source.
          </p>

          {sourceTrends.length === 0 ? (
            <p>No source data available.</p>
          ) : (
            <div className="trend-chart">

              {sourceTrends.map((item, index) => {
                const value = Number(
                  item.feedback_count || 0
                );

                const width =
                  maxSourceValue > 0
                    ? (value / maxSourceValue) * 100
                    : 0;

                return (
                  <div
                    className="trend-row"
                    key={`${item.source}-${index}`}
                  >
                    <div className="trend-label">
                      {item.source || "Unknown"}
                    </div>

                    <div className="trend-bar-container">
                      <div
                        className="trend-bar"
                        style={{
                          width: `${width}%`,
                        }}
                      />
                    </div>

                    <div className="trend-value">
                      {value}
                    </div>
                  </div>
                );
              })}

            </div>
          )}

        </div>

        {/* Identified Themes */}
        <div className="insights-card">

          <div className="section-header">
            <h2>Identified Themes</h2>
          </div>

          {themes.length === 0 ? (
            <p>No themes found.</p>
          ) : (
            <div className="themes-grid">

              {themes.map((theme, index) => (
                <div
                  className="theme-card"
                  key={theme._id || index}
                >

                  <div className="theme-card-header">

                    <h3>
                      {theme.theme_name ||
                        "Unknown Theme"}
                    </h3>

                    <span className="confidence-badge">
                      {(
                        Number(theme.confidence || 0) *
                        100
                      ).toFixed(0)}
                      %
                    </span>

                  </div>

                  <p className="theme-type">
                    {theme.theme_type || "General"}
                  </p>

                  <p className="theme-summary">
                    {theme.summary ||
                      "No summary available."}
                  </p>

                  <div className="theme-meta">

                    <span>
                      Feedback:{" "}
                      {Number(
                        theme.feedback_count || 0
                      )}
                    </span>

                    <span>
                      Cluster:{" "}
                      {theme.cluster_id ?? "-"}
                    </span>

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

export default Insights;

