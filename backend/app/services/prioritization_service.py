def calculate_priority_score(feature: dict) -> float:
    """
    Calculate priority score using:
    - Request count: 50%
    - AI confidence: 30%
    - Cluster impact: 20%
    """

    request_count = int(feature.get("request_count", 0))
    confidence = float(feature.get("confidence", 0))

    # Request count impact
    request_score = min(request_count * 10, 100)

    # AI confidence is already between 0 and 1
    confidence_score = confidence * 100

    # Cluster impact
    cluster_id = int(feature.get("cluster_id", 0))

    if cluster_id > 0:
        cluster_score = 100
    else:
        cluster_score = 50

    score = (
        request_score * 0.5
        + confidence_score * 0.3
        + cluster_score * 0.2
    )

    return round(score, 2)


def get_priority_level(score: float) -> str:
    if score >= 80:
        return "High"

    if score >= 50:
        return "Medium"

    return "Low"


def prioritize_features(features: list[dict]) -> list[dict]:
    prioritized_features = []

    for feature in features:
        score = calculate_priority_score(feature)

        priority = get_priority_level(score)

        prioritized_features.append(
            {
                "id": str(feature.get("_id", feature.get("id", ""))),
                "cluster_id": feature.get("cluster_id", 0),
                "feature_name": feature.get(
                    "feature_name",
                    "Unknown Feature",
                ),
                "summary": feature.get(
                    "summary",
                    "",
                ),
                "request_count": feature.get(
                    "request_count",
                    0,
                ),
                "confidence": feature.get(
                    "confidence",
                    0,
                ),
                "priority_score": score,
                "priority": priority,
            }
        )

    prioritized_features.sort(
        key=lambda item: item["priority_score"],
        reverse=True,
    )

    return prioritized_features