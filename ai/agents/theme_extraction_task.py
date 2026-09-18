from crewai import Task


def create_theme_extraction_task(
    agent,
    cluster_id,
    cluster_feedback,
):
    feedback_text = "\n".join(
        f"- {feedback}"
        for feedback in cluster_feedback
    )

    return Task(
        description=f"""
You are analyzing Cluster {cluster_id} from a customer feedback
intelligence pipeline.

The feedback in this cluster has already been grouped using semantic
embeddings and clustering.

Your responsibility is NOT to perform the initial clustering.

Your responsibility is to interpret the cluster and extract the
underlying PRODUCT THEME from the customer feedback.

CLUSTER ID:
{cluster_id}

CUSTOMER FEEDBACK:
{feedback_text}


ANALYSIS REQUIREMENTS
=====================

1. IDENTIFY THE UNDERLYING PRODUCT THEME

Determine the common product area, capability, workflow, experience,
or customer need represented by the feedback.

Do not simply select the most frequently occurring keyword.

For example:

"Dashboard takes too long to load."
"Analytics page feels sluggish."

should produce a meaningful product theme such as:

"Dashboard and Analytics Performance"

rather than simply:

"Slow"


2. DISTINGUISH THE THEME FROM INDIVIDUAL SYMPTOMS

A theme represents the broader product concept.

Individual symptoms are evidence supporting that theme.

Do not treat every symptom as a separate theme when the feedback
clearly refers to the same underlying product area.


3. DETERMINE THE THEME TYPE

Classify the theme as exactly one of:

- problem
- feature_request
- improvement_opportunity
- general_experience

Use "problem" when customers report something that is not working,
difficult, slow, unreliable, confusing, or otherwise problematic.

Use "feature_request" when customers explicitly request a new
capability or functionality.

Use "improvement_opportunity" when customers suggest improving an
existing capability without describing a completely new feature.

Use "general_experience" when the feedback describes an experience
or observation that does not clearly represent a problem or request.


4. CHECK CLUSTER COHERENCE

Evaluate whether all feedback items genuinely belong to the same
underlying theme.

If an item is unrelated or represents a substantially different
topic, place it in "outliers".

Do not force unrelated feedback into the theme merely because the
clustering algorithm placed it in the same cluster.


5. CONSOLIDATE DUPLICATE IDEAS

Different wording can represent the same customer need.

For example:

"Please add dark mode."
"I want a dark theme."
"Dark mode would help at night."

represent one underlying theme, not three separate themes.


6. PRODUCE AN EVIDENCE-GROUNDED SUMMARY

Summarize what customers are communicating collectively.

The summary must be based only on the supplied feedback.

Do not invent:

- technical causes
- customer motivations
- business impact
- revenue impact
- urgency
- requirements
- solutions


7. SELECT SUPPORTING EVIDENCE

Select the most representative feedback statements that directly
support the identified theme.

Use the original feedback text exactly as supplied.

Do not rewrite or fabricate evidence.


8. IDENTIFY OUTLIERS

If a feedback item does not belong to the identified theme, include
the original statement in the "outliers" array.

If every item belongs to the theme, return an empty array.


9. CALCULATE CONFIDENCE

Return a confidence value between 0 and 1.

Confidence should reflect:

- consistency of the feedback
- strength of the common theme
- number of supporting items
- presence or absence of outliers

Confidence represents confidence in the THEME EXTRACTION itself.

It must NOT represent:

- business importance
- customer value
- implementation difficulty
- priority
- revenue impact


10. MAINTAIN AGENT BOUNDARIES

You are responsible only for theme extraction.

Do NOT:

- prioritize the theme
- calculate business value
- estimate revenue impact
- recommend implementation solutions
- generate a PRD
- create user stories
- generate acceptance criteria
- determine roadmap position
- perform detailed pain-point prioritization

Those responsibilities belong to downstream modules and agents.


OUTPUT CONTRACT
===============

Return ONLY valid JSON.

Use exactly this structure:

{{
    "cluster_id": {cluster_id},
    "theme_name": "string",
    "theme_type": "problem | feature_request | improvement_opportunity | general_experience",
    "summary": "string",
    "feedback_count": {len(cluster_feedback)},
    "supporting_feedback": [
        "string"
    ],
    "outliers": [
        "string"
    ],
    "confidence": 0.0
}}


VALIDATION RULES
================

- "cluster_id" must match the supplied cluster ID.
- "feedback_count" must equal the number of supplied feedback items.
- "supporting_feedback" must contain only feedback supplied above.
- "outliers" must contain only feedback supplied above.
- A feedback item must not appear in both arrays.
- Every supplied feedback item must be accounted for in either
  "supporting_feedback" or "outliers".
- "confidence" must be between 0 and 1.
- "theme_name" must be concise and product-manager-friendly.
- "summary" must be evidence-grounded.
- Do not add additional fields.
- Do not return Markdown.
- Do not return explanations outside the JSON.
""",
        expected_output=(
            "A valid JSON object containing cluster_id, theme_name, "
            "theme_type, summary, feedback_count, supporting_feedback, "
            "outliers, and confidence."
        ),
        agent=agent,
    )