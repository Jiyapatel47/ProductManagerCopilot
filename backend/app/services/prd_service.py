from app.database.mongodb import db
from app.ai.prd_agent import generate_prd


def generate_workspace_prd(workspace_id: str) -> dict:
    """
    Generate PRD for the highest-priority feature
    in a workspace.
    """

    features = list(
        db.feature_requests.find(
            {"workspace_id": workspace_id}
        )
    )

    if not features:
        return {
            "message": "No feature requests found for this workspace.",
            "prd": None,
        }

    # Select the feature with the highest request count.
    # If request counts are equal, use AI confidence.
    features.sort(
        key=lambda feature: (
            int(feature.get("request_count", 0)),
            float(feature.get("confidence", 0)),
        ),
        reverse=True,
    )

    selected_feature = features[0]

    prd = generate_prd(selected_feature)

    return {
        "message": "PRD generated successfully.",
        "feature": {
            "id": str(
                selected_feature.get(
                    "_id",
                    ""
                )
            ),
            "feature_name": selected_feature.get(
                "feature_name",
                "Unknown Feature",
            ),
            "summary": selected_feature.get(
                "summary",
                "",
            ),
            "request_count": selected_feature.get(
                "request_count",
                0,
            ),
            "confidence": selected_feature.get(
                "confidence",
                0,
            ),
        },
        "prd": prd,
    }