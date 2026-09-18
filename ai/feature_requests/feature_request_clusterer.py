from sklearn.cluster import AgglomerativeClustering


class FeatureRequestClusterer:
    def __init__(
        self,
        distance_threshold: float = 0.65,
    ):
        self.distance_threshold = distance_threshold

    def cluster(
        self,
        embeddings: list[list[float]],
    ) -> list[int]:
        if not embeddings:
            return []

        if len(embeddings) == 1:
            return [0]

        model = AgglomerativeClustering(
            n_clusters=None,
            distance_threshold=self.distance_threshold,
            metric="cosine",
            linkage="average",
        )

        labels = model.fit_predict(embeddings)

        return labels.tolist()