from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.database.mongodb import db
from app.middleware.auth import get_current_user_id
from app.services.assistant_service import (
    chat_with_assistant,
)


router = APIRouter(
    prefix="/api/assistant",
    tags=["AI Assistant"],
)


class AssistantRequest(BaseModel):
    question: str


@router.post("/chat")
def assistant_chat(
    request: AssistantRequest,
    user_id: str = Depends(get_current_user_id),
):
    """
    Ask the AI Product Assistant a question.
    """

    workspace = db.workspaces.find_one(
        {"owner_id": user_id}
    )

    if not workspace:
        return {
            "message": "No workspace found.",
            "question": request.question,
            "answer": "",
        }

    workspace_id = str(
        workspace["_id"]
    )

    return chat_with_assistant(
        workspace_id=workspace_id,
        question=request.question,
    )