from datetime import datetime


def strategy_document(
    workspace_id: str,
    report: dict,
):
    return {
        "workspace_id": workspace_id,
        "report_type": "product_strategy",
        "report": report,
        "created_at": datetime.utcnow(),
    }