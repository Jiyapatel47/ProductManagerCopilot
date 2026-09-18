import { useEffect, useState } from "react";
import "./PainPoints.css";

function PainPoints({ onBack }) {
  const [painPoints, setPainPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPainPoints = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        "http://127.0.0.1:8000/api/insights/pain-points",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail ||
            "Could not load customer pain points."
        );

        setLoading(false);
        return;
      }

      setPainPoints(data.pain_points || []);
    } catch (err) {
      console.error("Pain points error:", err);

      setError(
        "Could not connect to the backend."
      );
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPainPoints();
  }, []);

  const formatPainPointType = (type) => {
    if (!type || type === "none") {
      return "No pain point";
    }

    return type
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const isActualPainPoint = (item) => {
    return (
      item.pain_point_type &&
      item.pain_point_type !== "none"
    );
  };

  const actualPainPoints = painPoints.filter(
    isActualPainPoint
  );

  return (
    <div className="pain-points-page">

      {/* Header */}
      <header className="pain-points-header">

        <div className="pain-points-header-left">

          <button
            className="pain-points-back-button"
            onClick={onBack}
          >
            ←
          </button>

          <div>

            <p className="pain-points-eyebrow">
              PRODUCT INTELLIGENCE
            </p>

            <h1>
              Customer Pain Points
            </h1>

            <p className="pain-points-description">
              AI-identified problems and difficulties
              experienced by your customers.
            </p>

          </div>

        </div>

        <button
          className="pain-points-refresh-button"
          onClick={fetchPainPoints}
          disabled={loading}
        >
          ↻
          {loading
            ? " Refreshing..."
            : " Refresh"}
        </button>

      </header>


      <main className="pain-points-content">

        {/* Summary */}
        <section className="pain-points-summary">

          <div className="pain-summary-card">

            <div className="pain-summary-icon">
              !
            </div>

            <div>
              <span>
                Identified pain points
              </span>

              <strong>
                {loading
                  ? "..."
                  : actualPainPoints.length}
              </strong>
            </div>

          </div>


          <div className="pain-summary-card">

            <div className="pain-summary-icon">
              ◈
            </div>

            <div>
              <span>
                Themes analyzed
              </span>

              <strong>
                {loading
                  ? "..."
                  : painPoints.length}
              </strong>
            </div>

          </div>


          <div className="pain-summary-card">

            <div className="pain-summary-icon">
              ◎
            </div>

            <div>
              <span>
                Supporting feedback
              </span>

              <strong>
                {loading
                  ? "..."
                  : actualPainPoints.reduce(
                      (total, item) =>
                        total +
                        item.feedback_count,
                      0
                    )}
              </strong>
            </div>

          </div>

        </section>


        {/* Loading */}
        {loading && (
          <div className="pain-points-state">

            <div className="pain-loading-spinner"></div>

            <h3>
              Analyzing customer problems
            </h3>

            <p>
              Loading AI-identified pain points...
            </p>

          </div>
        )}


        {/* Error */}
        {!loading && error && (
          <div className="pain-points-state pain-error-state">

            <div className="pain-state-icon">
              !
            </div>

            <h3>
              Unable to load pain points
            </h3>

            <p>
              {error}
            </p>

            <button
              onClick={fetchPainPoints}
            >
              Try again
            </button>

          </div>
        )}


        {/* Content */}
        {!loading && !error && (
          <section className="pain-points-section">

            <div className="pain-section-top">

              <div>

                <p className="pain-section-eyebrow">
                  CUSTOMER PROBLEMS
                </p>

                <h2>
                  Identified pain points
                </h2>

                <p>
                  Problems are derived from themes and
                  their supporting customer feedback.
                </p>

              </div>

              <span className="pain-count">
                {actualPainPoints.length} identified
              </span>

            </div>


            {actualPainPoints.length === 0 ? (

              <div className="pain-points-state">

                <div className="pain-state-icon">
                  ✓
                </div>

                <h3>
                  No customer pain points identified
                </h3>

                <p>
                  The analyzed feedback does not currently
                  contain clear customer problems.
                </p>

              </div>

            ) : (

              <div className="pain-points-grid">

                {actualPainPoints.map((item) => (

                  <article
                    className="pain-point-card"
                    key={item.id}
                  >

                    <div className="pain-point-card-top">

                      <div className="pain-point-icon">
                        !
                      </div>

                      <span className="pain-point-type">
                        {formatPainPointType(
                          item.pain_point_type
                        )}
                      </span>

                      <span className="pain-cluster-label">
                        Cluster {item.cluster_id}
                      </span>

                    </div>


                    <h3>
                      {item.pain_point}
                    </h3>


                    <p className="pain-point-summary">
                      {item.summary}
                    </p>


                    <div className="pain-point-meta">

                      <div>

                        <strong>
                          {item.feedback_count}
                        </strong>

                        <span>
                          supporting feedback
                        </span>

                      </div>


                      <div>

                        <strong>
                          {Math.round(
                            item.confidence * 100
                          )}
                          %
                        </strong>

                        <span>
                          confidence
                        </span>

                      </div>

                    </div>


                    <div className="pain-confidence-bar">

                      <div
                        className="pain-confidence-fill"
                        style={{
                          width: `${
                            item.confidence * 100
                          }%`,
                        }}
                      ></div>

                    </div>


                    {item.supporting_feedback?.length >
                      0 && (

                      <div className="pain-evidence">

                        <span className="pain-evidence-label">
                          CUSTOMER EVIDENCE
                        </span>

                        <div className="pain-evidence-list">

                          {item.supporting_feedback.map(
                            (feedback, index) => (

                              <p key={index}>
                                “{feedback}”
                              </p>

                            )
                          )}

                        </div>

                      </div>

                    )}

                  </article>

                ))}

              </div>

            )}

          </section>
        )}

      </main>

    </div>
  );
}

export default PainPoints;