from datetime import datetime, timezone


def create_feature_request_document(
    workspace_id: str,
    cluster_id: int,
    feature_name: str,
    summary: str,
    request_count: int,
    supporting_requests: list[str],
    confidence: float,
    request_dates: list[dict],
):
    return {
        "workspace_id": workspace_id,
        "cluster_id": cluster_id,
        "feature_name": feature_name,
        "summary": summary,
        "request_count": request_count,
        "supporting_requests": supporting_requests,
        "confidence": confidence,
        "request_dates": request_dates,
        "created_at": datetime.now(timezone.utc),
    }