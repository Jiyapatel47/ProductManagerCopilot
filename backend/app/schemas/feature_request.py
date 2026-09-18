from pydantic import BaseModel


class FeatureRequestDate(BaseModel):
    feedback_id: str
    date: str | None = None
    feature_request: str


class FeatureRequestResponse(BaseModel):
    id: str
    cluster_id: int
    feature_name: str
    summary: str
    request_count: int
    supporting_requests: list[str]
    confidence: float
    request_dates: list[FeatureRequestDate]