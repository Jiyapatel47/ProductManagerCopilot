import re


CATEGORIES = {
    "Bug": [
        "crash",
        "crashes",
        "crashing",
        "error",
        "bug",
        "fails",
        "failure",
        "broken",
        "not working",
        "doesn't work",
        "does not work",
        "unable to",
        "cannot",
    ],
    "Feature Request": [
        "add",
        "please add",
        "would like",
        "want",
        "need",
        "should have",
        "introduce",
        "support",
        "feature",
        "would be useful",
    ],
    "Question": [
        "how",
        "why",
        "what",
        "where",
        "when",
        "can i",
        "could i",
        "is there",
        "does it",
        "do i",
    ],
    "Praise": [
        "great",
        "excellent",
        "amazing",
        "love",
        "awesome",
        "good",
        "helpful",
        "fantastic",
        "easy to use",
    ],
    "Complaint": [
        "frustrating",
        "annoying",
        "disappointed",
        "terrible",
        "bad",
        "poor",
        "hate",
        "unhappy",
        "slow",
        "difficult",
    ],
}


def classify_feedback(text: str) -> str:
    """
    Categorize a feedback item using keyword-based rules.

    Returns:
        Bug
        Feature Request
        Question
        Praise
        Complaint
        General Feedback
    """

    if not text:
        return "General Feedback"

    text = text.lower().strip()

    # Question detection
    if "?" in text:
        return "Question"

    # Check categories in priority order
    category_scores = {}

    for category, keywords in CATEGORIES.items():
        score = 0

        for keyword in keywords:
            if " " in keyword:
                if keyword in text:
                    score += 1
            else:
                if re.search(rf"\b{re.escape(keyword)}\b", text):
                    score += 1

        if score > 0:
            category_scores[category] = score

    if not category_scores:
        return "General Feedback"

    # Return category with the highest number of matching keywords
    return max(
        category_scores,
        key=category_scores.get,
    )


def classify_feedback_records(records: list[dict]) -> list[dict]:
    """
    Add a category to each feedback record.
    """

    classified_records = []

    for record in records:
        processed_record = record.copy()

        text = (
            record.get("cleaned_content")
            or record.get("content")
            or ""
        )

        processed_record["category"] = classify_feedback(text)

        classified_records.append(processed_record)

    return classified_records