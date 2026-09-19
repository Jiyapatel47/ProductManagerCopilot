from collections import Counter
from datetime import datetime


def calculate_feedback_trends(
    feedback_documents: list[dict],
) -> dict:
    """
    Calculate feedback trends by source and date.
    Uses created_at when date is not available.
    """

    if not feedback_documents:
        return {
            "total_feedback": 0,
            "trends": [],
            "time_trends": [],
        }

    # -----------------------------------
    # 1. Count feedback by source
    # -----------------------------------

    source_counter = Counter()

    for feedback in feedback_documents:
        source = (
            feedback.get("source")
            or feedback.get("source_type")
            or "unknown"
        )

        source_counter[source] += 1

    trends = []

    for source, count in source_counter.items():
        trends.append(
            {
                "source": source,
                "feedback_count": count,
            }
        )

    trends.sort(
        key=lambda item: item["feedback_count"],
        reverse=True,
    )

    # -----------------------------------
    # 2. Calculate feedback over time
    # -----------------------------------

    date_counter = Counter()

    for feedback in feedback_documents:

        # Prefer date if available
        feedback_date = feedback.get("date")

        # If date is null, use created_at
        if not feedback_date:
            feedback_date = feedback.get("created_at")

        if not feedback_date:
            continue

        try:

            # MongoDB datetime object
            if isinstance(feedback_date, datetime):
                date_key = feedback_date.strftime("%Y-%m-%d")

            # String datetime
            elif isinstance(feedback_date, str):
                parsed_date = datetime.fromisoformat(
                    feedback_date.replace("Z", "+00:00")
                )

                date_key = parsed_date.strftime("%Y-%m-%d")

            else:
                continue

            date_counter[date_key] += 1

        except (ValueError, TypeError):
            continue

    time_trends = []

    for date, count in sorted(date_counter.items()):
        time_trends.append(
            {
                "date": date,
                "feedback_count": count,
            }
        )

    # -----------------------------------
    # Final response
    # -----------------------------------

    return {
        "total_feedback": len(feedback_documents),
        "trends": trends,
        "time_trends": time_trends,
    }


def calculate_feature_request_trends(
    feature_documents: list[dict],
) -> dict:
    """
    Calculate feature request trends.
    """

    if not feature_documents:
        return {
            "total_feature_requests": 0,
            "trends": [],
        }

    trends = []

    for feature in feature_documents:

        trends.append(
            {
                "cluster_id": feature.get(
                    "cluster_id"
                ),
                "feature_name": feature.get(
                    "feature_name",
                    "Unknown Feature",
                ),
                "request_count": feature.get(
                    "request_count",
                    0,
                ),
                "confidence": feature.get(
                    "confidence",
                    0,
                ),
            }
        )

    trends.sort(
        key=lambda item: item["request_count"],
        reverse=True,
    )

    return {
        "total_feature_requests": len(feature_documents),
        "trends": trends,
    }