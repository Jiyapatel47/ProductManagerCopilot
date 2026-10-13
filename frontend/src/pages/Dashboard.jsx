
import { useEffect, useState } from "react";
import "./Dashboard.css";

function Dashboard({
  onImportFeedback,
  onInsights,
  onPainPoints,
  onFeatureRequests,
  onPrioritization,
  onPRDGenerator,
  onUserStories,
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
        Authorization: `Bearer ${token}`,
      };

      const endpoints = [
        "/api/insights/trends",
        "/api/insights/themes",
        "/api/insights/pain-points",
        "/api/features",
      ];

      const responses = await Promise.all(
        endpoints.map((endpoint) =>
          fetch(`http://127.0.0.1:8000${endpoint}`, {
            headers,
          })
        )
      );

      const results = await Promise.all(
        responses.map(async (response) => {
          const text = await response.text();

          let data = {};

          try {
            data = JSON.parse(text);
          } catch {
            data = {};
          }

          if (!response.ok) {
            throw new Error(
              data.detail || "Failed to load dashboard data."
            );
          }

          return data;
        })
      );

      const [trendsData, themesData, painPointsData, featuresData] =
        results;

      const themes = Array.isArray(themesData.themes)
        ? themesData.themes
        : [];

      const painPoints = Array.isArray(painPointsData.pain_points)
        ? painPointsData.pain_points
        : [];

      const features = Array.isArray(featuresData.features)
        ? featuresData.features
        : [];

      setStats({
        feedback: Number(trendsData.total_feedback || 0),
        themes: themes.length,
        painPoints: painPoints.length,
        features: features.length,
      });

      const generatedInsights = [];

      themes.slice(0, 3).forEach((theme) => {
        generatedInsights.push({
          icon: "◈",
          title: theme.theme_name || "Product Theme",
          description:
            theme.summary ||
            "AI identified an important product theme.",
          action: onInsights,
        });
      });

      painPoints.slice(0, 2).forEach((painPoint) => {
        generatedInsights.push({
          icon: "!",
          title: painPoint.pain_point || "Customer Pain Point",
          description:
            painPoint.summary ||
            "AI identified a customer problem.",
          action: onPainPoints,
        });
      });

      setInsights(generatedInsights.slice(0, 5));
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err.message || "Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const navButton = (label, icon, action) => (
    <button
      type="button"
      className="nav-item"
      onClick={action}
      key={label}
    >
      <span>{icon}</span>
      {label}
    </button>
  );

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">✦</div>
          <div>
            <div className="brand-name">ProductIQ</div>
            <div className="brand-subtitle">Assistant</div>
          </div>
        </div>

        <div className="workspace-selector">
          <span className="workspace-dot"></span>
          <div>
            <small>WORKSPACE</small>
            <strong>Product Strategy</strong>
          </div>
          <span className="workspace-arrow">⌄</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">OVERVIEW</div>

          <button
            type="button"
            className="nav-item active"
          >
            <span>⌂</span>
            Dashboard
          </button>

          <div className="nav-section-title">
            PRODUCT INTELLIGENCE
          </div>

          {navButton("Feedback", "↥", onImportFeedback)}
          {navButton("Insights", "◈", onInsights)}
          {navButton("Pain Points", "!", onPainPoints)}
          {navButton("Feature Requests", "✦", onFeatureRequests)}
          {navButton("Prioritization", "◎", onPrioritization)}

          <div className="nav-section-title">PLANNING</div>

          {navButton("PRD Generator", "▤", onPRDGenerator)}
          {navButton("User Stories", "☷", onUserStories)}
          {navButton("Roadmap", "◫", onRoadmap)}
          {navButton("Product Strategy", "◆", onProductStrategy)}

          <div className="nav-section-title">AI TOOLS</div>

          {navButton("AI Assistant", "✧", onAIAssistant)}
          {navButton("Reports", "▥", onReports)}
        </nav>

        <div className="sidebar-bottom">
          <button
            type="button"
            className="nav-item settings-nav-button"
            onClick={onSettings}
          >
            <span>⚙</span>
            Settings
          </button>

          <button
            type="button"
            className="nav-item logout-button"
            onClick={onLogout}
          >
            <span>↪</span>
            Logout
          </button>

          <div className="user-card">
            <div className="user-avatar">U</div>
            <div className="user-info">
              <strong>Product Manager</strong>
              <small>Workspace owner</small>
            </div>
            <span>⋮</span>
          </div>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="header-eyebrow">
              AI PRODUCT ASSISTANT
            </p>

            <h1>Product Intelligence Overview</h1>

            <p className="header-description">
              Monitor customer feedback, AI insights, pain points,
              and feature opportunities in one place.
            </p>
          </div>
        </header>

        <section className="welcome-card">
          <div>
            <span className="welcome-label">
              AI PRODUCT COPILOT
            </span>

            <h2>
              Turn customer feedback into product decisions.
            </h2>

            <p>
              Import your customer feedback and let AI uncover
              themes, pain points, feature opportunities, and priorities.
            </p>

            <button
              type="button"
              className="welcome-button"
              onClick={onImportFeedback}
            >
              Start analyzing <span>→</span>
            </button>
          </div>

          <div className="welcome-visual">
            <div className="visual-glow"></div>

            <div className="visual-card">
              <div className="visual-icon">✦</div>
              <strong>AI Insights</strong>
              <span>
                {loading ? "Analyzing your data..." : "Analysis complete"}
              </span>
            </div>
          </div>
        </section>

        {error && (
          <div className="dashboard-error">
            {error}
            <button
              type="button"
              onClick={fetchDashboardData}
              style={{ marginLeft: "12px" }}
            >
              Retry
            </button>
          </div>
        )}

        <section className="stats-grid">
          {[
            {
              label: "Customer feedback",
              value: stats.feedback,
              caption: "Items analyzed",
              icon: "◈",
            },
            {
              label: "Themes",
              value: stats.themes,
              caption: "Themes identified",
              icon: "◉",
            },
            {
              label: "Pain points",
              value: stats.painPoints,
              caption: "Issues identified",
              icon: "!",
            },
            {
              label: "Feature requests",
              value: stats.features,
              caption: "Opportunities found",
              icon: "✦",
            },
          ].map((stat) => (
            <div className="stat-card" key={stat.label}>
              <div className="stat-top">
                <span>{stat.label}</span>
                <div className="stat-icon">{stat.icon}</div>
              </div>

              <strong>{loading ? "..." : stat.value}</strong>
              <small>{stat.caption}</small>
            </div>
          ))}
        </section>

        <section className="dashboard-grid">
          <div className="activity-card">
            <div className="section-heading">
              <div>
                <h3>Product insights</h3>
                <p>AI-generated insights from your customer data</p>
              </div>

              <button type="button" onClick={onInsights}>
                View all →
              </button>
            </div>

            {loading ? (
              <div className="empty-state">
                <div className="empty-icon">✦</div>
                <h4>Analyzing feedback...</h4>
                <p>Loading your AI-generated insights.</p>
              </div>
            ) : insights.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✦</div>
                <h4>No insights yet</h4>
                <p>
                  Import customer feedback to start discovering
                  product insights.
                </p>

                <button type="button" onClick={onImportFeedback}>
                  Import feedback
                </button>
              </div>
            ) : (
              <div className="insight-list">
                {insights.map((insight, index) => (
                  <button
                    type="button"
                    className="insight-item"
                    key={`${insight.title}-${index}`}
                    onClick={insight.action}
                  >
                    <div className="insight-icon">
                      {insight.icon}
                    </div>

                    <div className="insight-content">
                      <strong>{insight.title}</strong>
                      <p>{insight.description}</p>
                    </div>

                    <span className="insight-arrow">→</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="quick-actions-card">
            <div className="section-heading">
              <div>
                <h3>Quick actions</h3>
                <p>Jump into your product workflow</p>
              </div>
            </div>

            {[
              {
                title: "Import feedback",
                description: "CSV, reviews or support tickets",
                icon: "↥",
                action: onImportFeedback,
              },
              {
                title: "View feature requests",
                description: "Explore AI-generated opportunities",
                icon: "✦",
                action: onFeatureRequests,
              },
              {
                title: "View pain points",
                description: "Understand customer problems",
                icon: "!",
                action: onPainPoints,
              },
              {
                title: "Generate user stories",
                description: "Turn product requirements into user stories",
                icon: "☷",
                action: onUserStories,
              },
            ].map((item) => (
              <button
                type="button"
                className="quick-action"
                key={item.title}
                onClick={item.action}
              >
                <span>{item.icon}</span>

                <div>
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                </div>

                <b>→</b>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
