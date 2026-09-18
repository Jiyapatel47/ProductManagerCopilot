from crewai import Crew, Process

from ai.agents.theme_extraction_agent import create_theme_extraction_agent
from ai.agents.theme_extraction_task import create_theme_extraction_task
from ai.llm.groq_client import create_groq_llm


# --------------------------------------------------
# 1. Create the Groq LLM
# --------------------------------------------------

llm = create_groq_llm()


# --------------------------------------------------
# 2. Create the Theme Extraction Agent
# --------------------------------------------------

theme_agent = create_theme_extraction_agent(llm)


# --------------------------------------------------
# 3. Test with one real feedback cluster
# --------------------------------------------------

cluster_id = 3

cluster_feedback = [
    "Login keeps timing out when I try to sign in.",
    "I can't sign in to my account.",
    "Getting authentication errors when logging in.",
]


# --------------------------------------------------
# 4. Create the Theme Extraction Task
# --------------------------------------------------

theme_task = create_theme_extraction_task(
    agent=theme_agent,
    cluster_id=cluster_id,
    cluster_feedback=cluster_feedback,
)


# --------------------------------------------------
# 5. Create CrewAI Crew
# --------------------------------------------------

crew = Crew(
    agents=[theme_agent],
    tasks=[theme_task],
    process=Process.sequential,
    verbose=True,
)


# --------------------------------------------------
# 6. Run the agent
# --------------------------------------------------

result = crew.kickoff()


# --------------------------------------------------
# 7. Display the result
# --------------------------------------------------

print("\n")
print("=" * 70)
print("THEME EXTRACTION RESULT")
print("=" * 70)
print(result)
print("=" * 70)
