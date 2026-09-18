import { useState } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ImportFeedback from "./pages/ImportFeedback";
import Insights from "./pages/Insights";
import PainPoints from "./pages/PainPoints";
import FeatureRequests from "./pages/FeatureRequests";

function App() {
  const [showRegister, setShowRegister] = useState(false);

  const [currentPage, setCurrentPage] =
    useState("dashboard");

  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("access_token"))
  );


  {/* =====================================================
      LOGIN / REGISTER
  ===================================================== */}

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


  {/* =====================================================
      IMPORT FEEDBACK
  ===================================================== */}

  if (currentPage === "import-feedback") {
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


  {/* =====================================================
      INSIGHTS
  ===================================================== */}

  if (currentPage === "insights") {
    return (
      <Insights
        onBack={() =>
          setCurrentPage("dashboard")
        }
      />
    );
  }


  {/* =====================================================
      PAIN POINTS
  ===================================================== */}

  if (currentPage === "pain-points") {
    return (
      <PainPoints
        onBack={() =>
          setCurrentPage("dashboard")
        }
      />
    );
  }


  {/* =====================================================
      FEATURE REQUESTS
  ===================================================== */}

  if (currentPage === "feature-requests") {
    return (
      <FeatureRequests
        onBack={() =>
          setCurrentPage("dashboard")
        }
      />
    );
  }


  {/* =====================================================
      DASHBOARD
  ===================================================== */}

  return (
    <Dashboard
      onImportFeedback={() =>
        setCurrentPage("import-feedback")
      }

      onInsights={() =>
        setCurrentPage("insights")
      }

      onPainPoints={() =>
        setCurrentPage("pain-points")
      }

      onFeatureRequests={() =>
        setCurrentPage("feature-requests")
      }
    />
  );
}

export default App;