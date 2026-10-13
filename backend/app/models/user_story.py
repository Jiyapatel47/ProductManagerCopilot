
from datetime import datetime


def user_story_document(
    workspace_id: str,
    story: dict,
) -> dict:
    return {
        "workspace_id": workspace_id,
        "feature_name": story.get("feature_name", ""),
        "title": story.get("title", ""),
        "user_story": story.get("user_story", ""),
        "acceptance_criteria": story.get(
            "acceptance_criteria", []
        ),
        "priority": story.get("priority", "Medium"),
        "created_at": datetime.utcnow(),
    }
