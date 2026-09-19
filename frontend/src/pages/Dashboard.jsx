import { useEffect, useState } from "react";
import "./Dashboard.css";

function Dashboard({
  onImportFeedback,
  onInsights,
  onPainPoints,
  onFeatureRequests,
  onPrioritization,
  onPRDGenerator,
   onProductStrategy,
   onReports,
  onAIAssistant,
  onRoadmap,
  onSettings,
  onLogout,
}) {
  const [stats, setStats] = useState({
    feedback: 0,
    themes: 0,
    painPoints: 0,
    features: 0,
  });

  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
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

      const [
        trendsResponse,
        themesResponse,
        painPointsResponse,
        featuresResponse,
      ] = await Promise.all([
        fetch(
          "http://127.0.0.1:8000/api/insights/trends",
          { headers }
        ),

        fetch(
          "http://127.0.0.1:8000/api/insights/themes",
          { headers }
        ),

        fetch(
          "http://127.0.0.1:8000/api/insights/pain-points",
          { headers }
        ),

        fetch(
          "http://127.0.0.1:8000/api/features",
          { headers }
        ),
      ]);

      const trendsText =
        await trendsResponse.text();

      const themesText =
        await themesResponse.text();

      const painPointsText =
        await painPointsResponse.text();

      const featuresText =
        await featuresResponse.text();

      let trendsData = {};
      let themesData = {};
      let painPointsData = {};
      let featuresData = {};

      try {
        trendsData =
          JSON.parse(trendsText);
      } catch {
        trendsData = {};
      }

      try {
        themesData =
          JSON.parse(themesText);
      } catch {
        themesData = {};
      }

      try {
        painPointsData =
          JSON.parse(painPointsText);
      } catch {
        painPointsData = {};
      }

      try {
        featuresData =
          JSON.parse(featuresText);
      } catch {
        featuresData = {};
      }

      if (!trendsResponse.ok) {
        throw new Error(
          trendsData.detail ||
            "Failed to load feedback data."
        );
      }

      if (!themesResponse.ok) {
        throw new Error(
          themesData.detail ||
            "Failed to load themes."
        );
      }

      if (!painPointsResponse.ok) {
        throw new Error(
          painPointsData.detail ||
            "Failed to load pain points."
        );
      }

      if (!featuresResponse.ok) {
        throw new Error(
          featuresData.detail ||
            "Failed to load feature requests."
        );
      }

      const themes = Array.isArray(
        themesData.themes
      )
        ? themesData.themes
        : [];

      const painPoints = Array.isArray(
        painPointsData.pain_points
      )
        ? painPointsData.pain_points
        : [];

      const features = Array.isArray(
        featuresData.features
      )
        ? featuresData.features
        : [];

      const totalFeedback = Number(
        trendsData.total_feedback || 0
      );

      setStats({
        feedback: totalFeedback,
        themes: themes.length,
        painPoints: painPoints.length,
        features: features.length,
      });

      const generatedInsights = [];

      themes.slice(0, 3).forEach(
        (theme) => {
          generatedInsights.push({
            type: "theme",
            icon: "◈",
            title:
              theme.theme_name ||
              "Product Theme",
            description:
              theme.summary ||
              "AI identified an important product theme.",
            action: onInsights,
          });
        }
      );

      painPoints.slice(0, 2).forEach(
        (painPoint) => {
          generatedInsights.push({
            type: "pain",
            icon: "!",
            title:
              painPoint.pain_point ||
              "Customer Pain Point",
            description:
              painPoint.summary ||
              "AI identified a customer problem.",
            action: onPainPoints,
          });
        }
      );

      setInsights(
        generatedInsights.slice(0, 5)
      );
    } catch (err) {
      console.error(
        "Dashboard error:",
        err
      );

      setError(
        err.message ||
          "Could not load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard">

      {/* =========================
          SIDEBAR
      ========================== */}

      <aside className="sidebar">

        <div className="sidebar-brand">

          <div className="brand-icon">
            ✦
          </div>

          <div>
            <div className="brand-name">
              ProductIQ
            </div>

            <div className="brand-subtitle">
              Assistant
            </div>
          </div>

        </div>

        <div className="workspace-selector">

          <span className="workspace-dot"></span>

          <div>
            <small>
              WORKSPACE
            </small>

            <strong>
              Product Strategy
            </strong>
          </div>

          <span className="workspace-arrow">
            ⌄
          </span>

        </div>

        <nav className="sidebar-nav">

          <div className="nav-section-title">
            OVERVIEW
          </div>

          <button
            className="nav-item active"
          >
            <span>⌂</span>
            Dashboard
          </button>

          <div className="nav-section-title">
            PRODUCT INTELLIGENCE
          </div>

          <button
            className="nav-item"
            onClick={onImportFeedback}
          >
            <span>↥</span>
             Feedback
          </button>

          <button
            className="nav-item"
            onClick={onInsights}
          >
            <span>◈</span>
            Insights
          </button>

          <button
            className="nav-item"
            onClick={onPainPoints}
          >
            <span>!</span>
            Pain Points
          </button>

          <button
            className="nav-item"
            onClick={onFeatureRequests}
          >
            <span>✦</span>
            Feature Requests
          </button>

          {/* =========================
              PRIORITIZATION
          ========================== */}

          <button
            className="nav-item"
            onClick={onPrioritization}
          >
            <span>◎</span>
            Prioritization
          </button>

          <div className="nav-section-title">
            PLANNING
          </div>

          <button
            className="nav-item"
            onClick={onPRDGenerator}
          >
            <span>▤</span>
            PRD Generator
          </button>

          {/* <button className="nav-item">
            <span>◇</span>
            Roadmap
          </button> */}

          <div className="nav-section-title">
            AI TOOLS
          </div>

          {/* =========================
              AI ASSISTANT
          ========================== */}

          <button
            className="nav-item"
            onClick={onAIAssistant}
          >
            <span>✧</span>
            AI Assistant
          </button>
          <button
  className="nav-item"
  onClick={onRoadmap}
>
  <span>◫</span>
  Roadmap
</button>

          <button
  className="nav-item"
  onClick={onReports}
>
  <span>▥</span>
  Reports
</button>

          <button
  className="nav-item"
  onClick={onProductStrategy}
>
  <span>◆</span>
  Product Strategy
</button>

        </nav>

        {/* =========================
            SIDEBAR BOTTOM
        ========================== */}

        <div className="sidebar-bottom">

  <button
    className="nav-item settings-nav-button"
    onClick={onSettings}
  >
    <span>⚙</span>
    Settings
  </button>

  <button
    className="nav-item logout-button"
    onClick={onLogout}
  >
    <span>↪</span>
    Logout
  </button>

  <div className="user-card">

    <div className="user-avatar">
      U
    </div>

    <div className="user-info">

      <strong>
        Product Manager
      </strong>

      <small>
        Workspace owner
      </small>

    </div>

    <span>
      ⋮
    </span>

  </div>

</div>

      </aside>

      {/* =========================
          MAIN CONTENT
      ========================== */}

      <main className="dashboard-main">

        {/* HEADER */}

        <header className="dashboard-header">

          <div>

            <p className="header-eyebrow">
              AI PRODUCT ASSISTANT
            </p>

            <h1>
              Product Intelligence Overview
            </h1>

            <p className="header-description">
              Monitor customer feedback, AI insights,
              pain points, and feature opportunities
              in one place.
            </p>

          </div>

          {/* <button
            className="header-action"
            onClick={onImportFeedback}
          >
            <span>＋</span>
            Import feedback
          </button> */}

        </header>

        {/* =========================
            WELCOME CARD
        ========================== */}

        <section className="welcome-card">

          <div>

            <span className="welcome-label">
              AI PRODUCT COPILOT
            </span>

            <h2>
              Turn customer feedback into product
              decisions.
            </h2>

            <p>
              Import your customer feedback and let AI
              uncover themes, pain points, feature
              opportunities, and priorities.
            </p>

            <button
              className="welcome-button"
              onClick={onImportFeedback}
            >
              Start analyzing
              <span>→</span>
            </button>

          </div>

          <div className="welcome-visual">

            <div className="visual-glow"></div>

            <div className="visual-card">

              <div className="visual-icon">
                ✦
              </div>

              <strong>
                AI Insights
              </strong>

              <span>
                {loading
                  ? "Analyzing your data..."
                  : "Analysis complete"}
              </span>

            </div>

          </div>

        </section>

        {/* ERROR */}

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        {/* =========================
            STATS
        ========================== */}

        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-top">

              <span>
                Customer feedback
              </span>

              <div className="stat-icon">
                ◈
              </div>

            </div>

            <strong>
              {loading
                ? "..."
                : stats.feedback}
            </strong>

            <small>
              Items analyzed
            </small>

          </div>

          <div className="stat-card">

            <div className="stat-top">

              <span>
                Themes
              </span>

              <div className="stat-icon">
                ◉
              </div>

            </div>

            <strong>
              {loading
                ? "..."
                : stats.themes}
            </strong>

            <small>
              Themes identified
            </small>

          </div>

          <div className="stat-card">

            <div className="stat-top">

              <span>
                Pain points
              </span>

              <div className="stat-icon">
                !
              </div>

            </div>

            <strong>
              {loading
                ? "..."
                : stats.painPoints}
            </strong>

            <small>
              Issues identified
            </small>

          </div>

          <div className="stat-card">

            <div className="stat-top">

              <span>
                Feature requests
              </span>

              <div className="stat-icon">
                ✦
              </div>

            </div>

            <strong>
              {loading
                ? "..."
                : stats.features}
            </strong>

            <small>
              Opportunities found
            </small>

          </div>

        </section>

        {/* =========================
            DASHBOARD GRID
        ========================== */}

        <section className="dashboard-grid">

          {/* PRODUCT INSIGHTS */}

          <div className="activity-card">

            <div className="section-heading">

              <div>

                <h3>
                  Product insights
                </h3>

                <p>
                  AI-generated insights from your
                  customer data
                </p>

              </div>

              <button
                onClick={onInsights}
              >
                View all →
              </button>

            </div>

            {loading ? (

              <div className="empty-state">

                <div className="empty-icon">
                  ✦
                </div>

                <h4>
                  Analyzing feedback...
                </h4>

                <p>
                  Loading your AI-generated insights.
                </p>

              </div>

            ) : insights.length === 0 ? (

              <div className="empty-state">

                <div className="empty-icon">
                  ✦
                </div>

                <h4>
                  No insights yet
                </h4>

                <p>
                  Import customer feedback to start
                  discovering product insights.
                </p>

                <button
                  onClick={onImportFeedback}
                >
                  Import feedback
                </button>

              </div>

            ) : (

              <div className="insight-list">

                {insights.map(
                  (insight, index) => (

                    <button
                      className="insight-item"
                      key={index}
                      onClick={insight.action}
                    >

                      <div className="insight-icon">
                        {insight.icon}
                      </div>

                      <div className="insight-content">

                        <strong>
                          {insight.title}
                        </strong>

                        <p>
                          {insight.description}
                        </p>

                      </div>

                      <span className="insight-arrow">
                        →
                      </span>

                    </button>

                  )
                )}

              </div>

            )}

          </div>

          {/* QUICK ACTIONS */}

          <div className="quick-actions-card">

            <div className="section-heading">

              <div>

                <h3>
                  Quick actions
                </h3>

                <p>
                  Jump into your product workflow
                </p>

              </div>

            </div>

            <button
              className="quick-action"
              onClick={onImportFeedback}
            >

              <span>
                ↥
              </span>

              <div>

                <strong>
                  Import feedback
                </strong>

                <small>
                  CSV, reviews or support tickets
                </small>

              </div>

              <b>
                →
              </b>

            </button>

            <button
              className="quick-action"
              onClick={onFeatureRequests}
            >

              <span>
                ✦
              </span>

              <div>

                <strong>
                  View feature requests
                </strong>

                <small>
                  Explore AI-generated opportunities
                </small>

              </div>

              <b>
                →
              </b>

            </button>

            <button
              className="quick-action"
              onClick={onPainPoints}
            >

              <span>
                !
              </span>

              <div>

                <strong>
                  View pain points
                </strong>

                <small>
                  Understand customer problems
                </small>

              </div>

              <b>
                →
              </b>

            </button>

          </div>

        </section>

      </main>

    </div>
  );
}
export default Dashboard;
