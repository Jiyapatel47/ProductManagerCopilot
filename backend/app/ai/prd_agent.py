from app.ai.llm import generate_ai_response
import json


def generate_prd(feature: dict) -> dict:
    """
    Generate a Product Requirement Document
    using the feature request and Groq AI.
    """

    feature_name = feature.get(
        "feature_name",
        "Unknown Feature"
    )

    summary = feature.get(
        "summary",
        ""
    )

    request_count = feature.get(
        "request_count",
        0
    )

    confidence = feature.get(
        "confidence",
        0
    )

    prompt = f"""
You are an experienced Product Manager.

Create a detailed Product Requirement Document (PRD)
for the following customer-requested feature.

Feature Name:
{feature_name}

Feature Summary:
{summary}

Customer Request Count:
{request_count}

AI Confidence:
{confidence}

Return ONLY valid JSON.

Use exactly this structure:

{{
    "feature_name": "",
    "problem_statement": "",
    "objective": "",
    "user_stories": [
        ""
    ],
    "acceptance_criteria": [
        ""
    ],
    "functional_requirements": [
        ""
    ],
    "non_functional_requirements": [
        ""
    ],
    "success_metrics": [
        ""
    ]
}}

Requirements:

1. Write a clear problem statement.
2. Define the main product objective.
3. Generate 3 to 5 user stories.
4. Generate 5 to 8 acceptance criteria.
5. Generate 4 to 6 functional requirements.
6. Generate 2 to 4 non-functional requirements.
7. Generate 3 to 5 measurable success metrics.
8. Keep the requirements practical and product-focused.
9. Do not add markdown.
10. Return only JSON.
"""

    response = generate_ai_response(prompt)

    try:
        return json.loads(response)

    except json.JSONDecodeError:
        # Try to extract JSON if the model
        # accidentally adds extra text.
        start = response.find("{")
        end = response.rfind("}")

        if start != -1 and end != -1:
            json_text = response[start:end + 1]

            try:
                return json.loads(json_text)

            except json.JSONDecodeError:
                pass

        raise ValueError(
            "AI returned an invalid PRD response."
        )