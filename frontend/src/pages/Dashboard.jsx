import "./Dashboard.css";

function Dashboard({
  onImportFeedback,
  onInsights,
  onPainPoints,
  onFeatureRequests,
}) {
  return (
    <div className="dashboard">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="sidebar-brand">
          <div className="brand-icon">✦</div>

          <div>
            <div className="brand-name">
              AI Product
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
              My Product Workspace
            </strong>
          </div>

          <span className="workspace-arrow">
            ⌄
          </span>

        </div>


        <nav className="sidebar-nav">

          {/* Overview */}
          <div className="nav-section-title">
            OVERVIEW
          </div>

          <button className="nav-item active">
            <span>⌂</span>
            Dashboard
          </button>


          {/* Product Intelligence */}
          <div className="nav-section-title">
            PRODUCT INTELLIGENCE
          </div>

          <button
            className="nav-item"
            onClick={onImportFeedback}
          >
            <span>↥</span>
            Import Feedback
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


          <button className="nav-item">
            <span>◎</span>
            Prioritization
          </button>


          {/* Planning */}
          <div className="nav-section-title">
            PLANNING
          </div>


          <button className="nav-item">
            <span>▤</span>
            PRD Generator
          </button>


          <button className="nav-item">
            <span>◇</span>
            Roadmap
          </button>


          {/* AI Tools */}
          <div className="nav-section-title">
            AI TOOLS
          </div>


          <button className="nav-item">
            <span>✧</span>
            AI Assistant
          </button>


          <button className="nav-item">
            <span>▥</span>
            Reports
          </button>

        </nav>


        {/* Sidebar Bottom */}
        <div className="sidebar-bottom">

          <button className="nav-item">
            <span>⚙</span>
            Settings
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


      {/* Main Content */}
      <main className="dashboard-main">

        {/* Header */}
        <header className="dashboard-header">

          <div>

            <p className="header-eyebrow">
              PRODUCT INTELLIGENCE
            </p>


            <h1>
              Good evening 👋
            </h1>


            <p className="header-description">
              Here's what's happening with your product.
            </p>

          </div>


          <button
            className="header-action"
            onClick={onImportFeedback}
          >
            <span>＋</span>
            Import feedback
          </button>

        </header>


        {/* Welcome Card */}
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
                Ready to analyze your data
              </span>

            </div>

          </div>

        </section>


        {/* Stats */}
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
              0
            </strong>


            <small>
              Items analyzed
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
              0
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
              0
            </strong>


            <small>
              Opportunities found
            </small>

          </div>


          <div className="stat-card">

            <div className="stat-top">

              <span>
                Prioritized
              </span>


              <div className="stat-icon">
                ◎
              </div>

            </div>


            <strong>
              0
            </strong>


            <small>
              Features scored
            </small>

          </div>

        </section>


        {/* Dashboard Grid */}
        <section className="dashboard-grid">

          {/* Product Insights */}
          <div className="activity-card">

            <div className="section-heading">

              <div>

                <h3>
                  Product insights
                </h3>


                <p>
                  AI-generated insights from your customer data
                </p>

              </div>


              <button
                onClick={onInsights}
              >
                View all →
              </button>

            </div>


            <div className="empty-state">

              <div className="empty-icon">
                ✦
              </div>


              <h4>
                No insights yet
              </h4>


              <p>
                Import customer feedback to start discovering
                product insights.
              </p>


              <button
                onClick={onImportFeedback}
              >
                Import feedback
              </button>

            </div>

          </div>


          {/* Quick Actions */}
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


            <button className="quick-action">

              <span>
                ✦
              </span>


              <div>

                <strong>
                  Generate a PRD
                </strong>


                <small>
                  Turn an idea into documentation
                </small>

              </div>


              <b>
                →
              </b>

            </button>


            <button className="quick-action">

              <span>
                ✧
              </span>


              <div>

                <strong>
                  Ask AI Assistant
                </strong>


                <small>
                  Get answers about your product
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