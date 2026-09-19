import { useEffect, useState } from "react";
import "./ProductStrategy.css";

function ProductStrategy({ onBack }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const API_URL = "http://127.0.0.1:8000";

  const getToken = () => {
    return localStorage.getItem("access_token");
  };

  const fetchStrategy = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/reports/product-strategy`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to load strategy report");
      }

      if (!data.report || Object.keys(data.report).length === 0) {
        setReport(null);
      } else {
        setReport(data.report);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateStrategy = async () => {
    try {
      setGenerating(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/reports/product-strategy`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to generate strategy");
      }

      setReport(data.report);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchStrategy();
  }, []);

  if (loading) {
    return (
      <div className="strategy-page">
        <div className="strategy-loading">
          Loading Product Strategy...
        </div>
      </div>
    );
  }

  return (
    <div className="strategy-page">
      <div className="strategy-header">
        <div>
          <p className="strategy-label">PRODUCT PLANNING</p>

          <h1>Product Strategy</h1>

          <p className="strategy-subtitle">
            Turn customer feedback and AI insights into a
            practical product strategy.
          </p>
        </div>

        <button
          className="strategy-back-btn"
          onClick={onBack}
        >
          ← Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="strategy-error">
          {error}
        </div>
      )}

      {!report ? (
        <div className="strategy-empty">
          <div className="empty-icon">◎</div>

          <h2>No Product Strategy Available</h2>

          <p>
            Generate an AI-powered product strategy based
            on your customer feedback and product insights.
          </p>

          <button
            className="generate-strategy-btn"
            onClick={generateStrategy}
            disabled={generating}
          >
            {generating
              ? "Generating..."
              : "Generate Product Strategy"}
          </button>
        </div>
      ) : (
        <>
          <div className="strategy-action-row">
            <button
              className="generate-strategy-btn"
              onClick={generateStrategy}
              disabled={generating}
            >
              {generating
                ? "Generating..."
                : "↻ Regenerate Strategy"}
            </button>
          </div>

          <div className="strategy-grid">

            {/* Current State */}
            <section className="strategy-card full-width">
              <div className="card-title-row">
                <span className="card-icon">◉</span>
                <h2>Current Product State</h2>
              </div>

              <p className="strategy-text">
                {report.current_state}
              </p>
            </section>

            {/* Key Problems */}
            <section className="strategy-card">
              <div className="card-title-row">
                <span className="card-icon">!</span>
                <h2>Key Problems</h2>
              </div>

              <ul className="strategy-list problem-list">
                {report.key_problems?.map((problem, index) => (
                  <li key={index}>
                    <span>•</span>
                    {problem}
                  </li>
                ))}
              </ul>
            </section>

            {/* Opportunities */}
            <section className="strategy-card">
              <div className="card-title-row">
                <span className="card-icon">✦</span>
                <h2>Product Opportunities</h2>
              </div>

              <ul className="strategy-list opportunity-list">
                {report.product_opportunities?.map(
                  (opportunity, index) => (
                    <li key={index}>
                      <span>✦</span>
                      {opportunity}
                    </li>
                  )
                )}
              </ul>
            </section>

            {/* Strategic Priorities */}
            <section className="strategy-card full-width">
              <div className="card-title-row">
                <span className="card-icon">◆</span>
                <h2>Strategic Priorities</h2>
              </div>

              <div className="priority-list">
                {report.strategic_priorities?.map(
                  (priority, index) => (
                    <div
                      className="priority-item"
                      key={index}
                    >
                      <div className="priority-number">
                        {index + 1}
                      </div>

                      <div>
                        <p>{priority}</p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </section>

            {/* Roadmap Alignment */}
            <section className="strategy-card full-width">
              <div className="card-title-row">
                <span className="card-icon">◇</span>
                <h2>Roadmap Alignment</h2>
              </div>

              <p className="strategy-text">
                {report.roadmap_alignment}
              </p>
            </section>

            {/* Next Steps */}
            <section className="strategy-card full-width">
              <div className="card-title-row">
                <span className="card-icon">→</span>
                <h2>Recommended Next Steps</h2>
              </div>

              <div className="next-steps">
                {report.next_steps?.map(
                  (step, index) => (
                    <div
                      className="next-step"
                      key={index}
                    >
                      <span className="step-check">
                        ✓
                      </span>

                      <span>{step}</span>
                    </div>
                  )
                )}
              </div>
            </section>

          </div>
        </>
      )}
    </div>
  );
}

export default ProductStrategy;