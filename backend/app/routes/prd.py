from fastapi import APIRouter, Depends

from app.database.mongodb import db
from app.middleware.auth import get_current_user_id
from app.services.prd_service import generate_workspace_prd

router = APIRouter(
    prefix="/api/prd",
    tags=["PRD Generator"],
)


@router.post("/generate")
def generate_prd_for_workspace(
    user_id: str = Depends(get_current_user_id),
):
    """
    Generate a PRD for the current user's workspace.
    """

    workspace = db.workspaces.find_one(
        {"owner_id": user_id}
    )

    if not workspace:
        return {
            "message": "No workspace found.",
            "feature": None,
            "prd": None,
        }

    workspace_id = str(
        workspace["_id"]
    )

    return generate_workspace_prd(
        workspace_id
    )