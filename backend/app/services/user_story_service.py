
from datetime import datetime, timezone

from app.database.mongodb import db
from app.ai.user_story_agent import generate_user_stories


def generate_workspace_user_stories(workspace_id: str) -> dict:
    features = list(
        db.feature_requests.find(
            {"workspace_id": workspace_id},
            {
                "_id": 0,
                "feature_name": 1,
                "summary": 1,
                "request_count": 1,
                "supporting_requests": 1,
            },
        )
    )

    if not features:
        return {
            "message": "No feature requests found for this workspace.",
            "count": 0,
            "user_stories": [],
        }

    stories = generate_user_stories(features)

    if not stories:
        return {
            "message": "No user stories could be generated.",
            "count": 0,
            "user_stories": [],
        }

    now = datetime.now(timezone.utc)

    documents = [
        {
            "workspace_id": workspace_id,
            "feature_name": story.get("feature_name", ""),
            "title": story.get("title", ""),
            "user_story": story["user_story"],
            "acceptance_criteria": story.get("acceptance_criteria", []),
            "priority": story.get("priority", "Medium"),
            "created_at": now,
        }
        for story in stories
    ]

    db.user_stories.delete_many({"workspace_id": workspace_id})
    db.user_stories.insert_many(documents)

    result = get_workspace_user_stories(workspace_id)
    result["message"] = "User stories generated successfully."
    return result


def get_workspace_user_stories(workspace_id: str) -> dict:
    stories = list(
        db.user_stories.find(
            {"workspace_id": workspace_id}
        ).sort("created_at", -1)
    )

    for story in stories:
        story["id"] = str(story.pop("_id"))

    return {
        "count": len(stories),
        "user_stories": stories,
    }
