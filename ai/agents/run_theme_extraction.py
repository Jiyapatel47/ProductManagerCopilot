import json
from collections import defaultdict
from pathlib import Path

from crewai import Crew, Process

from backend.app.database.mongodb import db

from ai.clustering.embedding_generator import EmbeddingGenerator
from ai.clustering.theme_clusterer import ThemeClusterer

from ai.agents.theme_extraction_agent import create_theme_extraction_agent
from ai.llm.groq_client import create_groq_llm


# --------------------------------------------------
# Configuration
# --------------------------------------------------

CLUSTERS_PER_BATCH = 4

RESULT_FILE = Path("ai/agents/theme_extraction_results.json")


# --------------------------------------------------
# 1. Fetch feedback from MongoDB
# --------------------------------------------------

feedback_records = list(
    db.feedback.find(
        {},
        {
            "content": 1,
            "cleaned_content": 1,
            "workspace_id": 1,
        },
    )
)

print(f"Fetched {len(feedback_records)} feedback records.")


if not feedback_records:
    print("No feedback records found.")
    raise SystemExit


# --------------------------------------------------
# 2. Prepare feedback text
# --------------------------------------------------

texts = []

for record in feedback_records:
    text = (
        record.get("cleaned_content")
        or record.get("content")
        or ""
    ).strip()

    if text:
        texts.append(text)


print(f"Valid feedback records: {len(texts)}")


if not texts:
    print("No valid feedback text found.")
    raise SystemExit


# --------------------------------------------------
# 3. Generate embeddings
# --------------------------------------------------

print("\nGenerating embeddings...")

embedding_generator = EmbeddingGenerator()

embeddings = embedding_generator.generate_embeddings(texts)

print(
    f"Generated {len(embeddings)} embeddings "
    f"with {len(embeddings[0])} dimensions."
)


# --------------------------------------------------
# 4. Discover semantic clusters
# --------------------------------------------------

print("\nDiscovering semantic clusters...")

clusterer = ThemeClusterer(
    distance_threshold=0.65
)

cluster_labels = clusterer.cluster(embeddings)


# --------------------------------------------------
# 5. Organize feedback by cluster
# --------------------------------------------------

clusters = defaultdict(list)

for text, cluster_id in zip(texts, cluster_labels):
    clusters[cluster_id].append(text)


print(
    f"Discovered {len(clusters)} semantic clusters."
)


# --------------------------------------------------
# 6. Create Groq LLM
# --------------------------------------------------

llm = create_groq_llm()


# --------------------------------------------------
# 7. Create Theme Extraction Agent
# --------------------------------------------------

theme_agent = create_theme_extraction_agent(llm)


# --------------------------------------------------
# 8. Create batches of clusters
# --------------------------------------------------

cluster_items = sorted(clusters.items())

batches = []

for start in range(
    0,
    len(cluster_items),
    CLUSTERS_PER_BATCH,
):
    batch = cluster_items[
        start:start + CLUSTERS_PER_BATCH
    ]

    batches.append(batch)


print(
    f"\nProcessing {len(cluster_items)} clusters "
    f"in {len(batches)} LLM batches."
)

print(
    f"Clusters per batch: {CLUSTERS_PER_BATCH}"
)


# --------------------------------------------------
# 9. Extract themes batch by batch
# --------------------------------------------------

theme_results = []


