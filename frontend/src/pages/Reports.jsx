
import { useEffect, useState } from "react";
import "./Reports.css";

function Reports({ onBack }) {
  const [executiveSummary, setExecutiveSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = "http://127.0.0.1:8000";

  const getToken = () => {
    return localStorage.getItem("access_token");
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const headers = {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      };

      const summaryResponse = await fetch(
        `${API_URL}/api/reports/executive-summary`,
        {
          headers,
        }
      );

      const summaryData = await summaryResponse.json();

      if (!summaryResponse.ok) {
        throw new Error(
          summaryData.detail ||
            "Failed to load executive summary"
        );
      }

      setExecutiveSummary(
        summaryData.report &&
          Object.keys(summaryData.report).length > 0
          ? summaryData.report
          : null
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  if (loading) {
    return (
      <div className="reports-page">
        <div className="reports-loading">
          Loading Reports...
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">

      <div className="reports-header">
        <div>
          <p className="reports-label">
            PRODUCT DOCUMENTATION
          </p>

          <h1>Reports</h1>

          <p className="reports-subtitle">
            View AI-generated product insights and
            customer feedback reports.
          </p>
        </div>

        <button
          className="reports-back-btn"
          onClick={onBack}
        >
          ← Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="reports-error">
          {error}
        </div>
      )}

      {/* Executive Summary */}

      <section className="report-section">

        <div className="report-section-header">
          <div>
            <span className="report-icon">▣</span>

            <h2>Executive Summary</h2>

            <p>
              High-level summary of customer feedback
              and product insights.
            </p>
          </div>
        </div>

        {!executiveSummary ? (
          <div className="empty-report">
            No executive summary available.
          </div>
        ) : (
          <div className="report-content">

            <div className="report-block full">
              <h3>Overview</h3>

              <p>
                {executiveSummary.overview}
              </p>
            </div>

            <div className="report-block">
              <h3>Key Themes</h3>

              <ul>
                {executiveSummary.key_themes?.map(
                  (theme, index) => (
                    <li key={index}>
                      {theme}
                    </li>
                  )
                )}
              </ul>
            </div>

            <div className="report-block">
              <h3>Major Pain Points</h3>

              <ul>
                {executiveSummary.major_pain_points?.map(
                  (pain, index) => (
                    <li key={index}>
                      {pain}
                    </li>
                  )
                )}
              </ul>
            </div>

            <div className="report-block">
              <h3>Top Feature Opportunities</h3>

              <ul>
                {executiveSummary.top_feature_opportunities?.map(
                  (feature, index) => (
                    <li key={index}>
                      {feature}
                    </li>
                  )
                )}
              </ul>
            </div>

            <div className="report-block full recommendation">
              <h3>Recommended Focus</h3>

              <p>
                {executiveSummary.recommended_focus}
              </p>
            </div>

          </div>
        )}
      </section>

    </div>
  );
}

export default Reports;

