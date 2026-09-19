import { useState } from "react";
import "./PRDGenerator.css";

function PRDGenerator({ onBack }) {
  console.log("PRD GENERATOR COMPONENT LOADED");
  const [prd, setPrd] = useState(null);
  const [feature, setFeature] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generatePRD = async () => {
    console.log("Generate PRD button clicked");

    try {
      setLoading(true);
      setError("");
      setPrd(null);
      setFeature(null);

      const token = localStorage.getItem("access_token");

      console.log("Token exists:", Boolean(token));

      if (!token) {
        throw new Error("You are not logged in. Please login again.");
      }

      console.log("Calling PRD API...");

      const response = await fetch(
        "http://127.0.0.1:8000/api/prd/generate",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      console.log("PRD API status:", response.status);

      const responseText = await response.text();

      console.log("PRD API response:", responseText);

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          "Backend returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            `PRD generation failed. Status: ${response.status}`
        );
      }

      if (!data.prd) {
        throw new Error(
          data.message ||
            "Backend did not return a PRD."
        );
      }

      console.log("PRD generated successfully:", data);

      setFeature(data.feature);
      setPrd(data.prd);

    } catch (err) {
      console.error(
        "PRD generation error:",
        err
      );

      setError(
        err.message ||
          "Could not generate PRD."
      );

    } finally {
      setLoading(false);
    }
  };

  const renderList = (items) => {
    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return (
        <p className="no-data">
          No information available.
        </p>
      );
    }

    return (
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            {item}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="prd-page">

      <header className="prd-header">

        <div>

          <button
            type="button"
            className="prd-back-button"
            onClick={onBack}
          >
            ← Back to Dashboard
          </button>

          <p className="prd-eyebrow">
            GENERATIVE AI
          </p>

          <h1>
            PRD Generator
          </h1>

          <p className="prd-description">
            Generate a complete Product Requirement
            Document from your customer-driven feature
            opportunities.
          </p>

        </div>

        <button
          type="button"
          className="generate-button"
          onClick={generatePRD}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Generating...
            </>
          ) : (
            <>✦ Generate PRD</>
          )}
        </button>

      </header>

      {error && (
        <div className="prd-error">
          <strong>PRD Generation Error</strong>
          <br />
          {error}
        </div>
      )}

      {!prd && !loading && !error && (
        <section className="prd-empty">

          <div className="prd-empty-icon">
            ✦
          </div>

          <h2>
            Ready to generate your PRD?
          </h2>

          <p>
            AI will analyze your highest-demand
            feature and generate a structured product
            requirement document.
          </p>

          <button
            type="button"
            className="empty-generate-button"
            onClick={generatePRD}
          >
            Generate PRD
          </button>

        </section>
      )}

      {loading && (
        <section className="prd-loading">

          <div className="loading-orb">
            ✦
          </div>

          <h2>
            Generating your PRD...
          </h2>

          <p>
            Groq AI is creating user stories,
            acceptance criteria and requirements.
          </p>

        </section>
      )}

      {prd && !loading && (
        <main className="prd-content">

          {feature && (
            <section className="prd-feature-card">

              <div>

                <p className="section-label">
                  SELECTED FEATURE
                </p>

                <h2>
                  {feature.feature_name}
                </h2>

                <p className="feature-summary">
                  {feature.summary}
                </p>

              </div>

              <div className="feature-stats">

                <div>
                  <span>
                    REQUESTS
                  </span>

                  <strong>
                    {feature.request_count}
                  </strong>
                </div>

                <div>
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

              </div>

            </section>
          )}

          <section className="prd-title-section">

            <p className="section-label">
              PRODUCT REQUIREMENT DOCUMENT
            </p>

            <h2>
              {prd.feature_name}
            </h2>

          </section>

          <section className="prd-section">

            <div className="section-heading">
              <span>01</span>
              <h3>
                Problem Statement
              </h3>
            </div>

            <div className="prd-text-card">
              <p>
                {prd.problem_statement}
              </p>
            </div>

          </section>

          <section className="prd-section">

            <div className="section-heading">
              <span>02</span>
              <h3>
                Objective
              </h3>
            </div>

            <div className="prd-text-card">
              <p>
                {prd.objective}
              </p>
            </div>

          </section>

          <section className="prd-section">

            <div className="section-heading">
              <span>03</span>
              <h3>
                User Stories
              </h3>
            </div>

            <div className="prd-list-card">
              {renderList(
                prd.user_stories
              )}
            </div>

          </section>

          <section className="prd-section">

            <div className="section-heading">
              <span>04</span>
              <h3>
                Acceptance Criteria
              </h3>
            </div>

            <div className="prd-list-card criteria-list">
              {renderList(
                prd.acceptance_criteria
              )}
            </div>

          </section>

          <section className="prd-section">

            <div className="section-heading">
              <span>05</span>
              <h3>
                Functional Requirements
              </h3>
            </div>

            <div className="prd-list-card">
              {renderList(
                prd.functional_requirements
              )}
            </div>

          </section>

          <section className="prd-section">

            <div className="section-heading">
              <span>06</span>
              <h3>
                Non-Functional Requirements
              </h3>
            </div>

            <div className="prd-list-card">
              {renderList(
                prd.non_functional_requirements
              )}
            </div>

          </section>

          <section className="prd-section">

            <div className="section-heading">
              <span>07</span>
              <h3>
                Success Metrics
              </h3>
            </div>

            <div className="prd-list-card">
              {renderList(
                prd.success_metrics
              )}
            </div>

          </section>

          <div className="prd-footer">

            <button
  type="button"
  style={{
    position: "relative",
    zIndex: 9999,
    pointerEvents: "auto",
    cursor: "pointer",
  }}
  className="generate-button"
  onClick={() => {
    alert("BUTTON WORKING");
    generatePRD();
  }}
  disabled={loading}
>
              ↻ Regenerate PRD
            </button>

          </div>

        </main>
      )}

    </div>
  );
}

export default PRDGenerator;