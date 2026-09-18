from pydantic import BaseModel


class MonthlyTrend(BaseModel):
    period: str
    feedback_count: int


class SourceDistribution(BaseModel):
    source: str
    count: int


class TrendResponse(BaseModel):
    monthly_trends: list[MonthlyTrend]
    source_distribution: list[SourceDistribution]
    total_dated_feedback: int
    undated_feedback: int