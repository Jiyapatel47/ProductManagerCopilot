from datetime import datetime


def roadmap_document(
    workspace_id: str,
    roadmap: list,
):
    return {
        "workspace_id": workspace_id,
        "roadmap": roadmap,
        "created_at": datetime.utcnow(),
    }