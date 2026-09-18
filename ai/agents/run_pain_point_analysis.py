import json
from pathlib import Path

from crewai import Crew, Task

from ai.agents.pain_point_agent import create_pain_point_agent
from ai.llm.groq_client import create_groq_llm


THEME_FILE = Path(
    "ai/agents/theme_extraction_results.json"
)

RESULT_FILE = Path(
    "ai/agents/pain_point_results.json"
)

THEMES_PER_BATCH = 4


def extract_json(result_text: str):
    """
    Extract a JSON object from the agent response.
    """

    text = result_text.strip()

    if text.startswith("```"):
        text = text.replace("```json", "")
        text = text.replace("```", "")
        text = text.strip()

    return json.loads(text)


def create_batch_task(agent, themes):
    """
    Create one task containing multiple themes.
    """

    theme_data = json.dumps(
        themes,
        indent=2,
        ensure_ascii=False,
    )

    task = Task(
        description=f"""
Analyze the following product themes and identify the
customer pain point for each theme.

THEMES:

{theme_data}

You must analyze EVERY theme provided.

For each theme, return exactly ONE JSON object.

IMPORTANT:

- Do not merge themes.
- Preserve each cluster_id.
- Preserve each theme_name.
- Use only the provided customer feedback.
- supporting_feedback must contain exact original feedback.
- Do not invent technical causes.
- Do not invent business impact.
- Do not prioritize pain points.
- Do not recommend solutions.
- Do not generate PRDs or requirements.

If a theme does not represent a genuine customer pain point,
return:

"pain_point": "No clear pain point identified."

and:

"pain_point_type": "none"

Return a JSON ARRAY containing exactly one object for
each input theme.

Each object must follow this structure:

{{
    "cluster_id": <integer>,
    "theme_name": "<original theme name>",
    "pain_point": "<underlying customer pain point>",
    "pain_point_type": "<access_issue|usability_issue|reliability_issue|performance_issue|billing_issue|missing_capability|other|none>",
    "summary": "<short evidence-grounded explanation>",
    "supporting_feedback": [
        "<exact original feedback>"
    ],
    "feedback_count": <integer>,
    "confidence": <number between 0 and 1>
}}

Return JSON ARRAY ONLY.
Do not use Markdown.
Do not add explanations outside the JSON array.
""",

        expected_output=(
            "A valid JSON array containing exactly one "
            "pain-point object for every provided theme."
        ),

        agent=agent,
    )

    return task


def main():

    print("=" * 70)
    print("PAIN POINT IDENTIFICATION")
    print("=" * 70)

    if not THEME_FILE.exists():
        print(
            f"Theme file not found: {THEME_FILE}"
        )
        raise SystemExit

    with open(
        THEME_FILE,
        "r",
        encoding="utf-8",
    ) as file:
        themes = json.load(file)

    if not isinstance(themes, list):
        print("Theme file must contain a JSON list.")
        raise SystemExit

    print(
        f"Themes loaded: {len(themes)}"
    )

    llm = create_groq_llm()

    agent = create_pain_point_agent(llm)

    all_results = []

    total_batches = (
        len(themes) + THEMES_PER_BATCH - 1
    ) // THEMES_PER_BATCH

    for batch_index in range(total_batches):

        start = (
            batch_index * THEMES_PER_BATCH
        )

        end = start + THEMES_PER_BATCH

        batch_themes = themes[start:end]

        print()
        print(
            f"Processing batch "
            f"{batch_index + 1}/{total_batches}"
        )

        print(
            f"Themes in batch: "
            f"{len(batch_themes)}"
        )

        task = create_batch_task(
            agent,
            batch_themes,
        )

        crew = Crew(
            agents=[agent],
            tasks=[task],
            verbose=True,
        )

        result = crew.kickoff()

        result_text = str(result)

        print()
        print("Agent response received.")

        try:
            batch_results = extract_json(
                result_text
            )

        except Exception as error:

            print(
                "Could not parse agent response "
                f"as JSON: {error}"
            )

            print()
            print("RAW RESPONSE:")
            print(result_text)

            raise

        if not isinstance(
            batch_results,
            list,
        ):
            print(
                "Agent response was not a JSON array."
            )
            raise SystemExit

        print(
            f"Pain points extracted: "
            f"{len(batch_results)}"
        )

        all_results.extend(
            batch_results
        )

    with open(
        RESULT_FILE,
        "w",
        encoding="utf-8",
    ) as file:

        json.dump(
            all_results,
            file,
            indent=2,
            ensure_ascii=False,
        )

    print()
    print("=" * 70)
    print("PAIN POINT ANALYSIS COMPLETE")
    print("=" * 70)

    print(
        f"Themes analyzed: {len(themes)}"
    )

    print(
        f"Pain point results: "
        f"{len(all_results)}"
    )

    print(
        f"Saved to: {RESULT_FILE}"
    )

    print("=" * 70)


if __name__ == "__main__":
    main()