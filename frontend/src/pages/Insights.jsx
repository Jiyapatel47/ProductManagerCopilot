
import { useEffect, useState } from "react";
import "./Insights.css";

const API_URL = "http://127.0.0.1:8000";

const SOURCE_COLORS = [
  "#7657f6",
  "#3395f7",
  "#19bd91",
  "#f59e0b",
  "#ec4899",
  "#06b6d4",
];

function Insights({ onBack }) {
  const [themes, setThemes] = useState([]);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("all");

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("You are not logged in. Please login again.");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };

      const [themesResponse, trendsResponse] = await Promise.all([
        fetch(`${API_URL}/api/insights/themes`, { headers }),
        fetch(`${API_URL}/api/insights/trends`, { headers }),
      ]);

      const [themesText, trendsText] = await Promise.all([
        themesResponse.text(),
        trendsResponse.text(),
      ]);

      let themesData;
      let trendsData;

      try {
        themesData = JSON.parse(themesText);
      } catch {
        throw new Error("Invalid response received for themes.");
      }

      try {
        trendsData = JSON.parse(trendsText);
      } catch {
        throw new Error("Invalid response received for trends.");
      }

      if (!themesResponse.ok) {
        throw new Error(themesData.detail || "Failed to load themes.");
      }

      if (!trendsResponse.ok) {
        throw new Error(trendsData.detail || "Failed to load trends.");
      }

      setThemes(
        Array.isArray(themesData.themes)
          ? themesData.themes
          : Array.isArray(themesData)
            ? themesData
            : []
      );

      setTrends(trendsData);
    } catch (err) {
      console.error("Insights error:", err);
      setError(err.message || "Could not connect to the backend.");
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

  const allTimeTrends = Array.isArray(trends?.time_trends)
    ? trends.time_trends
    : [];

  const timeTrends =
    period === "7"
      ? allTimeTrends.slice(-7)
      : period === "14"
        ? allTimeTrends.slice(-14)
        : allTimeTrends;

  const totalFeedback = Number(
    trends?.total_feedback ??
      sourceTrends.reduce(
        (sum, item) => sum + Number(item.feedback_count || 0),
        0
      )
  );

  const totalThemes = themes.length;

  const averageConfidence =
    themes.length > 0
      ? themes.reduce(
          (sum, theme) => sum + Number(theme.confidence || 0),
          0
        ) / themes.length
      : 0;

  const confidencePercent =
    averageConfidence <= 1
      ? averageConfidence * 100
      : averageConfidence;

  const sourceTotal = sourceTrends.reduce(
    (sum, item) => sum + Number(item.feedback_count || 0),
    0
  );

  const maxTimeValue = Math.max(
    1,
    ...timeTrends.map((item) => Number(item.feedback_count || 0))
  );

  let currentAngle = 0;

  const sourceSegments = sourceTrends.map((item, index) => {
    const count = Number(item.feedback_count || 0);
    const percentage =
      sourceTotal > 0 ? (count / sourceTotal) * 100 : 0;

    const startAngle = currentAngle;
    currentAngle += percentage * 3.6;

    return {
      ...item,
      count,
      percentage,
      startAngle,
      endAngle: currentAngle,
      color: SOURCE_COLORS[index % SOURCE_COLORS.length],
    };
  });

  const donutGradient =
    sourceSegments.length > 0 && sourceTotal > 0
      ? `conic-gradient(${sourceSegments
          .map(
            (item) =>
              `${item.color} ${item.startAngle}deg ${item.endAngle}deg`
          )
          .join(", ")})`
      : "conic-gradient(#e5e7eb 0deg 360deg)";

  if (loading) {
    return (
      <div className="insights-page">
        <div className="insights-container">
          <button className="back-button" onClick={onBack}>
            ← Back to Dashboard
          </button>

          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Analyzing customer feedback...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="insights-page">
        <div className="insights-container">
          <button className="back-button" onClick={onBack}>
            ← Back to Dashboard
          </button>

          <div className="error-message">{error}</div>

          <button className="retry-button" onClick={fetchInsights}>
            ↻ Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="insights-page">
      <div className="insights-container">
        <button className="back-button" onClick={onBack}>
          ← Back to Dashboard
        </button>

        <header className="insights-header">
          <div className="header-title">
            <div className="header-icon">✦</div>
            <div>
              <h1>AI Insights</h1>
              <p>AI-powered analysis of your customer feedback.</p>
            </div>
          </div>

          <button
            className="refresh-button"
            onClick={fetchInsights}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </header>

        <section className="summary-grid">
          <div className="summary-card summary-purple">
            <div className="summary-icon">▤</div>
            <div>
              <h3>Total Feedback</h3>
              <div className="summary-value">{totalFeedback}</div>
              <p className="summary-caption">Imported feedback entries</p>
            </div>
          </div>

          <div className="summary-card summary-green">
            <div className="summary-icon">◇</div>
            <div>
              <h3>Themes Identified</h3>
              <div className="summary-value">{totalThemes}</div>
              <p className="summary-caption">Distinct feedback themes</p>
            </div>
          </div>

          <div className="summary-card summary-blue">
            <div className="summary-icon">✓</div>
            <div>
              <h3>AI Confidence</h3>
              <div className="summary-value">
                {confidencePercent.toFixed(0)}%
              </div>
              <p className="summary-caption">Average theme confidence</p>
            </div>
          </div>

          <div className="summary-card summary-pink">
            <div className="summary-icon">◉</div>
            <div>
              <h3>Feedback Sources</h3>
              <div className="summary-value">{sourceTrends.length}</div>
              <p className="summary-caption">Distinct source categories</p>
            </div>
          </div>
        </section>

        <section className="charts-grid">
          <article className="insights-card trend-card">
            <div className="section-heading">
              <div className="section-icon trend-icon">⌁</div>
              <div>
                <h2>Feedback Trends</h2>
                <p>
                  Feedback volume over time based on imported customer
                  feedback.
                </p>
              </div>
            </div>

            <div className="chart-toolbar">
              <span>Feedback volume</span>

              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
                aria-label="Filter trend date range"
              >
                <option value="all">All available dates</option>
                <option value="14">Last 14 data points</option>
                <option value="7">Last 7 data points</option>
              </select>
            </div>

            {timeTrends.length === 0 ? (
              <div className="trend-bars-empty">
                <div className="trend-empty-icon">▥</div>
                <h3>No feedback trends yet</h3>
                <p>
                  Import feedback with dates to see your feedback activity
                  here.
                </p>
              </div>
            ) : (
              <div className="trend-bars-container">
                <div className="trend-bars-header">
                  <div>
                    <span className="trend-total-label">
                      Total feedback
                    </span>
                    <h3>
                      {timeTrends.reduce(
                        (sum, item) =>
                          sum + Number(item.feedback_count || 0),
                        0
                      )}
                    </h3>
                  </div>

                  <span className="trend-period-badge">
                    {timeTrends.length} data points
                  </span>
                </div>

                <div className="trend-bar-chart">
                  {timeTrends.map((item, index) => {
                    const count = Number(item.feedback_count || 0);
                    const height =
                      count > 0
                        ? Math.max(8, (count / maxTimeValue) * 100)
                        : 3;

                    return (
                      <div
                        className="trend-bar-column"
                        key={`${item.date}-${index}`}
                        title={`${item.date}: ${count} feedback`}
                      >
                        <span className="trend-bar-count">{count}</span>

                        <div className="trend-bar-area">
                          <div
                            className={`trend-bar-fill ${
                              count === 0 ? "trend-bar-zero" : ""
                            }`}
                            style={{ height: `${height}%` }}
                          />
                        </div>

                        <span className="trend-bar-date">
                          {String(item.date || "").slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="trend-chart-legend">
                  <span className="trend-legend-dot" />
                  Feedback volume over time
                </div>
              </div>
            )}
          </article>

          <article className="insights-card source-card">
            <div className="section-heading">
              <div className="section-icon source-icon">◉</div>
              <div>
                <h2>Feedback Sources</h2>
                <p>Distribution of feedback by source.</p>
              </div>
            </div>

            {sourceTrends.length === 0 ? (
              <div className="chart-empty">No source data available.</div>
            ) : (
              <div className="source-chart-layout">
                <div
                  className="donut-chart"
                  style={{ background: donutGradient }}
                  role="img"
                  aria-label="Feedback source distribution"
                >
                  <div className="donut-hole">
                    <span>Total</span>
                    <strong>{sourceTotal}</strong>
                    <small>Feedback</small>
                  </div>
                </div>

                <div className="source-legend">
                  {sourceSegments.map((item, index) => (
                    <div
                      className="source-legend-item"
                      key={`${item.source || "source"}-${index}`}
                    >
                      <div className="source-legend-heading">
                        <span
                          className="legend-dot"
                          style={{ background: item.color }}
                        />
                        <span className="source-name">
                          {item.source || "Unknown"}
                        </span>
                        <strong>{item.count}</strong>
                      </div>

                      <div className="source-progress-track">
                        <div
                          className="source-progress-fill"
                          style={{
                            width: `${item.percentage}%`,
                            background: item.color,
                          }}
                        />
                      </div>

                      <div className="source-percentage">
                        {item.percentage.toFixed(1)}% of feedback
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </article>
        </section>

        <section className="insights-card themes-section">
          <div className="section-heading themes-heading">
            <div className="section-icon themes-icon">◇</div>
            <div>
              <h2>Identified Themes</h2>
              <p>Key themes discovered in your customer feedback.</p>
            </div>
            <span className="theme-count">{totalThemes} themes</span>
          </div>

          {themes.length === 0 ? (
            <div className="chart-empty">No themes found.</div>
          ) : (
            <div className="themes-grid">
              {themes.map((theme, index) => {
                const rawConfidence = Number(theme.confidence || 0);
                const confidence =
                  rawConfidence <= 1
                    ? rawConfidence * 100
                    : rawConfidence;

                return (
                  <article
                    className="theme-card"
                    key={theme._id || theme.id || index}
                  >
                    <div className="theme-card-top">
                      <span
                        className={`theme-number theme-color-${index % 6}`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="confidence-badge">
                        {confidence.toFixed(0)}% confidence
                      </span>
                    </div>

                    <h3>{theme.theme_name || "Unknown Theme"}</h3>

                    <span className="theme-type">
                      {theme.theme_type || "General"}
                    </span>

                    <p className="theme-summary">
                      {theme.summary || "No summary available."}
                    </p>

                    <div className="theme-meta">
                      <span>
                        Feedback{" "}
                        <strong>{Number(theme.feedback_count || 0)}</strong>
                      </span>
                      <span>Cluster {theme.cluster_id ?? "-"}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <footer className="insights-footer">
          <span className="footer-status-dot" />
          Insights are based on your workspace data
        </footer>
      </div>
    </div>
  );
}

export default Insights;
