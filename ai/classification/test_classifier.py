from backend.app.database.mongodb import db
from ai.classification.classifier import classify_feedback_records


feedback_records = list(
    db.feedback.find().limit(10)
)

classified_records = classify_feedback_records(
    feedback_records
)

print(f"Classified {len(classified_records)} records.\n")

for record in classified_records:
    print("Feedback:")
    print(record.get("cleaned_content") or record.get("content"))

    print("Category:")
    print(record.get("category"))

    print("-" * 60)