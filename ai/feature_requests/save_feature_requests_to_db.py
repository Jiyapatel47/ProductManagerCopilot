import json
from pathlib import Path

from backend.app.database.mongodb import db
from backend.app.models.feature_request import (
    create_feature_request_document,
)


RESULT_FILE = Path(
    "ai/feature_requests/feature_request_clusters.json"
)


def main():
    print("=" * 70)
    print("SAVING FEATURE REQUESTS TO MONGODB")
    print("=" * 70)

    # ---------------------------------------------------------
    # Step 1: Find the workspace
    # ---------------------------------------------------------

    feedback_workspace_ids = db.feedback.distinct(
        "workspace_id"
    )

    if not feedback_workspace_ids:
        print("No workspace found in feedback records.")
        return

    if len(feedback_workspace_ids) > 1:
        print(
            "Multiple workspaces found in feedback records."
        )
        print(
            "Please process one workspace at a time."
        )
        return

    workspace_id = feedback_workspace_ids[0]

    print(
        f"Using workspace: {workspace_id}"
    )

    # ---------------------------------------------------------
    # Step 2: Check result file
    # ---------------------------------------------------------

    if not RESULT_FILE.exists():
        print(
            f"Feature request result file not found: "
            f"{RESULT_FILE}"
        )
        return

    # ---------------------------------------------------------
    # Step 3: Load aggregated feature requests
    # ---------------------------------------------------------

    with open(
        RESULT_FILE,
        "r",
        encoding="utf-8",
    ) as file:

        feature_results = json.load(file)

    if not isinstance(feature_results, list):
        print(
            "Feature request results must be a JSON list."
        )
        return

    if not feature_results:
        print(
            "No aggregated feature requests found."
        )
        return

    print(
        f"Aggregated features found: "
        f"{len(feature_results)}"
    )

    # ---------------------------------------------------------
    # Step 4: Load feedback records for dates
    # ---------------------------------------------------------

    feedback_documents = list(
        db.feedback.find(
            {
                "workspace_id": workspace_id
            }
        )
    )

    feedback_lookup = {}

    for feedback in feedback_documents:

        feedback_id = str(
            feedback.get("_id")
        )

        feedback_lookup[feedback_id] = {
            "date": feedback.get("date"),
            "content": feedback.get(
                "content",
                feedback.get(
                    "cleaned_content",
                    ""
                )
            ),
        }

    print(
        f"Feedback records available for date mapping: "
        f"{len(feedback_lookup)}"
    )

    # ---------------------------------------------------------
    # Step 5: Create MongoDB documents
    # ---------------------------------------------------------

    feature_documents = []

    for feature in feature_results:

        if "cluster_id" not in feature:
            continue

        if not feature.get("feature_name"):
            continue

        supporting_requests = feature.get(
            "supporting_requests",
            []
        )

        # -----------------------------------------------------
        # Build request_dates
        # -----------------------------------------------------

        request_dates = []

        for request in supporting_requests:

            # Supporting requests in the current result file
            # are strings, so try to match them against the
            # original feedback records.
            matched = False

            for feedback_id, feedback_data in feedback_lookup.items():

                feedback_content = str(
                    feedback_data.get(
                        "content",
                        ""
                    )
                ).strip()

                request_text = str(
                    request
                ).strip()

                if (
                    feedback_content == request_text
                    or request_text.lower()
                    in feedback_content.lower()
                    or feedback_content.lower()
                    in request_text.lower()
                ):
                    request_dates.append(
                        {
                            "feedback_id": feedback_id,
                            "date": feedback_data.get(
                                "date"
                            ),
                            "feature_request": request_text,
                        }
                    )

                    matched = True
                    break

            # If the request could not be matched to a
            # feedback record, preserve it with no date.
            if not matched:
                request_dates.append(
                    {
                        "feedback_id": "",
                        "date": None,
                        "feature_request": str(
                            request
                        ).strip(),
                    }
                )

        # -----------------------------------------------------
        # Create document
        # -----------------------------------------------------

        document = create_feature_request_document(
            workspace_id=workspace_id,
            cluster_id=feature["cluster_id"],
            feature_name=feature["feature_name"],
            summary=feature.get(
                "summary",
                ""
            ),
            request_count=feature.get(
                "request_count",
                len(supporting_requests)
            ),
            supporting_requests=supporting_requests,
            confidence=feature.get(
                "confidence",
                0
            ),
            request_dates=request_dates,
        )

        feature_documents.append(document)

    if not feature_documents:
        print(
            "No valid feature request documents found."
        )
        return

    # ---------------------------------------------------------
    # Step 6: Remove previous results
    # ---------------------------------------------------------

    deleted_result = db.feature_requests.delete_many(
        {
            "workspace_id": workspace_id
        }
    )

    print(
        f"Previous feature requests removed: "
        f"{deleted_result.deleted_count}"
    )

    # ---------------------------------------------------------
    # Step 7: Save to MongoDB
    # ---------------------------------------------------------

    result = db.feature_requests.insert_many(
        feature_documents
    )

    # ---------------------------------------------------------
    # Step 8: Display result
    # ---------------------------------------------------------

    print()
    print("=" * 70)
    print("FEATURE REQUESTS SAVED TO MONGODB")
    print("=" * 70)

    print(
        f"Workspace ID: {workspace_id}"
    )

    print(
        f"Feature groups saved: "
        f"{len(result.inserted_ids)}"
    )

    total_dated_requests = sum(
        1
        for document in feature_documents
        for request in document.get(
            "request_dates",
            []
        )
        if request.get("date")
    )

    print(
        f"Feature requests with dates: "
        f"{total_dated_requests}"
    )

    print(
        "Collection: feature_requests"
    )

    print("=" * 70)


if __name__ == "__main__":
    main()