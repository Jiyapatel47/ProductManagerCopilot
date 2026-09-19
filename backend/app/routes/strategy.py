from fastapi import APIRouter, Depends

from app.database.mongodb import db
from app.middleware.auth import get_current_user_id

from app.ai.product_strategy_agent import (
    generate_product_strategy,
)

from app.models.strategy import strategy_document


router = APIRouter(
    prefix="/api/reports",
    tags=["Product Strategy"],
)


@router.post("/product-strategy")
def create_product_strategy(
    user_id: str = Depends(get_current_user_id),
):
    workspace = db.workspaces.find_one(
        {"owner_id": user_id}
    )

    if not workspace:
        return {
            "message": "No workspace found.",
            "report": {},
        }

    workspace_id = str(workspace["_id"])

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

    roadmap_document_data = db.roadmaps.find_one(
        {"workspace_id": workspace_id},
        sort=[("created_at", -1)],
    )

    roadmap = []

    if roadmap_document_data:
        roadmap = roadmap_document_data.get(
            "roadmap",
            []
        )

    if not themes and not pain_points and not features:
        return {
            "message": "No product data found.",
            "report": {},
        }

    report = generate_product_strategy(
        themes=themes,
        pain_points=pain_points,
        features=features,
        roadmap=roadmap,
    )

    document = strategy_document(
        workspace_id=workspace_id,
        report=report,
    )

    db.reports.insert_one(document)

    return {
        "message":
            "Product strategy generated successfully.",
        "report": report,
    }


@router.get("/product-strategy")
def get_product_strategy(
    user_id: str = Depends(get_current_user_id),
):
    workspace = db.workspaces.find_one(
        {"owner_id": user_id}
    )

    if not workspace:
        return {
            "message": "No workspace found.",
            "report": {},
        }

    workspace_id = str(workspace["_id"])

    report = db.reports.find_one(
        {
            "workspace_id": workspace_id,
            "report_type": "product_strategy",
        },
        sort=[("created_at", -1)],
    )

    if not report:
        return {
            "message": "No product strategy found.",
            "report": {},
        }

    return {
        "message":
            "Product strategy retrieved successfully.",
        "report": report.get("report", {}),
    }