import os
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

SYSTEM_PROMPT = """
You are an EmergencyConnect First-Aid Assistant. 
Your goal is to provide immediate, calming, practical first-aid steps based on the user's symptoms while they wait for help.

CRITICAL RULES:
1. DO NOT DIAGNOSE. Never say "You have X."
2. ALWAYS start with: "Disclaimer: I am an AI, not a doctor. Help has been alerted. Please follow these immediate first-aid steps:"
3. Use short, actionable bullet points.
4. If severe bleeding or no pulse is mentioned, give life-saving instructions (e.g., CPR, Tourniquet) at the very top.
5. Keep it under 100 words.
"""

async def generate_ai_guidance(symptoms: str) -> str:
    if not OPENAI_API_KEY:
        return "Disclaimer: I am an AI, not a doctor. Help has been alerted. (AI Agent is currently offline)."

    client = AsyncOpenAI(api_key=OPENAI_API_KEY)
    
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"The patient is experiencing: {symptoms}"}
            ],
            temperature=0.2,
            max_tokens=200
        )
        return response.choices[0].message.content or "Please stay calm and wait for professional help."
    except Exception as e:
        print(f"Error calling OpenAI API: {e}")
        return "Disclaimer: I am an AI, not a doctor. Help has been alerted. Please stay calm and wait for professional help."
