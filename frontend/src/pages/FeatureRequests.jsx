import { useEffect, useState } from "react";
import "./FeatureRequests.css";

function FeatureRequests({ onBack }) {
  const [features, setFeatures] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendLoading, setTrendLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      const response = await fetch(
        "http://127.0.0.1:8000/api/features",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail || "Failed to load feature requests"
        );
        return;
      }

      setFeatures(data.features || []);
    } catch (err) {
      console.error("Feature request error:", err);
      setError("Could not connect to the backend");
    } finally {
      setLoading(false);
    }
  };

  const fetchFeatureTrends = async () => {
    try {
      setTrendLoading(true);

      const token = localStorage.getItem("access_token");

      const response = await fetch(
        "http://127.0.0.1:8000/api/insights/feature-trends",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Feature trend error:",
          data.detail
        );
        return;
      }

      setTrendData(data.monthly_trends || []);
    } catch (err) {
      console.error(
        "Feature trend connection error:",
        err
      );
    } finally {
      setTrendLoading(false);
    }
  };

  const fetchAllData = () => {
    fetchFeatures();
    fetchFeatureTrends();
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const totalRequests = features.reduce(
    (total, feature) =>
      total + feature.request_count,
    0
  );

  const highConfidence = features.filter(
    (feature) => feature.confidence >= 0.9
  ).length;

  const averageConfidence =
    features.length > 0
      ? Math.round(
          (features.reduce(
            (sum, feature) =>
              sum + feature.confidence,
            0
          ) /
            features.length) *
            100
        )
      : 0;

  const totalDatedRequests = trendData.reduce(
    (total, month) =>
      total +
      month.features.reduce(
        (sum, feature) =>
          sum + feature.request_count,
        0
      ),
    0
  );

  const maxTrendCount = Math.max(
    ...trendData.flatMap((month) =>
      month.features.map(
        (feature) => feature.request_count
      )
    ),
    1
  );

  const formatMonth = (period) => {
    const date = new Date(`${period}-01`);

    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="feature-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <header className="feature-header">

        <div className="feature-header-left">

          <button
            className="feature-back-btn"
            onClick={onBack}
            aria-label="Back to dashboard"
          >
            ←
          </button>

          <div className="feature-header-text">

            <div className="feature-eyebrow">
              PRODUCT INTELLIGENCE
            </div>

            <h1>
              Feature Requests
            </h1>

            <p>
              AI-discovered feature opportunities from your
              product feedback.
            </p>

          </div>

        </div>

        <button
          className="feature-refresh-btn"
          onClick={fetchAllData}
          disabled={loading || trendLoading}
        >
          ↻&nbsp; Refresh
        </button>

      </header>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="feature-content">

        {/* ===================================================
            SUMMARY CARDS
        =================================================== */}

        {!loading && !error && (
          <section className="feature-stats">

            <div className="feature-stat-card">

              <div className="feature-stat-icon purple">
                ✦
              </div>

              <div className="feature-stat-info">

                <span>
                  Feature groups
                </span>

                <strong>
                  {features.length}
                </strong>

              </div>

            </div>


            <div className="feature-stat-card">

              <div className="feature-stat-icon blue">
                ◎
              </div>

              <div className="feature-stat-info">

                <span>
                  Customer requests
                </span>

                <strong>
                  {totalRequests}
                </strong>

              </div>

            </div>


            <div className="feature-stat-card">

              <div className="feature-stat-icon green">
                ✓
              </div>

              <div className="feature-stat-info">

                <span>
                  High confidence
                </span>

                <strong>
                  {highConfidence}
                </strong>

              </div>

            </div>


            <div className="feature-stat-card">

              <div className="feature-stat-icon orange">
                #
              </div>

              <div className="feature-stat-info">

                <span>
                  Avg. confidence
                </span>

                <strong>
                  {averageConfidence}%
                </strong>

              </div>

            </div>

          </section>
        )}


        {/* ===================================================
            LOADING
        =================================================== */}

        {loading && (
          <section className="feature-state-card">

            <div className="state-icon">
              ✦
            </div>

            <h3>
              Loading feature requests
            </h3>

            <p>
              Fetching AI-discovered feature opportunities...
            </p>

          </section>
        )}


        {/* ===================================================
            ERROR
        =================================================== */}

        {!loading && error && (
          <section className="feature-state-card">

            <div className="state-icon error">
              !
            </div>

            <h3>
              Unable to load feature requests
            </h3>

            <p>
              {error}
            </p>

            <button
              className="retry-btn"
              onClick={fetchAllData}
            >
              Try Again
            </button>

          </section>
        )}


        {/* ===================================================
            EMPTY
        =================================================== */}

        {!loading &&
          !error &&
          features.length === 0 && (
            <section className="feature-state-card">

              <div className="state-icon">
                ✦
              </div>

              <h3>
                No feature requests found
              </h3>

              <p>
                Import customer feedback to discover
                feature opportunities.
              </p>

            </section>
          )}


        {/* ===================================================
            FEATURE REQUEST TRENDS
        =================================================== */}

        {!loading &&
          !error &&
          features.length > 0 && (

            <section className="feature-trend-section">

              <div className="trend-header">

                <div>

                  <div className="analysis-eyebrow">
                    TREND ANALYSIS
                  </div>

                  <h2>
                    Feature request trends
                  </h2>

                  <p>
                    Track how frequently customer feature
                    requests appear over time.
                  </p>

                </div>

              </div>


              {trendLoading ? (

                <div className="trend-empty">
                  Loading feature trends...
                </div>

              ) : trendData.length === 0 ? (

                <div className="trend-empty">
                  No dated feature requests available.
                </div>

              ) : (

                <div className="trend-chart">

                  {trendData.map((month) => (

                    <div
                      className="trend-month"
                      key={month.period}
                    >

                      <div className="trend-month-label">
                        {formatMonth(month.period)}
                      </div>


                      {month.features.map(
                        (feature) => (

                          <div
                            className="trend-row"
                            key={`${month.period}-${feature.feature_name}`}
                          >

                            <div className="trend-feature-name">
                              {feature.feature_name}
                            </div>

                            <div className="trend-bar-wrapper">

                              <div
                                className="trend-bar"
                                style={{
                                  width: `${Math.max(
                                    (feature.request_count /
                                      maxTrendCount) *
                                      100,
                                    8
                                  )}%`,
                                }}
                              />

                              <span className="trend-count">
                                {feature.request_count}
                              </span>

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  ))}

                </div>

              )}


              {!trendLoading &&
                trendData.length > 0 && (

                  <div className="trend-note">
                    {totalDatedRequests} dated requests analyzed
                  </div>

                )}

            </section>

          )}


        {/* ===================================================
            AI ANALYSIS
        =================================================== */}

        {!loading &&
          !error &&
          features.length > 0 && (

            <section className="feature-analysis">

              {/* Analysis header */}

              <div className="analysis-header">

                <div>

                  <div className="analysis-eyebrow">
                    AI ANALYSIS
                  </div>

                  <h2>
                    Discovered feature requests
                  </h2>

                  <p>
                    Feature opportunities are identified
                    and grouped from semantically related
                    customer feedback.
                  </p>

                </div>

                <div className="analysis-count">
                  {features.length} features
                </div>

              </div>


              {/* Feature Cards */}

              <div className="feature-grid">

                {features.map((feature) => (

                  <article
                    className="feature-card"
                    key={feature.id}
                  >

                    {/* Card top */}

                    <div className="feature-card-top">

                      <div className="feature-type">

                        <span className="feature-type-icon">
                          ✦
                        </span>

                        <span>
                          Feature request
                        </span>

                      </div>

                      <span className="cluster-label">
                        Cluster {feature.cluster_id}
                      </span>

                    </div>


                    {/* Feature title */}

                    <h3>
                      {feature.feature_name}
                    </h3>


                    {/* Summary */}

                    <p className="feature-card-summary">
                      {feature.summary}
                    </p>


                    {/* Metrics */}

                    <div className="feature-metrics">

                      <div className="feature-metric">

                        <strong>
                          {feature.request_count}
                        </strong>

                        <span>
                          {feature.request_count === 1
                            ? "request"
                            : "requests"}
                        </span>

                      </div>


                      <div className="feature-metric">

                        <strong>
                          {(feature.confidence * 100).toFixed(0)}%
                        </strong>

                        <span>
                          confidence
                        </span>

                      </div>

                    </div>


                    {/* Confidence bar */}

                    <div className="feature-confidence-bar">

                      <div
                        style={{
                          width: `${
                            feature.confidence * 100
                          }%`,
                        }}
                      />

                    </div>


                    {/* Supporting evidence */}

                    <div className="feature-evidence">

                      <div className="evidence-title">
                        SUPPORTING REQUESTS
                      </div>

                      <ul>

                        {feature.supporting_requests.map(
                          (request, index) => (

                            <li key={index}>
                              {request}
                            </li>

                          )
                        )}

                      </ul>

                    </div>

                  </article>

                ))}

              </div>

            </section>

          )}

      </main>

    </div>
  );
}

export default FeatureRequests;