for batch_number, batch in enumerate(
    batches,
    start=1,
):

    print("\n" + "=" * 70)
    print(
        f"PROCESSING BATCH "
        f"{batch_number}/{len(batches)}"
    )
    print("=" * 70)

    # ----------------------------------------------
    # Build combined cluster input
    # ----------------------------------------------

    batch_text = ""

    for cluster_id, cluster_feedback in batch:

        batch_text += f"""

CLUSTER {cluster_id}
===================

"""

        for feedback in cluster_feedback:
            batch_text += f"- {feedback}\n"


    # ----------------------------------------------
    # Create one task for the entire batch
    # ----------------------------------------------

    task_description = f"""
You are analyzing multiple semantic clusters from a
customer feedback intelligence pipeline.

The feedback has already been grouped using semantic
embeddings and clustering.

Your responsibility is to extract the underlying
PRODUCT THEME from EACH cluster.

Do NOT perform clustering yourself.

Analyze each cluster independently.

Do not merge different clusters.

Do not invent information that is not supported by
the supplied feedback.

For every cluster, determine:

1. theme_name
2. theme_type
3. summary
4. feedback_count
5. supporting_feedback
6. outliers
7. confidence

THEME TYPES:

- problem
- feature_request
- improvement_opportunity
- general_experience

Definitions:

problem:
Customers report something that is not working,
difficult, slow, unreliable, confusing, or problematic.

feature_request:
Customers explicitly request a new capability or
functionality.

improvement_opportunity:
Customers suggest improving an existing capability.

general_experience:
The feedback describes an experience or observation
that does not clearly represent a problem or request.

IMPORTANT RULES:

- Analyze every cluster separately.
- Do not merge clusters.
- Do not create extra themes inside a cluster.
- Do not prioritize themes.
- Do not calculate business value.
- Do not estimate revenue impact.
- Do not recommend implementation solutions.
- Do not generate PRDs.
- Do not generate user stories.
- Do not generate acceptance criteria.
- Do not determine roadmap position.

Supporting feedback must contain ONLY original
feedback supplied in that cluster.

Outliers must contain ONLY original feedback supplied
in that cluster.

Every feedback item must appear in either
supporting_feedback or outliers.

The confidence value must be between 0 and 1.

Return ONLY valid JSON.

Return exactly this structure:

[
    {{
        "cluster_id": 0,
        "theme_name": "string",
        "theme_type": "problem",
        "summary": "string",
        "feedback_count": 0,
        "supporting_feedback": [],
        "outliers": [],
        "confidence": 0.0
    }}
]

The array must contain exactly one object for
each supplied cluster.

Here are the clusters:

{batch_text}
"""


    # ----------------------------------------------
    # Create CrewAI task
    # ----------------------------------------------

    from crewai import Task

    theme_task = Task(
        description=task_description,

        expected_output=(
            "A valid JSON array containing exactly one "
            "theme extraction object for every supplied "
            "cluster."
        ),

        agent=theme_agent,
    )


    # ----------------------------------------------
    # Create one-agent crew
    # ----------------------------------------------

    crew = Crew(
        agents=[theme_agent],
        tasks=[theme_task],
        process=Process.sequential,
        verbose=False,
    )


    # ----------------------------------------------
    # Run ONE LLM call for this batch
    # ----------------------------------------------

    result = crew.kickoff()

    result_text = str(result).strip()

    print("\nBatch result:")
    print(result_text)


    # ----------------------------------------------
    # Parse JSON
    # ----------------------------------------------

    try:

        parsed_result = json.loads(result_text)

        if not isinstance(parsed_result, list):
            raise ValueError(
                "Expected a JSON array."
            )

        theme_results.extend(parsed_result)

    except Exception as error:

        print(
            "\nWARNING: Could not parse batch "
            f"{batch_number} as JSON."
        )

        print(f"Error: {error}")

        print(
            "Saving raw result so it can be inspected."
        )

        theme_results.append(
            {
                "batch_number": batch_number,
                "raw_result": result_text,
            }
        )


# --------------------------------------------------
# 10. Save results locally
# --------------------------------------------------

RESULT_FILE.parent.mkdir(
    parents=True,
    exist_ok=True,
)


with open(
    RESULT_FILE,
    "w",
    encoding="utf-8",
) as file:

    json.dump(
        theme_results,
        file,
        indent=4,
        ensure_ascii=False,
    )


# --------------------------------------------------
# 11. Final summary
# --------------------------------------------------

print("\n")
print("=" * 70)
print("THEME EXTRACTION PIPELINE COMPLETED")
print("=" * 70)

print(
    f"Feedback records analyzed: {len(texts)}"
)

print(
    f"Semantic clusters discovered: {len(clusters)}"
)

print(
    f"LLM batches used: {len(batches)}"
)

print(
    f"Theme results saved to: {RESULT_FILE}"
)

print("=" * 70)