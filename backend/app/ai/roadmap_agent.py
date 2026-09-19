import json

from app.ai.llm import generate_ai_response


def generate_roadmap(features: list) -> list:
    """
    Generate a product roadmap using Groq AI.
    """

    if not features:
        return []

    feature_text = "\n".join(
        [
            f"- {feature.get('feature_name', 'Unknown')}: "
            f"{feature.get('summary', '')} "
            f"(requests: {feature.get('request_count', 0)}, "
            f"confidence: {feature.get('confidence', 0)})"
            for feature in features
        ]
    )

    prompt = f"""
You are an AI Product Manager.

Create a practical product roadmap from the
following customer-requested features.

FEATURES:
{feature_text}

For each feature return:

- feature_name
- priority
- milestone
- timeline
- reason

Priority must be one of:
High, Medium, Low

Milestone examples:
Milestone 1, Milestone 2, Milestone 3

Timeline examples:
Week 1-2, Week 3-4, Week 5-6, Week 7-8

Return ONLY valid JSON.

Format:
[
  {{
    "feature_name": "Feature name",
    "priority": "High",
    "milestone": "Milestone 1",
    "timeline": "Week 1-2",
    "reason": "Short reason"
  }}
]

Do not invent features.
Use only the provided features.
"""

    response = generate_ai_response(prompt)

    try:
        return json.loads(response)
    except json.JSONDecodeError:
        return []