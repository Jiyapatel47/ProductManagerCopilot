from app.database.mongodb import db
from app.ai.roadmap_agent import generate_roadmap
from app.models.roadmap import roadmap_document


def create_roadmap(workspace_id: str) -> dict:
    """
    Generate roadmap from existing feature requests.
    """

    features = list(
        db.feature_requests.find(
            {"workspace_id": workspace_id}
        )
    )

    if not features:
        return {
            "message": "No feature requests found.",
            "roadmap": [],
        }

    roadmap = generate_roadmap(features)

    if not roadmap:
        return {
            "message": "Could not generate roadmap.",
            "roadmap": [],
        }

    document = roadmap_document(
        workspace_id=workspace_id,
        roadmap=roadmap,
    )

    db.roadmaps.insert_one(document)

    return {
        "message": "Roadmap generated successfully.",
        "roadmap": roadmap,
    }


def get_latest_roadmap(workspace_id: str) -> dict:
    """
    Get the latest roadmap for a workspace.
    """

    roadmap = db.roadmaps.find_one(
        {"workspace_id": workspace_id},
        sort=[("created_at", -1)],
    )

    if not roadmap:
        return {
            "message": "No roadmap found.",
            "roadmap": [],
        }

    return {
        "message": "Roadmap retrieved successfully.",
        "roadmap": roadmap.get(
            "roadmap",
            [],
        ),
    }