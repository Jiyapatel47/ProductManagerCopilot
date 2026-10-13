
from fastapi import APIRouter, Depends

from app.database.mongodb import db
from app.middleware.auth import get_current_user_id
from app.schemas.user_story import UserStoriesResponse
from app.services.user_story_service import (
    generate_workspace_user_stories,
    get_workspace_user_stories,
)

router = APIRouter(
    prefix="/api/user-stories",
    tags=["User Stories"],
)


@router.post(
    "/generate",
    response_model=UserStoriesResponse,
)
def generate_user_stories_for_workspace(
    user_id: str = Depends(get_current_user_id),
):
    """Generate user stories for the current user's workspace."""

    workspace = db.workspaces.find_one(
        {"owner_id": user_id}
    )

    if not workspace:
        return {
            "message": "No workspace found.",
            "count": 0,
            "user_stories": [],
        }

    workspace_id = str(workspace["_id"])

    return generate_workspace_user_stories(workspace_id)


@router.get(
    "/",
    response_model=UserStoriesResponse,
)
def get_user_stories_for_workspace(
    user_id: str = Depends(get_current_user_id),
):
    """Retrieve saved stories for the current user's workspace."""

    workspace = db.workspaces.find_one(
        {"owner_id": user_id}
    )

    if not workspace:
        return {
            "message": "No workspace found.",
            "count": 0,
            "user_stories": [],
        }

    workspace_id = str(workspace["_id"])

    result = get_workspace_user_stories(workspace_id)
    result["message"] = "User stories retrieved successfully."
    return result
