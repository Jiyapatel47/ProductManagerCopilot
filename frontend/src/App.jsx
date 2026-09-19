import { useState } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ImportFeedback from "./pages/ImportFeedback";
import Insights from "./pages/Insights";
import PainPoints from "./pages/PainPoints";
import FeatureRequests from "./pages/FeatureRequests";
import Prioritization from "./pages/Prioritization";
import PRDGenerator from "./pages/PRDGenerator";
import AIAssistant from "./pages/AIAssistant";
import Roadmap from "./pages/Roadmap";
import ProductStrategy from "./pages/ProductStrategy";
import Reports from "./pages/Reports";

function App() {
  const [showRegister, setShowRegister] =
    useState(false);

  const [currentPage, setCurrentPage] =
    useState("dashboard");

  const [isLoggedIn, setIsLoggedIn] =
    useState(
      Boolean(
        localStorage.getItem(
          "access_token"
        )
      )
    );

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {
    localStorage.removeItem(
      "access_token"
    );

    setIsLoggedIn(false);

    setCurrentPage("dashboard");
    setShowRegister(false);
  };

  // =========================
  // LOGIN / REGISTER
  // =========================
  if (!isLoggedIn) {
    return (
      <>
        {showRegister ? (
          <Register
            onBackToLogin={() =>
              setShowRegister(false)
            }
          />
        ) : (
          <Login
            onCreateAccount={() =>
              setShowRegister(true)
            }
            onLogin={() =>
              setIsLoggedIn(true)
            }
          />
        )}
      </>
    );
  }

  // =========================
  // IMPORT FEEDBACK
  // =========================
  if (
    currentPage ===
    "import-feedback"
  ) {
    return (
      <ImportFeedback
        onBack={() =>
          setCurrentPage("dashboard")
        }
        onContinue={() =>
          setCurrentPage("insights")
        }
      />
    );
  }

  // =========================
  // INSIGHTS
  // =========================
  if (
    currentPage === "insights"
  ) {
    return (
      <Insights
        onBack={() =>
          setCurrentPage("dashboard")
        }
      />
    );
  }

  // =========================
  // PAIN POINTS
  // =========================
  if (
    currentPage === "pain-points"
  ) {
    return (
      <PainPoints
        onBack={() =>
          setCurrentPage("dashboard")
        }
      />
    );
  }

  // =========================
  // FEATURE REQUESTS
  // =========================
  if (
    currentPage ===
    "feature-requests"
  ) {
    return (
      <FeatureRequests
        onBack={() =>
          setCurrentPage("dashboard")
        }
      />
    );
  }

  // =========================
  // PRIORITIZATION
  // =========================
  if (
    currentPage ===
    "prioritization"
  ) {
    return (
      <Prioritization
        onBack={() =>
          setCurrentPage("dashboard")
        }
      />
    );
  }

  // =========================
  // PRD GENERATOR
  // =========================
  if (
    currentPage ===
    "prd-generator"
  ) {
    return (
      <PRDGenerator
        onBack={() =>
          setCurrentPage("dashboard")
        }
      />
    );
  }
  if (currentPage === "reports") {
  return (
    <Reports
      onBack={() => setCurrentPage("dashboard")}
    />
  );
}

  // =========================
  // AI ASSISTANT
  // =========================
  if (
    currentPage ===
    "ai-assistant"
  ) {
    return (
      <AIAssistant
        onBack={() =>
          setCurrentPage("dashboard")
        }
      />
    );
  }

  // =========================
  // ROADMAP
  // =========================
  if (
    currentPage === "roadmap"
  ) {
    return (
      <Roadmap
        onBack={() =>
          setCurrentPage("dashboard")
        }
      />
    );
  }
if (currentPage === "product-strategy") {
  return (
    <ProductStrategy
      onBack={() => setCurrentPage("dashboard")}
    />
  );
}
  // =========================
  // DASHBOARD
  // =========================
  return (
    <Dashboard
      onImportFeedback={() =>
        setCurrentPage(
          "import-feedback"
        )
      }

      onInsights={() =>
        setCurrentPage(
          "insights"
        )
      }

      onPainPoints={() =>
        setCurrentPage(
          "pain-points"
        )
      }

      onFeatureRequests={() =>
        setCurrentPage(
          "feature-requests"
        )
      }

      onPrioritization={() =>
        setCurrentPage(
          "prioritization"
        )
      }

      onPRDGenerator={() =>
        setCurrentPage(
          "prd-generator"
        )
      }

      onRoadmap={() =>
        setCurrentPage(
          "roadmap"
        )
      }
      onProductStrategy={() => setCurrentPage("product-strategy")}
onReports={() => setCurrentPage("reports")}
      onAIAssistant={() =>
        setCurrentPage(
          "ai-assistant"
        )
      }

      onLogout={handleLogout}
    />
  );
}

export default App;