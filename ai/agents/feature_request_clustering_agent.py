from crewai import Agent, Task, Crew


def create_feature_request_clustering_agent(llm):

    return Agent(
        role="Senior Feature Request Analyst",

        goal=(
            "Analyze semantically grouped customer feature requests "
            "and consolidate each group into a clear, meaningful "
            "product-level feature request while preserving the "
            "actual intent expressed by customers."
        ),

        backstory=(
            "You are a senior Product Manager and Product Intelligence "
            "Analyst specializing in customer feedback analysis, "
            "feature discovery, and requirements analysis. "
            "You analyze groups of semantically related customer "
            "requests and determine the common capability they are "
            "asking for. You consolidate duplicate or closely related "
            "requests without losing important details. "
            "Your analysis is strictly grounded in the provided "
            "customer requests. You never invent requirements, "
            "technical implementation details, business impact, "
            "priority, urgency, or customer motivations."
        ),

        llm=llm,

        verbose=True,

        allow_delegation=False,
    )


def analyze_feature_request_cluster(
    agent,
    cluster_id,
    feature_requests,
):

    requests_text = "\n".join(
        [
            (
                f"Feedback ID: {item['feedback_id']}\n"
                f"Feedback Date: {item.get('date')}\n"
                f"Feature Request: {item['feature_request']}"
            )
            for item in feature_requests
        ]
    )

    task = Task(
        description=f"""
Analyze Feature Request Cluster {cluster_id}.

The requests below have already been grouped using
semantic similarity.

Your job is to understand what common product capability
the customers are requesting.

CUSTOMER FEATURE REQUESTS:

{requests_text}

Produce ONE consolidated feature request for this cluster.

Rules:

1. Identify the common underlying requested capability.

2. Consolidate duplicate or closely related requests.

3. Preserve meaningful differences between requests.

4. Do not simply copy one request when multiple related
   requests exist.

5. Do not invent requirements.

6. Do not infer technical implementation details.

7. Do not infer business impact.

8. Do not infer priority or urgency.

9. Do not infer customer motivations unless explicitly
   stated in the feedback.

10. Feature name must be concise and understandable
    to a Product Manager.

11. Summary must explain what customers are requesting.

12. Include the number of original requests.

13. Include the original feature request text as evidence.

14. Confidence represents how confidently the requests
    belong to one coherent feature group.

15. Feedback dates are evidence only.

16. Do not modify, generate, estimate, or invent dates.

17. Do not use dates to determine priority.

Return ONLY valid JSON exactly:

{{
    "cluster_id": {cluster_id},
    "feature_name": "...",
    "summary": "...",
    "request_count": 0,
    "supporting_requests": ["..."],
    "confidence": 0.0
}}

Confidence must be between 0 and 1.

No Markdown.

No explanation outside JSON.
""",

        expected_output=(
            "A single valid JSON object representing the "
            "consolidated feature request for this cluster."
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