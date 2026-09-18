from backend.app.database.mongodb import db
from ai.preprocessing.preprocessor import preprocess_feedback


# Fetch feedback records from MongoDB
feedback_records = list(
    db.feedback.find()
)

print(f"Fetched {len(feedback_records)} feedback records.\n")


# Preprocess the records
processed_records = preprocess_feedback(feedback_records)


# Update each MongoDB document
for original, processed in zip(
    feedback_records,
    processed_records,
):
    db.feedback.update_one(
        {"_id": original["_id"]},
        {
            "$set": {
                "cleaned_content": processed["content"],
                "preprocessing_status": "cleaned",
            }
        },
    )


print(
    f"Successfully processed and updated "
    f"{len(processed_records)} records in MongoDB."
)