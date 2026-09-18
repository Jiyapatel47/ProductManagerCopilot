from datetime import datetime, timezone


def create_user_document(name: str, email: str, password_hash: str):
    return {
        "name": name,
        "email": email.lower().strip(),
        "password_hash": password_hash,
        "created_at": datetime.now(timezone.utc),
    }