import json
from pathlib import Path

from backend.app.database.mongodb import db
from backend.app.models.theme import create_theme_document


RESULT_FILE = Path(
    "ai/agents/theme_extraction_results.json"
)


# Get the workspace from the imported feedback records.
# This ensures themes are saved to the same workspace
# that owns the feedback data.

feedback_workspace_ids = db.feedback.distinct(
    "workspace_id"
)

if not feedback_workspace_ids:
    print("No workspace found in feedback records.")
    raise SystemExit

if len(feedback_workspace_ids) > 1:
    print(
        "Multiple workspaces found in feedback records."
    )
    print(
        "Please process one workspace at a time."
    )
    raise SystemExit

workspace_id = feedback_workspace_ids[0]

print(
    f"Using workspace from feedback: {workspace_id}"
)


# Load theme extraction results
if not RESULT_FILE.exists():
    print(
        f"Theme result file not found: {RESULT_FILE}"
    )
    raise SystemExit


with open(
    RESULT_FILE,
    "r",
    encoding="utf-8",
) as file:
    theme_results = json.load(file)


if not isinstance(theme_results, list):
    print("Theme results must be a JSON list.")
    raise SystemExit


theme_documents = []


for theme in theme_results:

    # Skip malformed batch results
    if "cluster_id" not in theme:
        continue

    document = create_theme_document(
        workspace_id=workspace_id,
        cluster_id=theme["cluster_id"],
        theme_name=theme["theme_name"],
        theme_type=theme["theme_type"],
        summary=theme["summary"],
        feedback_count=theme["feedback_count"],
        supporting_feedback=theme["supporting_feedback"],
        outliers=theme["outliers"],
        confidence=theme["confidence"],
    )

    theme_documents.append(document)


if not theme_documents:
    print("No valid theme results found.")
    raise SystemExit


# Remove previously generated themes for this workspace
# before inserting the latest results.

deleted_result = db.themes.delete_many(
    {
        "workspace_id": workspace_id
    }
)

print(
    f"Previous themes removed: "
    f"{deleted_result.deleted_count}"
)


# Insert fresh theme results
result = db.themes.insert_many(
    theme_documents
)


print("=" * 70)
print("THEMES SAVED TO MONGODB")
print("=" * 70)

print(
    f"Workspace ID: {workspace_id}"
)

print(
    f"Themes saved: {len(result.inserted_ids)}"
)

print(
    "Collection: themes"
)

print("=" * 70)