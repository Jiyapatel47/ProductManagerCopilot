from datetime import datetime, timezone


def create_theme_document(
    workspace_id: str,
    cluster_id: int,
    theme_name: str,
    theme_type: str,
    summary: str,
    feedback_count: int,
    supporting_feedback: list[str],
    outliers: list[str],
    confidence: float,
):
    return {
        "workspace_id": workspace_id,
        "cluster_id": cluster_id,
        "theme_name": theme_name,
        "theme_type": theme_type,
        "summary": summary,
        "feedback_count": feedback_count,
        "supporting_feedback": supporting_feedback,
        "outliers": outliers,
        "confidence": confidence,
        "created_at": datetime.now(timezone.utc),
    }