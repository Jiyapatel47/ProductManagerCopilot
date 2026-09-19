from pydantic import BaseModel
from typing import List, Optional


class PRDRequest(BaseModel):
    workspace_id: Optional[str] = None


class PRDResponse(BaseModel):
    message: str
    feature: Optional[dict] = None
    prd: Optional[dict] = None