import json
from pathlib import Path

from ai.clustering.embedding_generator import (
    EmbeddingGenerator,
)

from ai.feature_requests.feature_request_clusterer import (
    FeatureRequestClusterer,
)

from ai.agents.feature_request_clustering_agent import (
    create_feature_request_clustering_agent,
    analyze_feature_request_cluster,
)

from ai.llm.groq_client import create_groq_llm


RESULT_FILE = Path(
    "ai/feature_requests/feature_request_results.json"
)

CLUSTER_RESULT_FILE = Path(
    "ai/feature_requests/feature_request_clusters.json"
)


def extract_json(result):

    """
    Convert CrewAI result into a Python dictionary.
    """

    raw_output = str(result).strip()

    if raw_output.startswith("```"):

        raw_output = raw_output.replace(
            "```json",
            "",
        )

        raw_output = raw_output.replace(
            "```",
            "",
        )

        raw_output = raw_output.strip()

    try:

        return json.loads(raw_output)

    except json.JSONDecodeError:

        print(
            "Could not parse LLM output as JSON."
        )

        print()

        print(raw_output)

        return None


def main():

    print("=" * 70)
    print("FEATURE REQUEST CLUSTERING PIPELINE")
    print("=" * 70)

    # ---------------------------------------------------------
    # STEP 1: Load feature request analysis results
    # ---------------------------------------------------------

    if not RESULT_FILE.exists():

        print(
            f"Feature request result file not found: "
            f"{RESULT_FILE}"
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

        print(
            "No feature requests found."
        )

        return

    print(
        f"Feature requests found: "
        f"{len(feature_requests)}"
    )

    # ---------------------------------------------------------
    # STEP 2: Generate semantic embeddings
    # ---------------------------------------------------------

    print()

    print(
        "Generating semantic embeddings..."
    )

    texts = [
        item["feature_request"]
        for item in feature_requests
    ]

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

    # ---------------------------------------------------------
    # STEP 3: Semantic clustering
    # ---------------------------------------------------------

    print()

    print(
        "Clustering feature requests..."
    )

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

    print(
        f"Semantic clusters created: "
        f"{len(clusters)}"
    )

    # ---------------------------------------------------------
    # STEP 4: Display clusters
    # ---------------------------------------------------------

    print()

    print("=" * 70)
    print("SEMANTIC FEATURE REQUEST CLUSTERS")
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
                f"  - "
                f"{item['feature_request']}"
            )

            print(
                f"    Date: "
                f"{item.get('date')}"
            )

    # ---------------------------------------------------------
    # STEP 5: Create CrewAI agent
    # ---------------------------------------------------------

    print()

    print("=" * 70)
    print(
        "STARTING FEATURE REQUEST CLUSTERING AGENT"
    )
    print("=" * 70)

    llm = create_groq_llm()

    agent = create_feature_request_clustering_agent(
        llm
    )

    # ---------------------------------------------------------
    # STEP 6: Analyze each semantic cluster
    # ---------------------------------------------------------

    aggregated_features = []

    for cluster_id, items in sorted(
        clusters.items()
    ):

        print()

        print(
            "-" * 70
        )

        print(
            f"Processing cluster {cluster_id}"
        )

        print(
            f"Requests in cluster: "
            f"{len(items)}"
        )

        try:

            result = analyze_feature_request_cluster(
                agent=agent,
                cluster_id=cluster_id,
                feature_requests=items,
            )

            parsed_result = extract_json(
                result
            )

            if parsed_result:

                # -------------------------------------------------
                # Preserve the original request dates.
                #
                # Dates come from MongoDB-derived data, not from
                # the LLM's generated output.
                # -------------------------------------------------

                parsed_result["request_dates"] = [
                    {
                        "feedback_id": item.get(
                            "feedback_id"
                        ),
                        "date": item.get(
                            "date"
                        ),
                        "feature_request": item.get(
                            "feature_request"
                        ),
                    }
                    for item in items
                ]

                aggregated_features.append(
                    parsed_result
                )

                print(
                    "Cluster analyzed successfully."
                )

            else:

                print(
                    "Cluster result could not "
                    "be parsed."
                )

        except Exception as error:

            print(
                f"Cluster {cluster_id} failed:"
            )

            print(error)

    # ---------------------------------------------------------
    # STEP 7: Display final results
    # ---------------------------------------------------------

    print()

    print("=" * 70)
    print(
        "FEATURE REQUEST AGGREGATION COMPLETE"
    )
    print("=" * 70)

    print(
        f"Original feature requests: "
        f"{len(feature_requests)}"
    )

    print(
        f"Semantic clusters: "
        f"{len(clusters)}"
    )

    print(
        f"Aggregated feature groups: "
        f"{len(aggregated_features)}"
    )

    print("=" * 70)

    print()

    print(
        "AGGREGATED FEATURE REQUESTS"
    )

    print("=" * 70)

    for feature in aggregated_features:

        print()

        print(
            f"Cluster: "
            f"{feature.get('cluster_id')}"
        )

        print(
            f"Feature: "
            f"{feature.get('feature_name')}"
        )

        print(
            f"Summary: "
            f"{feature.get('summary')}"
        )

        print(
            f"Request count: "
            f"{feature.get('request_count')}"
        )

        print(
            f"Confidence: "
            f"{feature.get('confidence')}"
        )

        print(
            f"Request dates: "
            f"{len(feature.get('request_dates', []))}"
        )

    # ---------------------------------------------------------
    # STEP 8: Save final results
    # ---------------------------------------------------------

    CLUSTER_RESULT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    with open(
        CLUSTER_RESULT_FILE,
        "w",
        encoding="utf-8",
    ) as file:

        json.dump(
            aggregated_features,
            file,
            indent=4,
            ensure_ascii=False,
        )

    print()

    print("=" * 70)

    print(
        f"Final results saved to: "
        f"{CLUSTER_RESULT_FILE}"
    )

    print("=" * 70)


if __name__ == "__main__":

    main()