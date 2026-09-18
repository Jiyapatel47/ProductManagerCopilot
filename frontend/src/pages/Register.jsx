import { useState } from "react";

function Register({ onBackToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (event) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || data.message || "Registration failed");
        setLoading(false);
        return;
      }

      setMessage("Registration successful!");

      console.log("Registration response:", data);
    } catch (error) {
      console.error("Registration error:", error);
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
              <span className="eyebrow">BUILD WITH INSIGHT</span>

              <h1>
                From feedback
                <br />
                to your next
                <br />
                <span>great feature.</span>
              </h1>

              <p>
                Bring your customer feedback into one intelligent
                workspace and let AI help you turn it into action.
              </p>
            </div>

            <div className="feature-list">
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Understand customer pain points</span>
              </div>

              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Discover recurring product themes</span>
              </div>

              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Prioritize what matters most</span>
              </div>

              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Generate product documentation</span>
              </div>
            </div>

          </div>

          <div className="brand-footer">
            AI Product Assistant · Product Intelligence Workspace
          </div>
        </section>

        {/* Register section */}
        <section className="auth-form-section">
          <div className="auth-form-wrapper">

            <div className="mobile-brand">
              <div className="brand-logo">
                <div className="logo-mark">✦</div>
                <span>AI Product Assistant</span>
              </div>
            </div>

            <div className="form-heading">
              <span className="form-eyebrow">GET STARTED</span>

              <h2>Create your workspace account</h2>

              <p>
                Start turning customer feedback into product
                decisions.
              </p>
            </div>

            <form
              onSubmit={handleRegister}
              className="auth-form"
            >

              <div className="form-group">
                <label htmlFor="name">Full name</label>

                <div className="input-wrapper">
                  <span className="input-icon">♙</span>

                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="register-email">
                  Email address
                </label>

                <div className="input-wrapper">
                  <span className="input-icon">✉</span>

                  <input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="register-password">
                  Password
                </label>

                <div className="input-wrapper">
                  <span className="input-icon">●</span>

                  <input
                    id="register-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Create a password"
                    required
                  />
                </div>

                <span className="input-hint">
                  Use a strong password for your account.
                </span>
              </div>

              <button
                type="submit"
                className="primary-button"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create account"}
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
              <span>ALREADY HAVE AN ACCOUNT?</span>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={onBackToLogin}
            >
              Back to sign in
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

export default Register;