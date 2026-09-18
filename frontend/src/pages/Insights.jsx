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

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [themesResponse, trendsResponse] =
        await Promise.all([
          fetch(
            "http://127.0.0.1:8000/api/insights/themes",
            { headers }
          ),
          fetch(
            "http://127.0.0.1:8000/api/insights/trends",
            { headers }
          ),
        ]);

      const themesData = await themesResponse.json();
      const trendsData = await trendsResponse.json();

      if (!themesResponse.ok) {
        throw new Error(
          themesData.detail ||
            "Failed to load themes"
        );
      }

      if (!trendsResponse.ok) {
        throw new Error(
          trendsData.detail ||
            "Failed to load trends"
        );
      }

      setThemes(themesData.themes || []);
      setTrends(trendsData);
    } catch (err) {
      console.error("Insights error:", err);
      setError(
        err.message ||
          "Could not connect to the backend"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  /*
   * Convert YYYY-MM into a readable label.
   *
   * Example:
   * 2026-08 → Aug 2026
   */
  const formatPeriod = (period) => {
    const [year, month] = period.split("-");

    const date = new Date(
      Number(year),
      Number(month) - 1,
      1
    );

    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  /*
   * Calculate maximum value for the chart.
   */
  const maxTrendValue =
    trends?.monthly_trends?.length > 0
      ? Math.max(
          ...trends.monthly_trends.map(
            (item) => item.feedback_count
          )
        )
      : 0;

  /*
   * Total themes.
   */
  const totalThemes = themes.length;

  /*
   * Total feedback represented in trend data.
   */
  const totalFeedback =
    trends?.total_dated_feedback || 0;

  /*
   * Highest confidence theme.
   */
  const averageConfidence =
    themes.length > 0
      ? themes.reduce(
          (sum, theme) =>
            sum + theme.confidence,
          0
        ) / themes.length
      : 0;

  return (
    <div className="insights-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="insights-header">

        <div className="insights-header-left">

          <button
            className="insights-back-btn"
            onClick={onBack}
            aria-label="Back to dashboard"
          >
            ←
          </button>

          <div className="insights-header-text">

            <div className="insights-eyebrow">
              PRODUCT INTELLIGENCE
            </div>

            <h1>
              Product Insights
            </h1>

            <p>
              AI-powered analysis of your customer
              feedback.
            </p>

          </div>

        </div>

        <button
          className="insights-refresh-btn"
          onClick={fetchInsights}
          disabled={loading}
        >
          ↻&nbsp; Refresh
        </button>

      </header>


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <main className="insights-content">

        {/* ===================================================
            LOADING
        =================================================== */}

        {loading && (
          <section className="insights-state-card">

            <div className="insights-state-icon">
              ✦
            </div>

            <h3>
              Analyzing product feedback
            </h3>

            <p>
              Fetching your latest AI-generated
              insights...
            </p>

          </section>
        )}


        {/* ===================================================
            ERROR
        =================================================== */}

        {!loading && error && (
          <section className="insights-state-card">

            <div className="insights-state-icon error">
              !
            </div>

            <h3>
              Unable to load insights
            </h3>

            <p>
              {error}
            </p>

            <button
              className="insights-retry-btn"
              onClick={fetchInsights}
            >
              Try Again
            </button>

          </section>
        )}


        {/* ===================================================
            DATA
        =================================================== */}

        {!loading && !error && trends && (
          <>

            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <section className="insights-stats">

              <div className="insights-stat-card">

                <div className="insights-stat-icon purple">
                  ✦
                </div>

                <div>
                  <span>
                    Total feedback
                  </span>

                  <strong>
                    {totalFeedback}
                  </strong>
                </div>

              </div>


              <div className="insights-stat-card">

                <div className="insights-stat-icon blue">
                  ◈
                </div>

                <div>
                  <span>
                    Themes identified
                  </span>

                  <strong>
                    {totalThemes}
                  </strong>
                </div>

              </div>


              <div className="insights-stat-card">

                <div className="insights-stat-icon green">
                  ✓
                </div>

                <div>
                  <span>
                    AI confidence
                  </span>

                  <strong>
                    {Math.round(
                      averageConfidence * 100
                    )}
                    %
                  </strong>
                </div>

              </div>


              <div className="insights-stat-card">

                <div className="insights-stat-icon orange">
                  ↗
                </div>

                <div>
                  <span>
                    Feedback periods
                  </span>

                  <strong>
                    {trends.monthly_trends.length}
                  </strong>
                </div>

              </div>

            </section>


            {/* =================================================
                TREND ANALYSIS
            ================================================= */}

            <section className="trend-section">

              <div className="trend-header">

                <div>

                  <div className="trend-eyebrow">
                    TREND ANALYSIS
                  </div>

                  <h2>
                    Customer feedback over time
                  </h2>

                  <p>
                    Track how feedback volume changes
                    across reporting periods.
                  </p>

                </div>

                <div className="trend-total">

                  <strong>
                    {totalFeedback}
                  </strong>

                  <span>
                    total feedback
                  </span>

                </div>

              </div>


              {/* Chart */}

              {trends.monthly_trends.length > 0 ? (
                <div className="trend-chart">

                  <div className="trend-y-axis">

                    <span>
                      {maxTrendValue}
                    </span>

                    <span>
                      {Math.round(
                        maxTrendValue * 0.75
                      )}
                    </span>

                    <span>
                      {Math.round(
                        maxTrendValue * 0.5
                      )}
                    </span>

                    <span>
                      {Math.round(
                        maxTrendValue * 0.25
                      )}
                    </span>

                    <span>
                      0
                    </span>

                  </div>


                  <div className="trend-chart-area">

                    {/* Horizontal grid */}

                    <div className="trend-grid-line line-1" />
                    <div className="trend-grid-line line-2" />
                    <div className="trend-grid-line line-3" />
                    <div className="trend-grid-line line-4" />
                    <div className="trend-grid-line line-5" />


                    {/* Bars */}

                    <div className="trend-bars">

                      {trends.monthly_trends.map(
                        (item) => {

                          const height =
                            maxTrendValue > 0
                              ? Math.max(
                                  (item.feedback_count /
                                    maxTrendValue) *
                                    100,
                                  5
                                )
                              : 5;

                          return (
                            <div
                              className="trend-column"
                              key={item.period}
                            >

                              <div className="trend-value">
                                {item.feedback_count}
                              </div>

                              <div
                                className="trend-bar"
                                style={{
                                  height: `${height}%`,
                                }}
                              />

                              <div className="trend-label">
                                {formatPeriod(
                                  item.period
                                )}
                              </div>

                            </div>
                          );
                        }
                      )}

                    </div>

                  </div>

                </div>
              ) : (
                <div className="trend-empty">
                  No dated feedback available for
                  trend analysis.
                </div>
              )}

            </section>


            {/* =================================================
                THEMES
            ================================================= */}

            <section className="themes-section">

              <div className="themes-header">

                <div>

                  <div className="themes-eyebrow">
                    THEME EXTRACTION
                  </div>

                  <h2>
                    Identified product themes
                  </h2>

                  <p>
                    Recurring topics discovered from
                    semantically related customer feedback.
                  </p>

                </div>

                <div className="themes-count">
                  {themes.length} themes
                </div>

              </div>


              {themes.length > 0 ? (

                <div className="themes-grid">

                  {themes.map((theme) => (

                    <article
                      className="theme-card"
                      key={theme.id}
                    >

                      <div className="theme-card-top">

                        <span className="theme-type">
                          {theme.theme_type}
                        </span>

                        <span className="theme-confidence">
                          {(theme.confidence * 100).toFixed(0)}%
                        </span>

                      </div>


                      <h3>
                        {theme.theme_name}
                      </h3>


                      <p className="theme-summary">
                        {theme.summary}
                      </p>


                      <div className="theme-feedback-count">

                        <strong>
                          {theme.feedback_count}
                        </strong>

                        <span>
                          supporting feedback
                        </span>

                      </div>


                      <div className="theme-confidence-bar">

                        <div
                          style={{
                            width: `${
                              theme.confidence * 100
                            }%`,
                          }}
                        />

                      </div>


                      <div className="theme-evidence">

                        <div>
                          SUPPORTING FEEDBACK
                        </div>

                        <ul>

                          {theme.supporting_feedback
                            .slice(0, 3)
                            .map(
                              (
                                feedback,
                                index
                              ) => (
                                <li key={index}>
                                  {feedback}
                                </li>
                              )
                            )}

                        </ul>

                      </div>

                    </article>

                  ))}

                </div>

              ) : (

                <div className="themes-empty">
                  No themes have been identified yet.
                </div>

              )}

            </section>

          </>
        )}

      </main>

    </div>
  );
}

export default Insights;