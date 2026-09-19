from app.ai.llm import generate_ai_response


def ask_product_assistant(
    question: str,
    context: str = "",
) -> str:
    """
    Answer product-related questions using Groq AI.
    """

    prompt = f"""
You are an AI Product Manager Assistant.

Your job is to help product managers understand
customer feedback, product problems, feature requests,
priorities, and product requirements.

Use the provided product context when answering.

PRODUCT CONTEXT:
{context}

USER QUESTION:
{question}

Instructions:
1. Give a clear and useful answer.
2. Base the answer on the provided product context.
3. If the context does not contain enough information,
   clearly say that more data is needed.
4. Do not invent customer feedback or statistics.
5. Keep the answer practical and product-focused.
6. Use simple language.
"""

    return generate_ai_response(prompt)