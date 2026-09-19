
import json

from app.ai.llm import generate_ai_response


def calculate_confidence(
    theme: dict,
    total_feedback: int,
) -> float:
    """
    Calculate confidence based on how much feedback
    supports the identified theme.

    This avoids relying on the LLM's arbitrary confidence score.
    """

    feedback_count = int(
        theme.get("feedback_count", 0) or 0
    )

    supporting_feedback = theme.get(
        "supporting_feedback",
        [],
    )

    if not isinstance(supporting_feedback, list):
        supporting_feedback = []

    # Prefer the actual supporting feedback count
    evidence_count = max(
        feedback_count,
        len(supporting_feedback),
    )

    if total_feedback <= 0 or evidence_count <= 0:
        return 0.0

    coverage = evidence_count / total_feedback

    # Keep confidence within a reasonable range.
    confidence = min(0.95, 0.50 + coverage * 0.50)

    return round(confidence, 2)


def extract_themes(
    feedback_list: list[str],
) -> list[dict]:
    """
    Extract common product themes from customer feedback.
    """

    if not feedback_list:
        return []

    feedback_text = "\n".join(
        f"{index + 1}. {feedback}"
        for index, feedback in enumerate(feedback_list)
    )

    prompt = f"""
You are an AI Product Manager.

Analyze the following customer feedback and identify the main
product themes.

CUSTOMER FEEDBACK:
{feedback_text}

For each important theme, return:

- cluster_id: unique integer starting from 1
- theme_name: short name of the theme
- theme_type: category such as usability, performance, payment,
  authentication, delivery, reliability, etc.
- summary: short explanation
- feedback_count: number of feedback items related to this theme
- supporting_feedback: exact feedback sentences supporting the theme
- outliers: feedback sentences that do not strongly belong to the theme

IMPORTANT:
Do NOT generate a confidence score.
The application will calculate confidence separately
from the supporting evidence.

Return ONLY valid JSON.

Expected format:

[
  {{
    "cluster_id": 1,
    "theme_name": "Payment Issues",
    "theme_type": "payment",
    "summary": "Customers are experiencing payment failures.",
    "feedback_count": 2,
    "supporting_feedback": [
      "Payment failed multiple times"
    ],
    "outliers": []
  }}
]
"""

    response = generate_ai_response(prompt)

    try:
        parsed_response = json.loads(response)

        if isinstance(parsed_response, list):

            total_feedback = len(feedback_list)

            for theme in parsed_response:

                if not isinstance(theme, dict):
                    continue

                theme["confidence"] = calculate_confidence(
                    theme,
                    total_feedback,
                )

            return parsed_response

        return []

    except json.JSONDecodeError:

        # Sometimes the model may return JSON inside
        # markdown code fences.

        cleaned_response = response.strip()

        if cleaned_response.startswith("```"):
            cleaned_response = (
                cleaned_response
                .replace("```json", "")
                .replace("```", "")
                .strip()
            )

            try:
                parsed_response = json.loads(
                    cleaned_response
                )

                if isinstance(parsed_response, list):

                    total_feedback = len(
                        feedback_list
                    )

                    for theme in parsed_response:

                        if not isinstance(theme, dict):
                            continue

                        theme["confidence"] = (
                            calculate_confidence(
                                theme,
                                total_feedback,
                            )
                        )

                    return parsed_response

            except json.JSONDecodeError:
                pass

        return []

