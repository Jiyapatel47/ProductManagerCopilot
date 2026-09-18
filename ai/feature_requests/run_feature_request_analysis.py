import json
from pathlib import Path

from backend.app.database.mongodb import db

from ai.feature_requests.feature_request_analyzer import (
    create_feature_request_agent,
    analyze_feature_requests,
)
from ai.llm.groq_client import create_groq_llm


BATCH_SIZE = 10

RESULT_FILE = Path(
    "ai/feature_requests/feature_request_results.json"
)


def extract_json(result):
    """
    Convert CrewAI result into a Python list.
    """

    raw_output = str(result).strip()

    # Remove markdown code fences if the model adds them.
    if raw_output.startswith("```"):
        raw_output = raw_output.replace("```json", "")
        raw_output = raw_output.replace("```", "")
        raw_output = raw_output.strip()

    try:
        return json.loads(raw_output)

    except json.JSONDecodeError:
        print("Could not parse LLM output as JSON.")
        print()
        print(raw_output)
        return []


def main():

    print("=" * 70)
    print("FEATURE REQUEST AI ANALYSIS")
    print("=" * 70)

    # ---------------------------------------------------------
    # STEP 1: Load feedback from MongoDB
    # ---------------------------------------------------------

    feedback = list(
        db.feedback.find({})
    )

    if not feedback:

        print("No feedback records found.")
        return

    print(
        f"Feedback records found: {len(feedback)}"
    )

    # ---------------------------------------------------------
    # STEP 2: Prepare feedback items
    # ---------------------------------------------------------

    feedback_items = []

    for item in feedback:

        content = (
            item.get("cleaned_content")
            or item.get("content")
            or ""
        )

        if not content:
            continue

        feedback_items.append(
            {
                "feedback_id": str(item["_id"]),
                "content": content,

                # Preserve original feedback date
                "date": item.get("date"),
            }
        )

    print(
        f"Valid feedback records: {len(feedback_items)}"
    )

    # ---------------------------------------------------------
    # STEP 3: Create LLM
    # ---------------------------------------------------------

    llm = create_groq_llm()

    agent = create_feature_request_agent(llm)

    all_results = []

    total_batches = (
        len(feedback_items) + BATCH_SIZE - 1
    ) // BATCH_SIZE

    print(
        f"Batch size: {BATCH_SIZE}"
    )

    print(
        f"Total LLM batches: {total_batches}"
    )

    print("=" * 70)

    # ---------------------------------------------------------
    # STEP 4: Analyze feedback in batches
    # ---------------------------------------------------------

    for batch_number, start in enumerate(
        range(
            0,
            len(feedback_items),
            BATCH_SIZE,
        ),
        start=1,
    ):

        batch = feedback_items[
            start : start + BATCH_SIZE
        ]

        print()

        print(
            f"Processing batch "
            f"{batch_number}/{total_batches}"
        )

        try:

            result = analyze_feature_requests(
                agent=agent,
                feedback_items=batch,
            )

            parsed_results = extract_json(
                result
            )

            if isinstance(
                parsed_results,
                list,
            ):

                # -------------------------------------------------
                # Preserve original date in each result.
                #
                # The LLM does not need to be trusted to return
                # the date. We attach it from MongoDB using
                # feedback_id.
                # -------------------------------------------------

                date_lookup = {
                    item["feedback_id"]: item.get("date")
                    for item in batch
                }

                for result_item in parsed_results:

                    feedback_id = result_item.get(
                        "feedback_id"
                    )

                    result_item["date"] = (
                        date_lookup.get(feedback_id)
                    )

                all_results.extend(
                    parsed_results
                )

                print(
                    f"Results received: "
                    f"{len(parsed_results)}"
                )

            else:

                print(
                    "Unexpected result format."
                )

        except Exception as error:

            print(
                f"Batch {batch_number} failed:"
            )

            print(error)

    # ---------------------------------------------------------
    # STEP 5: Filter feature requests
    # ---------------------------------------------------------

    print()
    print("=" * 70)
    print("ANALYSIS COMPLETE")
    print("=" * 70)

    feature_requests = [
        item
        for item in all_results
        if item.get("is_feature_request") is True
    ]

    print(
        f"Total feedback analyzed: "
        f"{len(all_results)}"
    )

    print(
        f"Feature requests identified: "
        f"{len(feature_requests)}"
    )

    print(
        f"Non-feature feedback: "
        f"{len(all_results) - len(feature_requests)}"
    )

    print("=" * 70)

    # ---------------------------------------------------------
    # STEP 6: Display feature requests
    # ---------------------------------------------------------

    print()
    print("IDENTIFIED FEATURE REQUESTS")
    print("=" * 70)

    for item in feature_requests:

        print()

        print(
            f"Feedback ID: "
            f"{item.get('feedback_id')}"
        )

        print(
            f"Date: "
            f"{item.get('date')}"
        )

        print(
            f"Request: "
            f"{item.get('feature_request')}"
        )

    # ---------------------------------------------------------
    # STEP 7: Save results
    # ---------------------------------------------------------

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
            all_results,
            file,
            indent=4,
            ensure_ascii=False,
        )

    print()
    print("=" * 70)

    print(
        f"Results saved to: {RESULT_FILE}"
    )

    print("=" * 70)


if __name__ == "__main__":
    main()