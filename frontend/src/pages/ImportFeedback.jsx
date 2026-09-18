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

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please select a CSV file.");
      setSelectedFile(null);
      setPreviewData([]);
      return;
    }

    setSelectedFile(file);
    setError("");
    setMessage("");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      preview: 5,
      complete: (results) => {
        setPreviewData(results.data || []);
      },
      error: (parseError) => {
        console.error("CSV parsing error:", parseError);
        setError("Could not read the CSV file.");
        setPreviewData([]);
      },
    });
  };

  const handleDrop = (event) => {
    event.preventDefault();

    const file = event.dataTransfer.files?.[0];

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please drop a CSV file.");
      return;
    }

    setSelectedFile(file);
    setError("");
    setMessage("");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      preview: 5,
      complete: (results) => {
        setPreviewData(results.data || []);
      },
      error: (parseError) => {
        console.error("CSV parsing error:", parseError);
        setError("Could not read the CSV file.");
        setPreviewData([]);
      },
    });
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewData([]);
    setError("");
    setMessage("");
  };

  const handleContinue = async () => {
    if (!selectedFile) {
      setError("Please select a CSV file first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("Your login session has expired. Please log in again.");
        return;
      }

      const formData = new FormData();

      formData.append("file", selectedFile);
      formData.append("source_type", sourceType);

      const response = await fetch(
        "http://127.0.0.1:8000/api/ingestion/feedback",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail ||
            data.message ||
            "Failed to import feedback."
        );
        return;
      }

      console.log("Feedback import response:", data);

      setMessage(
        `Successfully imported ${
          data.records_imported || 0
        } feedback records.`
      );

      setTimeout(() => {
        if (onContinue) {
          onContinue();
        }
      }, 800);
    } catch (err) {
      console.error("Feedback import error:", err);
      setError("Could not connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="import-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="import-header">

        <div className="import-header-left">

          <button
            className="import-back-btn"
            onClick={onBack}
            aria-label="Back to dashboard"
          >
            ←
          </button>

          <div>
            <div className="import-eyebrow">
              DATA INGESTION
            </div>

            <h1>Import Feedback</h1>

            <p>
              Upload customer feedback to generate product
              intelligence.
            </p>
          </div>

        </div>

      </header>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="import-content">

        {/* ===================================================
            SOURCE TYPE
        =================================================== */}

        <section className="import-card">

          <div className="import-card-heading">

            <div className="import-icon">
              ◎
            </div>

            <div>
              <h2>Feedback source</h2>

              <p>
                Select the type of customer data you want
                to analyze.
              </p>
            </div>

          </div>


          <div className="source-options">

            <button
              type="button"
              className={`source-option ${
                sourceType === "Customer Feedback"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setSourceType("Customer Feedback")
              }
            >
              <span className="source-option-icon">
                💬
              </span>

              <span>
                <strong>Customer Feedback</strong>
                <small>
                  General feedback from customers
                </small>
              </span>
            </button>


            <button
              type="button"
              className={`source-option ${
                sourceType === "Reviews"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setSourceType("Reviews")
              }
            >
              <span className="source-option-icon">
                ★
              </span>

              <span>
                <strong>Reviews</strong>
                <small>
                  Product or app reviews
                </small>
              </span>
            </button>


            <button
              type="button"
              className={`source-option ${
                sourceType === "Support Tickets"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setSourceType("Support Tickets")
              }
            >
              <span className="source-option-icon">
                ?
              </span>

              <span>
                <strong>Support Tickets</strong>
                <small>
                  Customer support conversations
                </small>
              </span>
            </button>

          </div>

        </section>


        {/* ===================================================
            UPLOAD
        =================================================== */}

        <section className="import-card">

          <div className="import-card-heading">

            <div className="import-icon">
              ↑
            </div>

            <div>
              <h2>Upload your data</h2>

              <p>
                Upload a CSV file containing your customer
                feedback.
              </p>
            </div>

          </div>


          {!selectedFile && (
            <label
              className="upload-area"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >

              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                hidden
              />

              <div className="upload-icon">
                ↑
              </div>

              <h3>
                Drop your CSV file here
              </h3>

              <p>
                or click to browse from your computer
              </p>

              <span className="upload-format">
                CSV files only
              </span>

            </label>
          )}


          {selectedFile && (
            <div className="selected-file">

              <div className="selected-file-icon">
                CSV
              </div>

              <div className="selected-file-info">

                <strong>
                  {selectedFile.name}
                </strong>

                <span>
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </span>

              </div>

              <button
                type="button"
                className="remove-file-btn"
                onClick={handleRemoveFile}
                disabled={loading}
              >
                Remove
              </button>

            </div>
          )}

        </section>


        {/* ===================================================
            PREVIEW
        =================================================== */}

        {selectedFile && previewData.length > 0 && (
          <section className="import-card preview-card">

            <div className="preview-heading">

              <div className="import-card-heading">

                <div className="import-icon">
                  ▤
                </div>

                <div>
                  <h2>Data preview</h2>

                  <p>
                    Showing the first 5 rows from your file.
                  </p>
                </div>

              </div>

              <span className="source-badge">
                {sourceType}
              </span>

            </div>


            <div className="preview-table-wrapper">

              <table className="preview-table">

                <thead>
                  <tr>
                    {Object.keys(previewData[0]).map(
                      (column) => (
                        <th key={column}>
                          {column}
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody>

                  {previewData.map((row, rowIndex) => (
                    <tr key={rowIndex}>

                      {Object.keys(previewData[0]).map(
                        (column) => (
                          <td key={column}>
                            {row[column] ?? ""}
                          </td>
                        )
                      )}

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

          </section>
        )}


        {/* ===================================================
            MESSAGES
        =================================================== */}

        {error && (
          <div className="import-message error-message">
            <span>!</span>
            {error}
          </div>
        )}

        {message && (
          <div className="import-message success-message">
            <span>✓</span>
            {message}
          </div>
        )}


        {/* ===================================================
            ACTIONS
        =================================================== */}

        <div className="import-actions">

          <button
            type="button"
            className="cancel-btn"
            onClick={onBack}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="button"
            className="continue-btn"
            onClick={handleContinue}
            disabled={!selectedFile || loading}
          >
            {loading
              ? "Importing..."
              : "Continue to analysis →"}
          </button>

        </div>

      </main>

    </div>
  );
}

export default ImportFeedback;