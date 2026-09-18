from backend.app.database.mongodb import db

from ai.feature_requests.feature_request_extractor import (
    is_feature_request,
    normalize_feature_request,
)


feedback = list(
    db.feedback.find({})
)

print("=" * 70)
print("FEATURE REQUEST DETECTION")
print("=" * 70)

feature_requests = []

for item in feedback:
    text = (
        item.get("cleaned_content")
        or item.get("content")
        or ""
    )

    if is_feature_request(text):
        normalized = normalize_feature_request(text)

        feature_requests.append(
            {
                "feedback_id": str(item["_id"]),
                "content": text,
                "normalized_request": normalized,
            }
        )

        print()
        print("Original:")
        print(text)

        print("Detected:")
        print(normalized)


print()
print("=" * 70)
print(
    f"Feature requests detected: "
    f"{len(feature_requests)}"
)
print("=" * 70)