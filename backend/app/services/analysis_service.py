
from app.database.mongodb import db

from app.ai.theme_agent import extract_themes
from app.ai.pain_point_agent import extract_pain_points
from app.ai.feature_agent import extract_feature_requests

from app.models.theme import create_theme_document
from app.models.pain_point import create_pain_point_document
from app.models.feature_request import (
    create_feature_request_document,
)


def analyze_workspace_feedback(workspace_id: str) -> dict:
    """
    Analyze all feedback belonging to a workspace.

    The analysis produces:
    - Themes
    - Pain points
    - Feature requests
    """

    feedback_documents = list(
        db.feedback.find(
            {"workspace_id": workspace_id}
        )
    )

    if not feedback_documents:
        return {
            "message": "No feedback found for this workspace",
            "themes_created": 0,
            "pain_points_created": 0,
            "feature_requests_created": 0,
        }

    feedback_list = [
        feedback["content"]
        for feedback in feedback_documents
        if feedback.get("content")
    ]

    if not feedback_list:
        return {
            "message": "No valid feedback content found",
            "themes_created": 0,
            "pain_points_created": 0,
            "feature_requests_created": 0,
        }

    # -----------------------------------------------------
    # Run AI analysis
    # -----------------------------------------------------

    themes = extract_themes(feedback_list)

    print("\n========== ANALYSIS DEBUG ==========")
    print("Workspace ID:", workspace_id)
    print("Feedback count:", len(feedback_list))
    print("Themes extracted:", len(themes))

    pain_points = extract_pain_points(feedback_list)

    print("Pain points extracted:", len(pain_points))

    feature_requests = extract_feature_requests(feedback_list)

    print("Feature requests extracted:", len(feature_requests))
    print("Feature request data:", feature_requests)
    print("========== END ANALYSIS DEBUG ==========\n")

    # -----------------------------------------------------
    # Remove previous analysis for this workspace
    # -----------------------------------------------------

    db.themes.delete_many(
        {"workspace_id": workspace_id}
    )

    db.pain_points.delete_many(
        {"workspace_id": workspace_id}
    )

    db.feature_requests.delete_many(
        {"workspace_id": workspace_id}
    )

    # -----------------------------------------------------
    # Save themes
    # -----------------------------------------------------

    themes_created = 0

    for theme in themes:

        document = create_theme_document(
            workspace_id=workspace_id,
            cluster_id=int(
                theme.get("cluster_id", 0)
            ),
            theme_name=theme.get(
                "theme_name",
                "Unknown Theme",
            ),
            theme_type=theme.get(
                "theme_type",
                "general",
            ),
            summary=theme.get(
                "summary",
                "",
            ),
            feedback_count=int(
                theme.get("feedback_count", 0)
            ),
            supporting_feedback=theme.get(
                "supporting_feedback",
                [],
            ),
            outliers=theme.get(
                "outliers",
                [],
            ),
            confidence=float(
                theme.get("confidence", 0)
            ),
        )

        db.themes.insert_one(document)

        themes_created += 1

    # -----------------------------------------------------
    # Save pain points
    # -----------------------------------------------------

    pain_points_created = 0

    for pain_point in pain_points:

        document = create_pain_point_document(
            workspace_id=workspace_id,
            cluster_id=int(
                pain_point.get("cluster_id", 0)
            ),
            theme_name=pain_point.get(
                "theme_name",
                "General",
            ),
            pain_point=pain_point.get(
                "pain_point",
                "",
            ),
            pain_point_type=pain_point.get(
                "pain_point_type",
                "general",
            ),
            summary=pain_point.get(
                "summary",
                "",
            ),
            supporting_feedback=pain_point.get(
                "supporting_feedback",
                [],
            ),
            feedback_count=int(
                pain_point.get("feedback_count", 0)
            ),
            confidence=float(
                pain_point.get("confidence", 0)
            ),
        )

        db.pain_points.insert_one(document)

        pain_points_created += 1

    # -----------------------------------------------------
    # Save feature requests
    # -----------------------------------------------------

    feature_requests_created = 0

    for feature in feature_requests:

        document = create_feature_request_document(
            workspace_id=workspace_id,
            cluster_id=int(
                feature.get("cluster_id", 0)
            ),
            feature_name=feature.get(
                "feature_name",
                "Unknown Feature",
            ),
            summary=feature.get(
                "summary",
                "",
            ),
            request_count=int(
                feature.get("request_count", 0)
            ),
            supporting_requests=feature.get(
                "supporting_requests",
                [],
            ),
            confidence=float(
                feature.get("confidence", 0)
            ),
            request_dates=feature.get(
                "request_dates",
                [],
            ),
        )

        db.feature_requests.insert_one(document)

        feature_requests_created += 1

    print("\n========== DATABASE SAVE DEBUG ==========")
    print("Themes created:", themes_created)
    print("Pain points created:", pain_points_created)
    print("Feature requests created:", feature_requests_created)
    print("Workspace ID used for saving:", workspace_id)
    print("========== END DATABASE SAVE DEBUG ==========\n")

    return {
        "message": "Feedback analysis completed successfully",
        "feedback_analyzed": len(feedback_list),
        "themes_created": themes_created,
        "pain_points_created": pain_points_created,
        "feature_requests_created": feature_requests_created,
    }

