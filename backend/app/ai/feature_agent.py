import json

from app.ai.llm import generate_ai_response


def extract_feature_requests(feedback_list: list[str]) -> list[dict]:
    """
    Extract customer feature requests from feedback.
    """

    if not feedback_list:
        return []

    feedback_text = "\n".join(
        f"{index + 1}. {feedback}"
        for index, feedback in enumerate(feedback_list)
    )

    prompt = f"""
You are an AI Product Manager.

Analyze the following customer feedback and identify explicit or strongly
implied feature requests.

CUSTOMER FEEDBACK:
{feedback_text}

Important:
- Only identify genuine feature requests.
- Do not treat a complaint itself as a feature request unless the feedback
  clearly implies a product improvement or requested capability.
- If there are no feature requests, return an empty JSON array.

For each feature request, return:

- cluster_id: unique integer starting from 1
- feature_name: short feature name
- summary: short explanation of the requested feature
- request_count: number of feedback items requesting this feature
- supporting_requests: exact feedback sentences supporting the feature
- confidence: number between 0 and 1
- request_dates: empty list if no dates are available

Return ONLY valid JSON.

Expected format:

[
  {{
    "cluster_id": 1,
    "feature_name": "Faster Delivery Tracking",
    "summary": "Customers want improved delivery tracking speed and visibility.",
    "request_count": 1,
    "supporting_requests": [
      "I want faster delivery tracking"
    ],
    "confidence": 0.90,
    "request_dates": []
  }}
]
"""

    response = generate_ai_response(prompt)

    try:
        parsed_response = json.loads(response)

        if isinstance(parsed_response, list):
            return parsed_response

        return []

    except json.JSONDecodeError:
        cleaned_response = response.strip()

        if cleaned_response.startswith("```"):
            cleaned_response = (
                cleaned_response
                .replace("```json", "")
                .replace("```", "")
                .strip()
            )

            try:
                parsed_response = json.loads(cleaned_response)

                if isinstance(parsed_response, list):
                    return parsed_response

            except json.JSONDecodeError:
                pass

        return []