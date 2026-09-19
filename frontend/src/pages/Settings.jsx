import "./Settings.css";
import { useEffect, useState } from "react";

export default function Settings({ onBack, onLogout }) {

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  const [notifications, setNotifications] = useState(
    localStorage.getItem("notifications") !== "off"
  );

  const userName =
    localStorage.getItem("logged_in_name") ||
    localStorage.getItem("registered_name") ||
    "Team Member";

  const userEmail =
    localStorage.getItem("logged_in_email") ||
    localStorage.getItem("registered_email") ||
    "Not available";

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      darkMode
    );

    localStorage.setItem(
      "theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem(
      "notifications",
      notifications ? "on" : "off"
    );
  }, [notifications]);

  return (
    <div className="settings-page">

      {/* Back Button */}
      <button
        className="back-button"
        onClick={onBack}
      >
        ← Back to Dashboard
      </button>

      {/* Header */}
      <div className="settings-header">
        <div>
          <h1>Settings</h1>

          <p>
            Manage your account and workspace preferences.
          </p>
        </div>
      </div>

      {/* Profile */}
      <section className="settings-card">

        <div className="settings-card-header">

          <div className="settings-icon">
            👤
          </div>

          <div>
            <h2>Profile</h2>

            <p>
              Your account information
            </p>
          </div>

        </div>

        <div className="settings-grid">

          <div className="setting-field">

            <label>
              Full Name
            </label>

            <div className="setting-value">
              {userName}
            </div>

          </div>

          <div className="setting-field">

            <label>
              Email
            </label>

            <div className="setting-value">
              {userEmail}
            </div>

          </div>

          <div className="setting-field">

            <label>
              Role
            </label>

            <div className="setting-value">
              Team Member
            </div>

          </div>

        </div>

      </section>

      {/* Appearance */}
      <section className="settings-card">

        <div className="settings-card-header">

          <div className="settings-icon">
            🎨
          </div>

          <div>
            <h2>
              Appearance
            </h2>

            <p>
              Customize how the application looks
            </p>
          </div>

        </div>

        <div className="setting-row">

          <div>

            <strong>
              Dark Mode
            </strong>

            <p>
              Switch between light and dark appearance.
            </p>

          </div>

          <button
            className={`toggle ${
              darkMode ? "active" : ""
            }`}
            onClick={() =>
              setDarkMode(!darkMode)
            }
            aria-label="Toggle dark mode"
          >
            <span></span>
          </button>

        </div>

      </section>

      {/* Notifications */}
      <section className="settings-card">

        <div className="settings-card-header">

          <div className="settings-icon">
            🔔
          </div>

          <div>
            <h2>
              Notifications
            </h2>

            <p>
              Manage product analysis notifications
            </p>
          </div>

        </div>

        <div className="setting-row">

          <div>

            <strong>
              AI Analysis Notifications
            </strong>

            <p>
              Get notified when AI analysis is completed.
            </p>

          </div>

          <button
            className={`toggle ${
              notifications ? "active" : ""
            }`}
            onClick={() =>
              setNotifications(!notifications)
            }
            aria-label="Toggle notifications"
          >
            <span></span>
          </button>

        </div>

      </section>

      {/* Security */}
      <section className="settings-card">

        <div className="settings-card-header">

          <div className="settings-icon">
            🔐
          </div>

          <div>
            <h2>
              Security
            </h2>

            <p>
              Manage your account security
            </p>
          </div>

        </div>

        <button
          className="logout-button"
          onClick={onLogout}
        >
          Logout
        </button>

      </section>

      {/* About */}
      <section className="settings-card about-card">

        <div className="settings-card-header">

          <div className="settings-icon">
            ℹ️
          </div>

          <div>
            <h2>
              About
            </h2>

            <p>
              Product Manager Copilot
            </p>
          </div>

        </div>

        <div className="about-content">

          <p>
            AI-powered customer feedback analysis
            and product planning workspace.
          </p>

          <span>
            Version 1.0.0
          </span>

        </div>

      </section>

    </div>
  );
}