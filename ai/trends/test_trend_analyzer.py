from ai.trends.trend_analyzer import calculate_feedback_trends


sample_feedback = [
    {
        "date": "2026-01-10",
        "source": "customer_feedback",
    },
    {
        "date": "2026-01-15",
        "source": "customer_feedback",
    },
    {
        "date": "2026-02-05",
        "source": "reviews",
    },
    {
        "date": "2026-02-20",
        "source": "support_ticket",
    },
    {
        "date": "2026-03-02",
        "source": "reviews",
    },
]


result = calculate_feedback_trends(
    sample_feedback
)


print("\nMONTHLY TRENDS")
print("=" * 40)

for trend in result["monthly_trends"]:
    print(
        trend["period"],
        "→",
        trend["feedback_count"],
    )


print("\nSOURCE DISTRIBUTION")
print("=" * 40)

for source in result["source_distribution"]:
    print(
        source["source"],
        "→",
        source["count"],
    )


print("\nSUMMARY")
print("=" * 40)

print(
    "Dated feedback:",
    result["total_dated_feedback"],
)

print(
    "Undated feedback:",
    result["undated_feedback"],
)