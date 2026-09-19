from pydantic import BaseModel
from typing import List


class ExecutiveSummary(BaseModel):
    overview: str
    key_themes: List[str]
    major_pain_points: List[str]
    top_feature_opportunities: List[str]
    recommended_focus: str


class ReportResponse(BaseModel):
    message: str
    report: ExecutiveSummary