import json

from app.ai.llm import generate_ai_response


def generate_executive_summary(
    themes: list,
    pain_points: list,
    features: list,
) -> dict:

    theme_text = "\n".join(
        [
            f"- {item.get('theme_name', 'Unknown')}: "
            f"{item.get('summary', '')}"
            for item in themes
        ]
    )

    pain_point_text = "\n".join(
        [
            f"- {item.get('pain_point', 'Unknown')}: "
            f"{item.get('summary', '')}"
            for item in pain_points
        ]
    )

    feature_text = "\n".join(
        [
            f"- {item.get('feature_name', 'Unknown')}: "
            f"{item.get('summary', '')} "
            f"(requests: {item.get('request_count', 0)}, "
            f"confidence: {item.get('confidence', 0)})"
            for item in features
        ]
    )

    prompt = f"""
You are an AI Product Manager.

Create an executive summary using ONLY
the product data provided below.

THEMES:
{theme_text}

PAIN POINTS:
{pain_point_text}

FEATURE REQUESTS:
{feature_text}

Return ONLY valid JSON.

Use exactly this format:

{{
  "overview": "Short executive overview",
  "key_themes": [
    "Theme 1",
    "Theme 2"
  ],
  "major_pain_points": [
    "Pain point 1",
    "Pain point 2"
  ],
  "top_feature_opportunities": [
    "Feature 1",
    "Feature 2"
  ],
  "recommended_focus": "Short product focus recommendation"
}}

Rules:

1. Do not invent data.
2. Use only the provided information.
3. Keep the overview concise.
4. Mention important recurring themes.
5. Mention major customer pain points.
6. Mention the most important feature opportunities.
7. Keep the language professional and simple.
"""

    response = generate_ai_response(prompt)

    try:
        return json.loads(response)
    except json.JSONDecodeError:
        return {
            "overview": response,
            "key_themes": [],
            "major_pain_points": [],
            "top_feature_opportunities": [],
            "recommended_focus": "",
        }