
import json

from app.ai.llm import generate_ai_response


def generate_user_stories(features: list[dict]) -> list[dict]:
    """Generate user stories from workspace feature requests."""

    if not features:
        return []

    feature_text = "\n".join(
        (
            f"Feature: {feature.get('feature_name', 'Unknown')}\n"
            f"Summary: {feature.get('summary', '')}\n"
            f"Request count: {feature.get('request_count', 0)}\n"
            f"Supporting requests: "
            f"{feature.get('supporting_requests', [])}"
        )
        for feature in features
    )

    prompt = f"""
You are an experienced Agile Product Manager.

Generate user stories from the feature requests below.

FEATURE REQUESTS:
{feature_text}

Return ONLY a valid JSON array using this format:
[
  {{
    "feature_name": "Feature name",
    "title": "Short story title",
    "user_story": "As a user, I want to ... so that ...",
    "acceptance_criteria": [
      "Given ..., when ..., then ...",
      "The system should ..."
    ],
    "priority": "High"
  }}
]

Rules:
1. Generate 1 to 3 relevant stories per feature.
2. Use the format: As a [user], I want [capability],
   so that [benefit].
3. Include 3 to 5 clear, testable acceptance criteria.
4. Priority must be High, Medium, or Low.
5. Do not invent customer statistics or unsupported facts.
6. Return JSON only. Do not include Markdown.
"""

    response = generate_ai_response(prompt).strip()

    # Remove Markdown fences if the model adds them.
    if response.startswith("```"):
        lines = response.splitlines()
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        response = "\n".join(lines).strip()

    try:
        result = json.loads(response)
    except json.JSONDecodeError:
        start = response.find("[")
        end = response.rfind("]")

        if start == -1 or end == -1:
            raise ValueError(
                "AI returned invalid JSON for user stories."
            )

        result = json.loads(response[start:end + 1])

    if not isinstance(result, list):
        raise ValueError(
            "AI response must be a JSON array."
        )

    valid_stories = []

    for story in result:
        if not isinstance(story, dict):
            continue

        user_story = story.get("user_story")
        if not isinstance(user_story, str) or not user_story.strip():
            continue

        criteria = story.get("acceptance_criteria", [])
        if not isinstance(criteria, list):
            criteria = []

        priority = story.get("priority", "Medium")
        if priority not in ("High", "Medium", "Low"):
            priority = "Medium"

        valid_stories.append({
            "feature_name": str(story.get("feature_name", "")),
            "title": str(story.get("title", "")),
            "user_story": user_story.strip(),
            "acceptance_criteria": [
                str(item) for item in criteria
            ],
            "priority": priority,
        })

    return valid_stories
