from crewai import Agent, Task, Crew


def create_feature_request_agent(llm):

    return Agent(
        role="Senior Product Feature Analyst",

        goal=(
            "Identify genuine customer feature requests from "
            "product feedback and express the requested capability "
            "clearly and accurately."
        ),

        backstory=(
            "You are a senior Product Manager and Product Intelligence "
            "Analyst specializing in customer feedback analysis, "
            "feature discovery, and requirements analysis. "
            "You distinguish actual feature requests from complaints, "
            "questions, bugs, praise, and general feedback. "
            "You analyze the meaning of the feedback rather than "
            "relying only on keywords. "
            "Your analysis must remain strictly grounded in the "
            "customer feedback provided. "
            "You never invent product requirements, technical "
            "implementation details, business impact, urgency, "
            "or customer motivations."
        ),

        llm=llm,

        verbose=True,

        allow_delegation=False,
    )


def analyze_feature_requests(
    agent,
    feedback_items,
):

    feedback_text = "\n\n".join(
        [
            (
                f"Feedback ID: {item['feedback_id']}\n"
                f"Feedback Date: {item.get('date')}\n"
                f"Feedback: {item['content']}"
            )
            for item in feedback_items
        ]
    )

    task = Task(
        description=f"""
Analyze the following customer feedback.

Your task is to determine whether each feedback item
contains a genuine product feature request.

CUSTOMER FEEDBACK:
{feedback_text}

For every feedback item:

1. Identify whether it is a feature request.
2. If it is a feature request, extract the requested
   product capability.
3. Keep the feature request concise.
4. Preserve the customer's actual intent.
5. Do not invent functionality.
6. Do not infer technical implementation.
7. Do not infer business impact.
8. Do not infer priority or urgency.
9. Do not classify a complaint as a feature request
   unless the customer is actually requesting a new
   capability or change.
10. Keep the original feedback ID unchanged.
11. Do not modify or invent the feedback date.

A feature request is a request for a product capability,
feature, enhancement, integration, customization,
or product behavior change.

Return ONLY valid JSON.

Return a JSON array using exactly this structure:

[
    {{
        "feedback_id": "original feedback ID",
        "is_feature_request": true,
        "feature_request": "concise requested capability",
        "date": "original feedback date"
    }}
]

For non-feature feedback:

[
    {{
        "feedback_id": "original feedback ID",
        "is_feature_request": false,
        "feature_request": null,
        "date": "original feedback date"
    }}
]

Important:

- Include every feedback item.
- Do not omit feedback items.
- Keep feedback IDs exactly as provided.
- Keep dates exactly as provided.
- Do not add Markdown.
- Do not add explanations outside the JSON.
""",

        expected_output=(
            "A valid JSON array containing one analysis "
            "object for every provided feedback item."
        ),

        agent=agent,
    )

    crew = Crew(
        agents=[agent],
        tasks=[task],
        verbose=True,
    )

    result = crew.kickoff()

    return result