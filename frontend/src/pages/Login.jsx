import { useState } from "react";

function Login({ onCreateAccount, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.access_token) {
        setMessage(data.detail || data.message || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("access_token", data.access_token);

      setMessage("Login successful!");

      onLogin();

      console.log("Login response:", data);
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Could not connect to the backend");
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">

        {/* Left branding section */}
        <section className="auth-brand">
          <div className="brand-content">

            <div className="brand-logo">
              <div className="logo-mark">✦</div>
              <span>AI Product Assistant</span>
            </div>

            <div className="brand-main">
              <span className="eyebrow">PRODUCT MANAGER COPILOT</span>

              <h1>
                Turn customer
                <br />
                feedback into
                <br />
                <span>better products.</span>
              </h1>

              <p>
                Analyze feedback, discover product insights,
                prioritize features, and generate product
                documentation with AI.
              </p>
            </div>

            <div className="feature-list">
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Customer feedback intelligence</span>
              </div>

              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>AI-powered feature prioritization</span>
              </div>

              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>PRD and user story generation</span>
              </div>

              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Roadmap planning and insights</span>
              </div>
            </div>

          </div>

          <div className="brand-footer">
            AI Product Assistant · Product Intelligence Workspace
          </div>
        </section>

        {/* Login section */}
        <section className="auth-form-section">
          <div className="auth-form-wrapper">

            <div className="mobile-brand">
              <div className="brand-logo">
                <div className="logo-mark">✦</div>
                <span>AI Product Assistant</span>
              </div>
            </div>

            <div className="form-heading">
              <span className="form-eyebrow">WELCOME BACK</span>
              <h2>Sign in to your workspace</h2>
              <p>
                Continue managing your product with AI.
              </p>
            </div>

            <form onSubmit={handleLogin} className="auth-form">

              <div className="form-group">
                <label htmlFor="email">Email address</label>

                <div className="input-wrapper">
                  <span className="input-icon">✉</span>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="label-row">
                  <label htmlFor="password">Password</label>
                  <button
                    type="button"
                    className="forgot-button"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="input-wrapper">
                  <span className="input-icon">●</span>

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="primary-button"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
                {!loading && <span>→</span>}
              </button>

              {message && (
                <div
                  className={`auth-message ${
                    message.includes("successful")
                      ? "success"
                      : "error"
                  }`}
                >
                  {message}
                </div>
              )}

            </form>

            <div className="form-divider">
              <span>NEW TO AI PRODUCT ASSISTANT?</span>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={onCreateAccount}
            >
              Create an account
            </button>

            <p className="security-note">
              🔒 Your workspace data is securely protected.
            </p>

          </div>
        </section>

      </div>
    </div>
  );
}

export default Login;