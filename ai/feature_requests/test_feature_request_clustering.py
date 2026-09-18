import json
from pathlib import Path

from ai.clustering.embedding_generator import (
    EmbeddingGenerator,
)

from ai.feature_requests.feature_request_clusterer import (
    FeatureRequestClusterer,
)


RESULT_FILE = Path(
    "ai/feature_requests/feature_request_results.json"
)


def main():
    print("=" * 70)
    print("FEATURE REQUEST SEMANTIC CLUSTERING")
    print("=" * 70)

    if not RESULT_FILE.exists():
        print(
            f"Result file not found: {RESULT_FILE}"
        )
        return

    with open(
        RESULT_FILE,
        "r",
        encoding="utf-8",
    ) as file:
        results = json.load(file)

    feature_requests = [
        item
        for item in results
        if item.get("is_feature_request") is True
        and item.get("feature_request")
    ]

    if not feature_requests:
        print("No feature requests found.")
        return

    print(
        f"Feature requests found: "
        f"{len(feature_requests)}"
    )

    texts = [
        item["feature_request"]
        for item in feature_requests
    ]

    print()
    print("Generating semantic embeddings...")

    embedding_generator = EmbeddingGenerator()

    embeddings = (
        embedding_generator.generate_embeddings(
            texts
        )
    )

    print(
        f"Embeddings generated: "
        f"{len(embeddings)}"
    )

    print()
    print("Clustering similar feature requests...")

    clusterer = FeatureRequestClusterer(
        distance_threshold=0.65
    )

    labels = clusterer.cluster(
        embeddings
    )

    for item, label in zip(
        feature_requests,
        labels,
    ):
        item["cluster_id"] = label

    clusters = {}

    for item in feature_requests:
        cluster_id = item["cluster_id"]

        clusters.setdefault(
            cluster_id,
            [],
        ).append(item)

    print()
    print("=" * 70)
    print("FEATURE REQUEST CLUSTERS")
    print("=" * 70)

    for cluster_id, items in sorted(
        clusters.items()
    ):
        print()
        print(
            f"Cluster {cluster_id}"
        )

        print(
            f"Requests: {len(items)}"
        )

        for item in items:
            print(
                f"  - {item['feature_request']}"
            )

    print()
    print("=" * 70)
    print(
        f"Total clusters: "
        f"{len(clusters)}"
    )
    print("=" * 70)


if __name__ == "__main__":
    main()