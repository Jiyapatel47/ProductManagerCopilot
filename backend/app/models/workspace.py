from datetime import datetime, timezone


def create_workspace_document(name: str, owner_id: str):
    return {
        "name": name.strip(),
        "owner_id": owner_id,
        "created_at": datetime.now(timezone.utc),
    }