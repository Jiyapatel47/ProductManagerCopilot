from pydantic import BaseModel
from typing import List


class ProductStrategy(BaseModel):
    current_state: str
    key_problems: List[str]
    product_opportunities: List[str]
    strategic_priorities: List[str]
    roadmap_alignment: str
    next_steps: List[str]


class StrategyResponse(BaseModel):
    message: str
    report: ProductStrategy