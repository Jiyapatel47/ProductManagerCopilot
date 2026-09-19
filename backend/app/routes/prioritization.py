from fastapi import APIRouter, Depends

from app.database.mongodb import db
from app.middleware.auth import get_current_user_id
from app.services.prioritization_service import prioritize_features


router = APIRouter(
    prefix="/api/prioritization",
    tags=["Prioritization"],
)


@router.get("")
def get_prioritized_features(
    user_id: str = Depends(get_current_user_id),
):
    workspace = db.workspaces.find_one(
        {"owner_id": user_id}
    )

    if not workspace:
        return {
            "message": "No workspace found",
            "features": [],
            "total": 0,
        }

    workspace_id = str(workspace["_id"])

    features = list(
        db.feature_requests.find(
            {"workspace_id": workspace_id}
        )
    )

    prioritized_features = prioritize_features(
        features
    )

    return {
        "message": "Feature prioritization completed successfully",
        "features": prioritized_features,
        "total": len(prioritized_features),
    }