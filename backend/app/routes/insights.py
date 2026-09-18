from fastapi import APIRouter, Depends, HTTPException

from backend.app.database.mongodb import db
from backend.app.middleware.auth import get_current_user_id

from ai.trends.trend_analyzer import (
    calculate_feedback_trends,
)

from ai.trends.feature_request_trend_analyzer import (
    calculate_feature_request_trends,
)


router = APIRouter(
    prefix="/api/insights",
    tags=["Product Insights"],
)


@router.get("/themes")
def get_themes(
    user_id: str = Depends(get_current_user_id),
):
    workspace = db.workspaces.find_one(
        {"owner_id": user_id}
    )

    if not workspace:
        raise HTTPException(
            status_code=404,
            detail="No workspace found for this user",
        )

    workspace_id = str(workspace["_id"])

    themes = list(
        db.themes.find(
            {"workspace_id": workspace_id}
        ).sort("cluster_id", 1)
    )

    response = []

    for theme in themes:
        response.append(
            {
                "id": str(theme["_id"]),
                "cluster_id": theme["cluster_id"],
                "theme_name": theme["theme_name"],
                "theme_type": theme["theme_type"],
                "summary": theme["summary"],
                "feedback_count": theme["feedback_count"],
                "supporting_feedback": theme[
                    "supporting_feedback"
                ],
                "outliers": theme["outliers"],
                "confidence": theme["confidence"],
            }
        )

    return {
        "themes": response,
        "total": len(response),
    }


@router.get("/pain-points")
def get_pain_points(
    user_id: str = Depends(get_current_user_id),
):
    workspace = db.workspaces.find_one(
        {"owner_id": user_id}
    )

    if not workspace:
        raise HTTPException(
            status_code=404,
            detail="No workspace found for this user",
        )

    workspace_id = str(workspace["_id"])

    pain_points = list(
        db.pain_points.find(
            {"workspace_id": workspace_id}
        ).sort("cluster_id", 1)
    )

    response = []

    for pain_point in pain_points:
        response.append(
            {
                "id": str(pain_point["_id"]),
                "cluster_id": pain_point["cluster_id"],
                "theme_name": pain_point["theme_name"],
                "pain_point": pain_point["pain_point"],
                "pain_point_type": pain_point[
                    "pain_point_type"
                ],
                "summary": pain_point["summary"],
                "supporting_feedback": pain_point[
                    "supporting_feedback"
                ],
                "feedback_count": pain_point[
                    "feedback_count"
                ],
                "confidence": pain_point["confidence"],
            }
        )

    return {
        "pain_points": response,
        "total": len(response),
    }


@router.get("/trends")
def get_feedback_trends(
    user_id: str = Depends(get_current_user_id),
):
    workspace = db.workspaces.find_one(
        {"owner_id": user_id}
    )

    if not workspace:
        raise HTTPException(
            status_code=404,
            detail="No workspace found for this user",
        )

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
    workspace = db.workspaces.find_one(
        {"owner_id": user_id}
    )

    if not workspace:
        raise HTTPException(
            status_code=404,
            detail="No workspace found for this user",
        )

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