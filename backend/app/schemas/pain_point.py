from pydantic import BaseModel


class PainPointResponse(BaseModel):
    id: str
    cluster_id: int
    theme_name: str
    pain_point: str
    pain_point_type: str
    summary: str
    supporting_feedback: list[str]
    feedback_count: int
    confidence: float