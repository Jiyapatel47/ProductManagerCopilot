
from datetime import datetime
from pydantic import BaseModel, Field


class UserStoryItem(BaseModel):
    id: str | None = None
    workspace_id: str | None = None
    feature_name: str = ""
    title: str = ""
    user_story: str
    acceptance_criteria: list[str] = Field(
        default_factory=list
    )
    priority: str = "Medium"
    created_at: datetime | None = None


class UserStoriesResponse(BaseModel):
    message: str | None = None
    count: int = 0
    user_stories: list[UserStoryItem] = Field(
        default_factory=list
    )
