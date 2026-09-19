import json

from app.ai.llm import generate_ai_response


def extract_pain_points(feedback_list: list[str]) -> list[dict]:
    if not feedback_list:
        return []

    feedback_text = "\n".join(
        f"{index + 1}. {feedback}"
        for index, feedback in enumerate(feedback_list)
    )

    prompt = f"""
You are an AI Product Manager analyzing customer feedback.

Identify the major customer pain points from the feedback below.

Customer feedback:
{feedback_text}

For each meaningful pain point, return:

- cluster_id
- theme_name
- pain_point
- pain_point_type
- summary
- supporting_feedback
- feedback_count
- confidence

IMPORTANT RULES FOR CONFIDENCE:

1. Confidence must be a decimal between 0.0 and 1.0.
2. Do NOT give every pain point the same confidence.
3. Use the evidence in the feedback to determine confidence.
4. Strongly repeated and clearly expressed problems should have higher confidence.
5. Problems supported by fewer or weaker examples should have lower confidence.
6. Do not automatically use 0.99 or 1.0.
7. Confidence should represent how strongly the feedback supports that pain point.

Confidence guide:

- 0.90 - 1.00 = very strong and repeated evidence
- 0.80 - 0.89 = strong evidence
- 0.70 - 0.79 = moderate evidence
- 0.60 - 0.69 = limited evidence
- below 0.60 = weak evidence

Return ONLY valid JSON.

Expected format:

[
  {{
    "cluster_id": 1,
    "theme_name": "Checkout Performance",
    "pain_point": "Checkout process is slow",
    "pain_point_type": "performance",
    "summary": "Users experience a sluggish checkout experience.",
    "supporting_feedback": [
      "The app is very slow during checkout"
    ],
    "feedback_count": 1,
    "confidence": 0.85
  }}
]
"""

    try:
        response = generate_ai_response(prompt)

        response = response.strip()

        if response.startswith("```"):
            response = response.replace("```json", "")
            response = response.replace("```", "")
            response = response.strip()

        pain_points = json.loads(response)

        if not isinstance(pain_points, list):
            return []

        cleaned_pain_points = []

        for index, item in enumerate(pain_points):

            if not isinstance(item, dict):
                continue

            confidence = item.get("confidence", 0.5)

            try:
                confidence = float(confidence)
            except (TypeError, ValueError):
                confidence = 0.5

            confidence = max(0.0, min(1.0, confidence))

            cleaned_pain_points.append(
                {
                    "cluster_id": int(
                        item.get("cluster_id", index + 1)
                    ),
                    "theme_name": item.get(
                        "theme_name",
                        "General",
                    ),
                    "pain_point": item.get(
                        "pain_point",
                        "Unknown Pain Point",
                    ),
                    "pain_point_type": item.get(
                        "pain_point_type",
                        "general",
                    ),
                    "summary": item.get(
                        "summary",
                        "",
                    ),
                    "supporting_feedback": item.get(
                        "supporting_feedback",
                        [],
                    ),
                    "feedback_count": int(
                        item.get(
                            "feedback_count",
                            0,
                        )
                    ),
                    "confidence": confidence,
                }
            )

        return cleaned_pain_points

    except Exception as error:
        print(
            "Pain point extraction error:",
            error,
        )
        return []