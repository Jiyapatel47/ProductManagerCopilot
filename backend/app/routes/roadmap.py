from fastapi import APIRouter, Depends

from app.database.mongodb import db
from app.middleware.auth import get_current_user_id
from app.services.roadmap_service import (
    create_roadmap,
    get_latest_roadmap,
)


router = APIRouter(
    prefix="/api/roadmap",
    tags=["Roadmap"],
)


@router.post("/generate")
def generate_product_roadmap(
    user_id: str = Depends(get_current_user_id),
):
    """
    Generate a product roadmap from feature requests.
    """

    workspace = db.workspaces.find_one(
        {"owner_id": user_id}
    )

    if not workspace:
        return {
            "message": "No workspace found.",
            "roadmap": [],
        }

    workspace_id = str(
        workspace["_id"]
    )

    return create_roadmap(
        workspace_id
    )


@router.get("")
def get_product_roadmap(
    user_id: str = Depends(get_current_user_id),
):
    """
    Get the latest product roadmap.
    """

    workspace = db.workspaces.find_one(
        {"owner_id": user_id}
    )

    if not workspace:
        return {
            "message": "No workspace found.",
            "roadmap": [],
        }

    workspace_id = str(
        workspace["_id"]
    )

    return get_latest_roadmap(
        workspace_id
    )