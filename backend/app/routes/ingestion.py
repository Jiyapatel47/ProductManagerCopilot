import csv
import io

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from backend.app.database.mongodb import db
from backend.app.middleware.auth import get_current_user_id
from backend.app.models.feedback import create_feedback_document


router = APIRouter(
    prefix="/api/ingestion",
    tags=["Feedback Ingestion"],
)


@router.post("/feedback")
async def ingest_feedback(
    file: UploadFile = File(...),
    source_type: str = Form(...),
    user_id: str = Depends(get_current_user_id),
):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Only CSV files are supported",
        )

    workspace = db.workspaces.find_one(
        {"owner_id": user_id}
    )

    if not workspace:
        raise HTTPException(
            status_code=404,
            detail="No workspace found for this user",
        )

    file_content = await file.read()

    try:
        decoded_content = file_content.decode("utf-8-sig")
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="CSV file must use UTF-8 encoding",
        )

    reader = csv.DictReader(io.StringIO(decoded_content))

    if not reader.fieldnames:
        raise HTTPException(
            status_code=400,
            detail="CSV file does not contain headers",
        )

    normalized_headers = {
        header.strip().lower(): header
        for header in reader.fieldnames
        if header
    }

    content_header = normalized_headers.get("content")

    if not content_header:
        raise HTTPException(
            status_code=400,
            detail="CSV must contain a 'content' column",
        )

    feedback_documents = []

    for row in reader:
        content = (row.get(content_header) or "").strip()

        if not content:
            continue

        source_header = normalized_headers.get("source")
        date_header = normalized_headers.get("date")

        source = (
            (row.get(source_header) or "").strip()
            if source_header
            else source_type
        )

        feedback_date = (
            (row.get(date_header) or "").strip()
            if date_header
            else None
        )

        document = create_feedback_document(
            workspace_id=str(workspace["_id"]),
            content=content,
            source=source or source_type,
            feedback_date=feedback_date,
        )

        document["source_type"] = source_type
        document["filename"] = file.filename
        document["status"] = "imported"

        feedback_documents.append(document)

    if not feedback_documents:
        raise HTTPException(
            status_code=400,
            detail="No valid feedback records found in the CSV",
        )

    result = db.feedback.insert_many(feedback_documents)

    return {
        "message": "Feedback imported successfully",
        "filename": file.filename,
        "source_type": source_type,
        "records_imported": len(result.inserted_ids),
        "workspace_id": str(workspace["_id"]),
    }