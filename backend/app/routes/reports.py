from fastapi import APIRouter, Depends

from app.database.mongodb import db
from app.middleware.auth import get_current_user_id

from app.ai.executive_summary_agent import (
    generate_executive_summary,
)

from app.models.report import report_document


router = APIRouter(
    prefix="/api/reports",
    tags=["Reports"],
)


@router.post("/executive-summary")
def create_executive_summary(
    user_id: str = Depends(
        get_current_user_id
    ),
):

    workspace = db.workspaces.find_one(
        {"owner_id": user_id}
    )

    if not workspace:
        return {
            "message": "No workspace found.",
            "report": {},
        }

    workspace_id = str(
        workspace["_id"]
    )

    themes = list(
        db.themes.find(
            {"workspace_id": workspace_id}
        )
    )

    pain_points = list(
        db.pain_points.find(
            {"workspace_id": workspace_id}
        )
    )

    features = list(
        db.feature_requests.find(
            {"workspace_id": workspace_id}
        )
    )

    if (
        not themes
        and not pain_points
        and not features
    ):
        return {
            "message": "No product data found.",
            "report": {},
        }

    report = generate_executive_summary(
        themes=themes,
        pain_points=pain_points,
        features=features,
    )

    document = report_document(
        workspace_id=workspace_id,
        report_type="executive_summary",
        report=report,
    )

    db.reports.insert_one(document)

    return {
        "message":
            "Executive summary generated successfully.",
        "report": report,
    }


@router.get("/executive-summary")
def get_executive_summary(
    user_id: str = Depends(
        get_current_user_id
    ),
):

    workspace = db.workspaces.find_one(
        {"owner_id": user_id}
    )

    if not workspace:
        return {
            "message": "No workspace found.",
            "report": {},
        }

    workspace_id = str(
        workspace["_id"]
    )

    report = db.reports.find_one(
        {
            "workspace_id": workspace_id,
            "report_type": "executive_summary",
        },
        sort=[
            ("created_at", -1)
        ],
    )

    if not report:
        return {
            "message":
                "No executive summary found.",
            "report": {},
        }

    return {
        "message":
            "Executive summary retrieved successfully.",
        "report": report.get(
            "report",
            {},
        ),
    }