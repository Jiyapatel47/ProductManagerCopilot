from ai.clustering.embedding_generator import EmbeddingGenerator
from ai.clustering.theme_clusterer import ThemeClusterer


texts = [
    "The dashboard is very slow when loading.",
    "Pages take too long to load.",
    "Dashboard loading speed has gotten worse.",
    "Please add dark mode to the application.",
    "I would really like a dark theme for the dashboard.",
    "Dark mode would be great for late night work sessions.",
    "Google login doesn't work.",
    "I am unable to sign in using Google.",
    "The Google authentication keeps failing.",
]

print("Generating embeddings...")

generator = EmbeddingGenerator()
embeddings = generator.generate_embeddings(texts)

print(f"Generated {len(embeddings)} embeddings.\n")

print("Clustering feedback...")

clusterer = ThemeClusterer(distance_threshold=0.65)
labels = clusterer.cluster(embeddings)

print("\nCluster results:\n")

for text, label in zip(texts, labels):
    print(f"Cluster {label}: {text}")

print("\nNumber of clusters:", len(set(labels)))