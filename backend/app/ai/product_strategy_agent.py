import json

from app.ai.llm import generate_ai_response


def generate_product_strategy(
    themes: list,
    pain_points: list,
    features: list,
    roadmap: list,
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

    roadmap_text = "\n".join(
        [
            f"- {item.get('feature_name', 'Unknown')}: "
            f"{item.get('priority', '')}, "
            f"{item.get('milestone', '')}, "
            f"{item.get('timeline', '')}"
            for item in roadmap
        ]
    )

    prompt = f"""
You are an AI Product Manager.

Create a practical product strategy report using ONLY
the product information provided below.

THEMES:
{theme_text}

PAIN POINTS:
{pain_point_text}

FEATURE REQUESTS:
{feature_text}

ROADMAP:
{roadmap_text}

Return ONLY valid JSON.

Use exactly this format:

{{
  "current_state": "Short description of the current product situation",
  "key_problems": [
    "Problem 1",
    "Problem 2"
  ],
  "product_opportunities": [
    "Opportunity 1",
    "Opportunity 2"
  ],
  "strategic_priorities": [
    "Priority 1",
    "Priority 2"
  ],
  "roadmap_alignment": "Short explanation of how the roadmap addresses customer needs",
  "next_steps": [
    "Next step 1",
    "Next step 2"
  ]
}}

Rules:

1. Do not invent data.
2. Use only the provided product information.
3. Keep the report practical and product-focused.
4. Identify important customer problems.
5. Identify opportunities based on feature requests.
6. Use the roadmap when explaining strategic priorities.
7. Keep the language professional and simple.
8. Do not create new features that are not present in the data.
"""

    response = generate_ai_response(prompt)

    try:
        return json.loads(response)

    except json.JSONDecodeError:
        return {
            "current_state": response,
            "key_problems": [],
            "product_opportunities": [],
            "strategic_priorities": [],
            "roadmap_alignment": "",
            "next_steps": [],
        }