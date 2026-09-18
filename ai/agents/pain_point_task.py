from crewai import Task


def create_pain_point_task(agent, theme_data):
    pain_point_task = Task(
        description=f"""
You are analyzing a product theme extracted from real customer
feedback.

Your responsibility is to identify the underlying customer pain
point represented by the provided theme and supporting evidence.

THEME DATA:
{theme_data}

ANALYSIS RULES:

1. Understand the theme before identifying the pain point.

2. Identify the underlying customer problem, not merely a
   repeated keyword or symptom.

   Example:

   Feedback:
   "Login keeps timing out."
   "I can't sign in."
   "Authentication errors when logging in."

   Weak interpretation:
   "Login timeout."

   Better pain point:
   "Customers are unable to reliably access their accounts
   because login attempts fail or time out."

3. Distinguish between:

   - Symptom:
     What the customer directly observes.

   - Pain point:
     The problem or difficulty experienced by the customer.

   - Technical cause:
     Why the problem may be happening.

   Do NOT infer or invent technical causes.

4. Base every conclusion strictly on the provided theme and
   customer feedback.

5. Do not invent:

   - technical causes
   - customer motivations
   - business impact
   - urgency
   - frequency beyond the provided evidence
   - severity
   - solutions
   - product requirements
   - implementation details

6. Preserve the original meaning of customer feedback.

7. supporting_feedback must contain only exact original
   feedback statements provided in the theme data.

8. Do not rewrite, summarize, correct, or modify supporting
   customer feedback.

9. Do not use a customer statement as evidence if it does not
   actually support the identified pain point.

10. feedback_count must represent the number of customer
    feedback items supporting the identified pain point.

11. If the theme contains a genuine customer problem, identify
    the clearest underlying pain point supported by the evidence.

12. If the theme is primarily a positive experience, general
    experience, or feature request without an underlying
    customer problem, return:

    "No clear pain point identified."

13. A feature request should not automatically be treated as
    a pain point.

    Example:

    "Please add dark mode."

    This is a feature request.

    Only identify a pain point if the provided evidence also
    demonstrates a customer problem, such as difficulty using
    the interface because of poor visibility or contrast.

14. Do not merge this theme with another theme.

15. Do not perform prioritization or ranking.

16. Do not assign business impact or severity.

17. Do not recommend a solution.

18. Do not generate a PRD, user story, acceptance criteria,
    roadmap item, or product requirement.

PAIN POINT TYPE:

Choose exactly one:

- access_issue
- usability_issue
- reliability_issue
- performance_issue
- billing_issue
- missing_capability
- other
- none

Use "none" when no clear customer pain point is supported.

CONFIDENCE:

Confidence must represent only the strength of evidence
supporting the identified pain point.

Use:

- 0.90 - 1.00:
  Very strong and consistent evidence.

- 0.75 - 0.89:
  Strong evidence with minor ambiguity.

- 0.50 - 0.74:
  Moderate or partially ambiguous evidence.

- Below 0.50:
  Weak evidence.

Do not increase confidence simply because the theme itself has
a high theme-extraction confidence.

OUTPUT:

Return exactly one valid JSON object.

Use this structure:

{{
    "cluster_id": <integer>,
    "theme_name": "<original theme name>",
    "pain_point": "<underlying customer pain point or No clear pain point identified.>",
    "pain_point_type": "<access_issue|usability_issue|reliability_issue|performance_issue|billing_issue|missing_capability|other|none>",
    "summary": "<short evidence-grounded explanation>",
    "supporting_feedback": [
        "<exact original feedback>",
        "<exact original feedback>"
    ],
    "feedback_count": <integer>,
    "confidence": <number between 0 and 1>
}}

OUTPUT REQUIREMENTS:

- Return JSON only.
- Do not return Markdown.
- Do not add commentary outside the JSON object.
- Do not use code fences.
- Do not invent evidence.
- Do not modify customer feedback.
- Do not merge clusters.
- Do not prioritize pain points.
- Do not recommend solutions.
""",

        expected_output=(
            "Exactly one valid JSON object containing the "
            "evidence-grounded customer pain point, its type, "
            "supporting customer feedback, feedback count, "
            "and calibrated confidence."
        ),

        agent=agent,
    )

    return pain_point_task