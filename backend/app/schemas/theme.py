from pydantic import BaseModel


class ThemeResponse(BaseModel):
    id: str
    cluster_id: int
    theme_name: str
    theme_type: str
    summary: str
    feedback_count: int
    supporting_feedback: list[str]
    outliers: list[str]
    confidence: float