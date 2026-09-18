from ai.llm.groq_client import create_groq_llm


llm = create_groq_llm()

response = llm.call(
    "Reply with exactly: Groq connection successful"
)

print(response)