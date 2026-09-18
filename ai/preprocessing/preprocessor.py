import re


def clean_text(text: str) -> str:
    """
    Clean a single feedback text.
    """

    if not text:
        return ""

    # Convert to string and remove leading/trailing spaces
    text = str(text).strip()

    # Convert multiple spaces/newlines into a single space
    text = re.sub(r"\s+", " ", text)

    # Remove URLs
    text = re.sub(r"https?://\S+|www\.\S+", "", text)

    # Remove email addresses
    text = re.sub(
        r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",
        "",
        text,
    )

    # Remove unwanted special characters
    # Keep letters, numbers, basic punctuation and apostrophes
    text = re.sub(r"[^a-zA-Z0-9\s.,!?'\-]", "", text)

    # Remove extra spaces created by cleaning
    text = re.sub(r"\s+", " ", text).strip()

    return text


def preprocess_feedback(feedback: list[dict]) -> list[dict]:
    """
    Clean a list of feedback records.

    Each record is expected to contain a 'content' field.
    """

    processed_feedback = []

    for item in feedback:
        cleaned_content = clean_text(item.get("content", ""))

        # Skip records that become empty after cleaning
        if not cleaned_content:
            continue

        processed_item = item.copy()
        processed_item["content"] = cleaned_content
        processed_item["preprocessing_status"] = "cleaned"

        processed_feedback.append(processed_item)

    return processed_feedback