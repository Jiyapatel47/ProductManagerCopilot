from collections import defaultdict
from datetime import datetime


def parse_date(date_value):
    """
    Convert a stored date value into a datetime object.

    Supports common date formats used by imported CSV files.
    """

    if not date_value:
        return None

    if isinstance(date_value, datetime):
        return date_value

    date_value = str(date_value).strip()

    formats = [
        "%Y-%m-%d",
        "%Y-%m-%d %H:%M:%S",
        "%d-%m-%Y",
        "%m/%d/%Y",
        "%Y/%m/%d",
    ]

    for date_format in formats:
        try:
            return datetime.strptime(
                date_value,
                date_format,
            )
        except ValueError:
            continue

    try:
        return datetime.fromisoformat(
            date_value.replace("Z", "+00:00")
        ).replace(tzinfo=None)
    except ValueError:
        return None


def calculate_feature_request_trends(
    feature_documents,
):
    """
    Calculate monthly request trends for every
    aggregated feature.

    Returns:

    {
        "monthly_trends": [
            {
                "period": "2026-08",
                "features": [
                    {
                        "feature_name": "Dark Mode",
                        "request_count": 2
                    }
                ]
            }
        ]
    }
    """

    monthly_counts = defaultdict(
        lambda: defaultdict(int)
    )

    undated_requests = 0

    for feature in feature_documents:

        feature_name = feature.get(
            "feature_name",
            "Unknown Feature",
        )

        request_dates = feature.get(
            "request_dates",
            [],
        )

        for request in request_dates:

            parsed_date = parse_date(
                request.get("date")
            )

            if not parsed_date:
                undated_requests += 1
                continue

            period = parsed_date.strftime(
                "%Y-%m"
            )

            monthly_counts[
                period
            ][feature_name] += 1

    monthly_trends = []

    for period in sorted(monthly_counts):

        features = []

        for feature_name, count in sorted(
            monthly_counts[period].items()
        ):
            features.append(
                {
                    "feature_name": feature_name,
                    "request_count": count,
                }
            )

        monthly_trends.append(
            {
                "period": period,
                "features": features,
            }
        )

    return {
        "monthly_trends": monthly_trends,
        "undated_requests": undated_requests,
    }