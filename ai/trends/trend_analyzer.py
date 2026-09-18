from collections import Counter
from datetime import datetime


def parse_date(date_value):
    """
    Convert a stored feedback date into a datetime object.

    Supports common formats such as:
    YYYY-MM-DD
    YYYY-MM-DD HH:MM:SS
    ISO datetime strings
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


def calculate_feedback_trends(feedback_documents):
    """
    Calculate feedback trends over time.

    Returns:
        {
            "monthly_trends": [],
            "source_distribution": [],
            "total_dated_feedback": 0,
            "undated_feedback": 0
        }
    """

    monthly_counter = Counter()
    source_counter = Counter()

    total_dated_feedback = 0
    undated_feedback = 0

    for feedback in feedback_documents:

        # -----------------------------
        # Date trend
        # -----------------------------

        date_value = feedback.get("date")

        parsed_date = parse_date(date_value)

        if parsed_date:
            month_key = parsed_date.strftime(
                "%Y-%m"
            )

            monthly_counter[month_key] += 1
            total_dated_feedback += 1

        else:
            undated_feedback += 1

        # -----------------------------
        # Source distribution
        # -----------------------------

        source = feedback.get(
            "source_type",
            feedback.get("source", "unknown"),
        )

        if source:
            source_counter[
                str(source).strip().lower()
            ] += 1

    # Sort chronologically
    monthly_trends = [
        {
            "period": period,
            "feedback_count": count,
        }
        for period, count in sorted(
            monthly_counter.items()
        )
    ]

    source_distribution = [
        {
            "source": source,
            "count": count,
        }
        for source, count in sorted(
            source_counter.items()
        )
    ]

    return {
        "monthly_trends": monthly_trends,
        "source_distribution": source_distribution,
        "total_dated_feedback": total_dated_feedback,
        "undated_feedback": undated_feedback,
    }