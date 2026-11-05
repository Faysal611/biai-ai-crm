import os
import json
import re
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

SYSTEM_INSTRUCTION = """
You are an intelligent CRM AI assistant for BIAI (Bangladesh Institute of AI).
BIAI offers:
1. AI Bootcamp (hands-on short bootcamp for students and professionals)
2. AI Fellowship (in-depth fellowship program)
3. Corporate Training (custom AI upskilling for banks, garments, textiles, and enterprises)

Your task:
Analyze incoming customer messages from WhatsApp, Facebook Messenger, Website Forms, and Phone Call Notes.
Messages can be written in Bangla (বাংলা), Banglish (Bangla in English alphabet, e.g. "apnader price koto?"), or English.

Extract the following JSON structure:
{
  "sender_name": "Extracted name if present in text, otherwise empty string",
  "phone": "Extracted Bangladeshi phone number (e.g. 017..., 018...) if present, otherwise null",
  "category": "One of: 'Bootcamp', 'Fellowship', 'Corporate Training', 'Refund / Support', 'Job Application', 'Spam', 'General Inquiry'",
  "detected_language": "One of: 'Bangla', 'Banglish', 'English'",
  "priority": "One of: 'Urgent' (for angry customers, refund threats), 'High' (corporate enterprise leads, serious admissions), 'Normal', 'Low' (spam)",
  "suggested_reply": "A warm, polite, professional response. MUST MATCH THE LANGUAGE AND DIALECT OF THE MESSAGE:
     - If message is in Banglish, reply in natural, polite Banglish.
     - If message is in Bangla script, reply in polite Bangla.
     - If message is in English, reply in professional English.
     - For Spam, leave suggested_reply empty or write 'No reply needed'.",
  "reasoning": "A concise 1-sentence explanation of why you categorized it this way."
}

Return ONLY valid JSON.
"""

# Gemini models in order of priority
CANDIDATE_MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-2.5-flash",
    "gemini-3.8-flash",
]

def _call_gemini(prompt: str) -> Optional[str]:
    """Call Google Gemini API using the official google-genai SDK."""
    if not GEMINI_API_KEY:
        return None
    try:
        from google import genai
        client = genai.Client(api_key=GEMINI_API_KEY)

        for model_name in CANDIDATE_MODELS:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config={
                        "system_instruction": SYSTEM_INSTRUCTION,
                        "response_mime_type": "application/json",
                        "temperature": 0.2,
                    }
                )
                if response and response.text:
                    return response.text
            except Exception as model_err:
                # Try next model candidate if temporary 503 or error
                continue
        return None
    except Exception as e:
        print(f"[ERROR] Gemini client failure: {e}")
        return None


def process_message_with_ai(raw_text: str, channel: str = "WhatsApp", existing_sender: str = "", existing_phone: str = "") -> Dict[str, Any]:
    """Analyze a customer message using Google Gemini."""
    prompt = f"""
Incoming Channel: {channel}
Known Sender: {existing_sender}
Known Phone: {existing_phone}
Customer Message:
\"\"\"{raw_text}\"\"\"

Analyze this enquiry and return JSON according to instructions.
"""
    raw_response = _call_gemini(prompt)

    if raw_response:
        try:
            cleaned = re.sub(r"^```json\s*", "", raw_response.strip(), flags=re.MULTILINE)
            cleaned = re.sub(r"```$", "", cleaned.strip(), flags=re.MULTILINE)
            data = json.loads(cleaned)

            if existing_sender and not data.get("sender_name"):
                data["sender_name"] = existing_sender
            if existing_phone and not data.get("phone"):
                data["phone"] = existing_phone
            return data
        except Exception as e:
            print(f"[WARNING] Could not parse Gemini JSON: {e}")


def generate_weekly_summary(enquiries: List[Dict[str, Any]]) -> str:
    """Generate an executive weekly summary of all CRM leads with Gemini."""
    if not enquiries:
        return "No enquiries logged yet to summarize."

    summary_context = [
        f"- ID {e.get('id')}: {e.get('sender_name')} ({e.get('channel')}) | Category: {e.get('category')} | Status: {e.get('status')} | Message: {e.get('raw_message')[:100]}"
        for e in enquiries
    ]
    leads_text = "\n".join(summary_context)

    prompt = f"""
Here is a list of customer enquiries logged in the BIAI CRM:
{leads_text}

Generate a concise Executive Weekly CRM Summary for BIAI management:
1. Executive Overview (Total leads, breakdown by course/category)
2. High-Value Opportunities (Corporate leads, immediate revenue)
3. Urgent Action Items (Refunds, complaints, overdue follow-ups)
4. Recommended Next Steps for the Sales Team

Format in clean Markdown with bullet points.
"""

    if GEMINI_API_KEY:
        try:
            from google import genai
            client = genai.Client(api_key=GEMINI_API_KEY)
            for m in CANDIDATE_MODELS:
                try:
                    resp = client.models.generate_content(model=m, contents=prompt)
                    if resp and resp.text:
                        return resp.text
                except Exception:
                    continue
        except Exception as e:
            print(f"[ERROR] Gemini weekly summary failed: {e}")

    total = len(enquiries)
    bootcamp = sum(1 for e in enquiries if "Bootcamp" in str(e.get("category", "")))
    fellowship = sum(1 for e in enquiries if "Fellowship" in str(e.get("category", "")))
    corporate = sum(1 for e in enquiries if "Corporate" in str(e.get("category", "")))
    urgent = sum(1 for e in enquiries if e.get("priority") == "Urgent")

    return f"""### 📊 BIAI Weekly CRM Summary (Auto-Generated)
- **Total Inquiries Processed:** {total}
- **Programs Breakdown:**
  - 🚀 **Bootcamp:** {bootcamp} inquiries
  - 🎓 **Fellowship:** {fellowship} inquiries
  - 🏢 **Corporate Training:** {corporate} enterprise leads (High Value!)
- **⚠️ Urgent Issues:** {urgent} (Refund / angry customer escalated)
- **Key Action:** Prioritize calls to corporate leads and address refund concerns immediately.
"""
