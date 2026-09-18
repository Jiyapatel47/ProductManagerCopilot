from fastapi import APIRouter, Depends

from backend.app.database.mongodb import db
from backend.app.middleware.auth import get_current_user_id
from backend.app.models.workspace import create_workspace_document
from backend.app.schemas.workspace import WorkspaceCreate


router = APIRouter(
    prefix="/api/workspace",
    tags=["Workspace"],
)


@router.post("")
def create_workspace(
    workspace: WorkspaceCreate,
    user_id: str = Depends(get_current_user_id),
):
    workspace_document = create_workspace_document(
        name=workspace.name,
        owner_id=user_id,
    )

    result = db.workspaces.insert_one(workspace_document)

    return {
        "message": "Workspace created successfully",
        "workspace_id": str(result.inserted_id),
    }

@router.get("")
def get_workspace(
    user_id: str = Depends(get_current_user_id),
):
    workspace = db.workspaces.find_one(
        {"owner_id": user_id}
    )

    if not workspace:
        return {
            "message": "Workspace not found"
        }

    return {
        "id": str(workspace["_id"]),
        "name": workspace["name"],
        "owner_id": workspace["owner_id"],
    }