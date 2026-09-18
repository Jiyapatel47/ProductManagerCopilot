from datetime import datetime, timezone


def create_pain_point_document(
    workspace_id: str,
    cluster_id: int,
    theme_name: str,
    pain_point: str,
    pain_point_type: str,
    summary: str,
    supporting_feedback: list[str],
    feedback_count: int,
    confidence: float,
):
    return {
        "workspace_id": workspace_id,
        "cluster_id": cluster_id,
        "theme_name": theme_name,
        "pain_point": pain_point,
        "pain_point_type": pain_point_type,
        "summary": summary,
        "supporting_feedback": supporting_feedback,
        "feedback_count": feedback_count,
        "confidence": confidence,
        "created_at": datetime.now(timezone.utc),
    }