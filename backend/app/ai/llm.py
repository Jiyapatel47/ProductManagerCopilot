import os

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY is not set in .env")

client = Groq(api_key=GROQ_API_KEY)

MODEL_NAME = "openai/gpt-oss-20b"


def generate_ai_response(prompt: str) -> str:
    """
    Send a prompt to Groq and return the generated text.
    """

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an AI Product Manager Assistant. "
                    "Analyze customer feedback carefully and return "
                    "structured, useful product insights."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        temperature=0.2,
        max_completion_tokens=8192,
        include_reasoning=False,
    )

    result = response.choices[0].message.content

    if result is None:
        result = ""

    result = result.strip()

    print("\n========== AI RESPONSE ==========")
    print(result)
    print("========== END AI RESPONSE ==========\n")

    return result