from fastapi import APIRouter, Depends

from app.database.mongodb import db
from app.middleware.auth import get_current_user_id

from app.services.trend_service import (
    calculate_feedback_trends,
    calculate_feature_request_trends,
)

router = APIRouter(
    prefix="/api/insights",
    tags=["Insights"],
)


@router.get("/trends")
def get_feedback_trends(
    user_id: str = Depends(get_current_user_id),
):
    """
    Get feedback source trends for the current user's workspace.
    """

    workspace = db.workspaces.find_one(
        {"owner_id": user_id}
    )

    if not workspace:
        return {
            "message": "No workspace found.",
            "total_feedback": 0,
            "trends": [],
        }

    workspace_id = str(workspace["_id"])

    feedback_documents = list(
        db.feedback.find(
            {"workspace_id": workspace_id}
        )
    )

    result = calculate_feedback_trends(
        feedback_documents
    )

    return result


@router.get("/feature-trends")
def get_feature_request_trends(
    user_id: str = Depends(get_current_user_id),
):
    """
    Get feature request trends for the current user's workspace.
    """

    workspace = db.workspaces.find_one(
        {"owner_id": user_id}
    )

    if not workspace:
        return {
            "message": "No workspace found.",
            "total_feature_requests": 0,
            "trends": [],
        }

    workspace_id = str(workspace["_id"])

    feature_documents = list(
        db.feature_requests.find(
            {"workspace_id": workspace_id}
        )
    )

    result = calculate_feature_request_trends(
        feature_documents
    )

    return result