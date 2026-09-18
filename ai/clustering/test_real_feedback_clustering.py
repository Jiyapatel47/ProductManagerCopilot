from backend.app.database.mongodb import db
from ai.clustering.embedding_generator import EmbeddingGenerator
from ai.clustering.theme_clusterer import ThemeClusterer


# 1. Fetch feedback from MongoDB
feedback_records = list(
    db.feedback.find(
        {},
        {
            "content": 1,
            "cleaned_content": 1,
        },
    )
)

print(f"Fetched {len(feedback_records)} feedback records.\n")


# 2. Use cleaned feedback
texts = []

for record in feedback_records:
    text = (
        record.get("cleaned_content")
        or record.get("content")
        or ""
    ).strip()

    if text:
        texts.append(text)


if not texts:
    print("No valid feedback text found.")
    raise SystemExit


print(f"Valid feedback texts: {len(texts)}")
print("Generating embeddings...\n")


# 3. Generate embeddings
generator = EmbeddingGenerator()

embeddings = generator.generate_embeddings(texts)

print(
    f"Generated {len(embeddings)} embeddings "
    f"with {len(embeddings[0])} dimensions.\n"
)


# 4. Cluster the feedback
clusterer = ThemeClusterer(
    distance_threshold=0.65
)

labels = clusterer.cluster(embeddings)


# 5. Display clusters
clusters = {}

for text, label in zip(texts, labels):
    clusters.setdefault(label, []).append(text)


print("=" * 70)
print("DISCOVERED FEEDBACK CLUSTERS")
print("=" * 70)

for cluster_id, cluster_texts in sorted(clusters.items()):
    print(f"\nCluster {cluster_id}")
    print("-" * 50)

    for index, text in enumerate(cluster_texts, start=1):
        print(f"{index}. {text}")

    print(f"\nFeedback count: {len(cluster_texts)}")


print("\n" + "=" * 70)
print(f"TOTAL CLUSTERS: {len(clusters)}")
print("=" * 70)