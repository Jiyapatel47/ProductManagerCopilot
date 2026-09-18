from datetime import datetime, timezone


def create_feedback_document(
    workspace_id: str,
    content: str,
    source: str,
    feedback_date: str | None = None,
):
    return {
        "workspace_id": workspace_id,
        "content": content.strip(),
        "source": source.strip().lower(),
        "date": feedback_date,
        "created_at": datetime.now(timezone.utc),
    }