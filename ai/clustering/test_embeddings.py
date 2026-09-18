from ai.clustering.embedding_generator import EmbeddingGenerator


generator = EmbeddingGenerator()

texts = [
    "Please add dark mode to the application.",
    "I would really like a dark theme for the dashboard.",
    "The application crashes frequently when I upload a file.",
]

embeddings = generator.generate_embeddings(texts)

print(f"Generated embeddings for {len(embeddings)} texts.")

for index, embedding in enumerate(embeddings):
    print(
        f"Text {index + 1}: "
        f"{len(embedding)} dimensions"
    )

print("\nFirst 5 values of first embedding:")
print(embeddings[0][:5])