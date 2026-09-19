import { useEffect, useState } from "react";
import "./Roadmap.css";

function Roadmap({ onBack }) {
  const [roadmap, setRoadmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access_token");

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://127.0.0.1:8000/api/roadmap",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            "Failed to load roadmap."
        );
      }

      setRoadmap(data.roadmap || []);
    } catch (err) {
      console.error("Roadmap error:", err);
      setError(
        err.message ||
          "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  const generateRoadmap = async () => {
    try {
      setGenerating(true);
      setError("");

      const response = await fetch(
        "http://127.0.0.1:8000/api/roadmap/generate",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            "Failed to generate roadmap."
        );
      }

      setRoadmap(data.roadmap || []);
    } catch (err) {
      console.error(
        "Generate roadmap error:",
        err
      );

      setError(
        err.message ||
          "Something went wrong."
      );
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  return (
    <div className="roadmap-page">

      {/* HEADER */}
      <header className="roadmap-header">

        <div>
          <button
            className="roadmap-back-button"
            onClick={onBack}
          >
            ← Back to Dashboard
          </button>

          <p className="roadmap-eyebrow">
            PRODUCT PLANNING
          </p>

          <h1>
            Roadmap Planning
          </h1>

          <p className="roadmap-description">
            Transform customer-driven feature
            requests into an AI-generated product
            roadmap.
          </p>
        </div>

        <button
          className="generate-roadmap-button"
          onClick={generateRoadmap}
          disabled={generating}
        >
          {generating
            ? "Generating..."
            : "✦ Generate Roadmap"}
        </button>

      </header>


      {/* CONTENT */}
      <main className="roadmap-container">

        {error && (
          <div className="roadmap-error">
            {error}
          </div>
        )}


        {loading ? (
          <div className="roadmap-loading">
            <div className="loading-icon">
              ✦
            </div>

            <h2>
              Loading roadmap...
            </h2>

            <p>
              Fetching your product roadmap.
            </p>
          </div>
        ) : roadmap.length === 0 ? (

          <div className="roadmap-empty">

            <div className="empty-icon">
              ◈
            </div>

            <h2>
              No roadmap available
            </h2>

            <p>
              Generate a roadmap from your
              existing feature requests.
            </p>

            <button
              className="generate-roadmap-button"
              onClick={generateRoadmap}
            >
              ✦ Generate Roadmap
            </button>

          </div>

        ) : (

          <>

            {/* SUMMARY */}
            <section className="roadmap-summary">

              <div className="summary-card">
                <span>
                  Total Features
                </span>

                <strong>
                  {roadmap.length}
                </strong>
              </div>


              <div className="summary-card">
                <span>
                  High Priority
                </span>

                <strong>
                  {
                    roadmap.filter(
                      (item) =>
                        item.priority ===
                        "High"
                    ).length
                  }
                </strong>
              </div>


              <div className="summary-card">
                <span>
                  Milestones
                </span>

                <strong>
                  {
                    new Set(
                      roadmap.map(
                        (item) =>
                          item.milestone
                      )
                    ).size
                  }
                </strong>
              </div>

            </section>


            {/* ROADMAP */}
            <section className="roadmap-section">

              <div className="section-title">

                <div>
                  <p>
                    AI GENERATED
                  </p>

                  <h2>
                    Product Roadmap
                  </h2>
                </div>

                <span className="ai-badge">
                  ✦ Groq AI
                </span>

              </div>


              <div className="roadmap-list">

                {roadmap.map(
                  (item, index) => (

                    <div
                      className="roadmap-card"
                      key={index}
                    >

                      <div className="roadmap-number">
                        {String(
                          index + 1
                        ).padStart(2, "0")}
                      </div>


                      <div className="roadmap-card-content">

                        <div className="roadmap-card-top">

                          <h3>
                            {
                              item.feature_name
                            }
                          </h3>

                          <span
                            className={`priority-badge ${item.priority
                              ?.toLowerCase()
                              .replace(
                                " ",
                                "-"
                              )}`}
                          >
                            {
                              item.priority
                            }
                          </span>

                        </div>


                        <div className="roadmap-details">

                          <div>
                            <span>
                              MILESTONE
                            </span>

                            <strong>
                              {
                                item.milestone
                              }
                            </strong>
                          </div>


                          <div>
                            <span>
                              TIMELINE
                            </span>

                            <strong>
                              {
                                item.timeline
                              }
                            </strong>
                          </div>

                        </div>


                        <div className="roadmap-reason">

                          <span>
                            Why this matters
                          </span>

                          <p>
                            {
                              item.reason
                            }
                          </p>

                        </div>

                      </div>

                    </div>

                  )
                )}

              </div>

            </section>

          </>
        )}

      </main>

    </div>
  );
}

export default Roadmap;