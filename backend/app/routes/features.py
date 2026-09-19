from fastapi import APIRouter, Depends, HTTPException

from app.database.mongodb import db
from app.middleware.auth import get_current_user_id

router = APIRouter(
    prefix="/api/features",
    tags=["Feature Requests"],
)


@router.get("")
def get_feature_requests(
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

    features = list(
        db.feature_requests.find(
            {"workspace_id": workspace_id}
        ).sort("cluster_id", 1)
    )

    response = []

    for feature in features:
        response.append(
            {
                "id": str(feature["_id"]),
                "cluster_id": feature["cluster_id"],
                "feature_name": feature["feature_name"],
                "summary": feature["summary"],
                "request_count": feature["request_count"],
                "supporting_requests": feature[
                    "supporting_requests"
                ],
                "confidence": feature["confidence"],
                "request_dates": feature.get(
                    "request_dates",
                    []
                ),
            }
        )

    return {
        "features": response,
        "total": len(response),
    }