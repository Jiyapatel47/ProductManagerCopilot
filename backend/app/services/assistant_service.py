from app.database.mongodb import db
from app.ai.assistant import ask_product_assistant


def get_product_context(workspace_id: str) -> str:
    """
    Collect relevant product information from MongoDB.
    """

    feedback = list(
        db.feedback.find(
            {"workspace_id": workspace_id}
        ).limit(20)
    )

    themes = list(
        db.themes.find(
            {"workspace_id": workspace_id}
        ).limit(10)
    )

    pain_points = list(
        db.pain_points.find(
            {"workspace_id": workspace_id}
        ).limit(10)
    )

    features = list(
        db.feature_requests.find(
            {"workspace_id": workspace_id}
        ).limit(10)
    )

    context_parts = []

    if feedback:
        context_parts.append("CUSTOMER FEEDBACK:")

        for item in feedback:
            content = item.get("content")

            if content:
                context_parts.append(
                    f"- {content}"
                )

    if themes:
        context_parts.append("\nTHEMES:")

        for item in themes:
            context_parts.append(
                f"- {item.get('theme_name', 'Unknown')}: "
                f"{item.get('summary', '')}"
            )

    if pain_points:
        context_parts.append("\nPAIN POINTS:")

        for item in pain_points:
            context_parts.append(
                f"- {item.get('pain_point', 'Unknown')}: "
                f"{item.get('summary', '')}"
            )

    if features:
        context_parts.append("\nFEATURE REQUESTS:")

        for item in features:
            context_parts.append(
                f"- {item.get('feature_name', 'Unknown')}: "
                f"{item.get('summary', '')} "
                f"(requests: {item.get('request_count', 0)}, "
                f"confidence: {item.get('confidence', 0)})"
            )

    if not context_parts:
        return "No product data is available yet."

    return "\n".join(context_parts)


def chat_with_assistant(
    workspace_id: str,
    question: str,
) -> dict:
    """
    Answer a product-related question using
    workspace data and Groq AI.
    """

    question = question.strip()

    if not question:
        return {
            "message": "Question cannot be empty.",
            "answer": "",
        }

    context = get_product_context(
        workspace_id
    )

    answer = ask_product_assistant(
        question=question,
        context=context,
    )

    return {
        "message": "Assistant response generated successfully.",
        "question": question,
        "answer": answer,
    }