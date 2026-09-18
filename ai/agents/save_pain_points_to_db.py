import json
from pathlib import Path

from backend.app.database.mongodb import db
from backend.app.models.pain_point import (
    create_pain_point_document,
)


RESULT_FILE = Path(
    "ai/agents/pain_point_results.json"
)


# Get workspace from imported feedback
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


# Check result file
if not RESULT_FILE.exists():
    print(
        f"Pain point result file not found: "
        f"{RESULT_FILE}"
    )
    raise SystemExit


# Load pain point results
with open(
    RESULT_FILE,
    "r",
    encoding="utf-8",
) as file:
    pain_point_results = json.load(file)


if not isinstance(
    pain_point_results,
    list,
):
    print(
        "Pain point results must be a JSON list."
    )
    raise SystemExit


# Prepare MongoDB documents
pain_point_documents = []


for pain_point in pain_point_results:

    if "cluster_id" not in pain_point:
        continue

    document = create_pain_point_document(
        workspace_id=workspace_id,
        cluster_id=pain_point["cluster_id"],
        theme_name=pain_point["theme_name"],
        pain_point=pain_point["pain_point"],
        pain_point_type=pain_point[
            "pain_point_type"
        ],
        summary=pain_point["summary"],
        supporting_feedback=pain_point[
            "supporting_feedback"
        ],
        feedback_count=pain_point[
            "feedback_count"
        ],
        confidence=pain_point["confidence"],
    )

    pain_point_documents.append(document)


if not pain_point_documents:
    print(
        "No valid pain point results found."
    )
    raise SystemExit


# Remove previous results for this workspace
deleted_result = db.pain_points.delete_many(
    {
        "workspace_id": workspace_id
    }
)


print(
    f"Previous pain points removed: "
    f"{deleted_result.deleted_count}"
)


# Insert new results
result = db.pain_points.insert_many(
    pain_point_documents
)


print()
print("=" * 70)
print("PAIN POINTS SAVED TO MONGODB")
print("=" * 70)

print(
    f"Workspace ID: {workspace_id}"
)

print(
    f"Pain points saved: "
    f"{len(result.inserted_ids)}"
)

print(
    "Collection: pain_points"
)

print("=" * 70)