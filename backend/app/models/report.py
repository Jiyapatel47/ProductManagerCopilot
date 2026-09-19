from datetime import datetime


def report_document(
    workspace_id: str,
    report_type: str,
    report: dict,
):
    return {
        "workspace_id": workspace_id,
        "report_type": report_type,
        "report": report,
        "created_at": datetime.utcnow(),
    }