from pydantic import BaseModel
from typing import List


class RoadmapRequest(BaseModel):
    feature_names: List[str]


class RoadmapItem(BaseModel):
    feature_name: str
    priority: str
    milestone: str
    timeline: str
    reason: str


class RoadmapResponse(BaseModel):
    message: str
    roadmap: List[RoadmapItem]