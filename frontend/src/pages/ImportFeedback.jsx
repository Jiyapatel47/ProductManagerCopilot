import { useState } from "react";
import Papa from "papaparse";
import "./ImportFeedback.css";

function ImportFeedback({ onBack, onContinue }) {
  const [sourceType, setSourceType] = useState("Customer Feedback");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    setError("");
    setMessage("");
    setPreviewData([]);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please select a CSV file.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          setError("Could not read the CSV file.");
          return;
        }

        setPreviewData(results.data.slice(0, 5));
      },
      error: () => {
        setError("Failed to read CSV file.");
      },
    });
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError("Please select a CSV file first.");
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("You are not logged in. Please login again.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const formData = new FormData();

      formData.append("file", selectedFile);
      formData.append("source_type", sourceType);

      const response = await fetch(
        "http://127.0.0.1:8000/api/ingestion/feedback",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + token,
          },
          body: formData,
        }
      );

      const rawResponse = await response.text();

      console.log("Import status:", response.status);
      console.log("Import response:", rawResponse);

      let data = {};

      try {
        data = JSON.parse(rawResponse);
      } catch {
        data = {
          detail: rawResponse || "Invalid server response",
        };
      }

      if (!response.ok) {
        throw new Error(
          data.detail || data.message || "Failed to import feedback."
        );
      }

      const analysis = data.analysis || {};

      setMessage(
        "Imported " +
          (data.records_imported || 0) +
          " records successfully. " +
          "Themes: " +
          (analysis.themes_created || 0) +
          ", Pain Points: " +
          (analysis.pain_points_created || 0) +
          ", Features: " +
          (analysis.feature_requests_created || 0)
      );

      setTimeout(() => {
        if (onContinue) {
          onContinue();
        }
      }, 1000);
    } catch (err) {
      console.error("Import error:", err);
      setError(err.message || "Could not connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="import-page">
      <div className="import-container">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>

        <div className="import-header">
          <h1>Import Customer Feedback</h1>
          <p>
            Upload a CSV file containing customer feedback for AI analysis.
          </p>
        </div>

        <div className="import-card">
          <label className="field-label">Feedback Source</label>

          <select
            value={sourceType}
            onChange={(event) => setSourceType(event.target.value)}
            className="source-select"
          >
            <option>Customer Feedback</option>
            <option>Reviews</option>
            <option>Support Tickets</option>
            <option>Survey Responses</option>
          </select>

          <label className="field-label">CSV File</label>

          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="file-input"
          />

          {selectedFile && (
            <p className="file-name">
              Selected: {selectedFile.name}
            </p>
          )}

          {previewData.length > 0 && (
            <div className="preview-section">
              <h3>Preview</h3>

              <div className="preview-table-wrapper">
                <table className="preview-table">
                  <thead>
                    <tr>
                      {Object.keys(previewData[0]).map((key) => (
                        <th key={key}>{key}</th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {previewData.map((row, index) => (
                      <tr key={index}>
                        {Object.keys(previewData[0]).map((key) => (
                          <td key={key}>{row[key]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          {message && (
            <div className="success-message">{message}</div>
          )}

          <button
            className="import-button"
            onClick={handleImport}
            disabled={loading || !selectedFile}
          >
            {loading ? "Importing..." : "Import Feedback"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImportFeedback;