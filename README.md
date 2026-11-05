# BIAI AI-Powered CRM

An intelligent, multi-channel Customer Relationship Management (CRM) system built for **BIAI (Bangladesh Institute of AI)** to streamline admissions and corporate training enquiries across WhatsApp, Facebook, Website Forms, and Phone calls.

Built with **Next.js 16 (App Router + Tailwind CSS)** on the frontend, **FastAPI + SQLAlchemy** on the backend, and **MySQL 8.0** database with **Google Gemini / Heuristic AI** message parsing.

---

## 🚀 Key Features

1. **Kanban Pipeline Board:**
   - 5 Stages: `New` ➔ `Contacted` ➔ `Interested` ➔ `Paid` ➔ `Lost`
   - Instant 1-click stage advancement ($\leftarrow$ / $\rightarrow$) and full drag-and-drop workflow.

2. **Smart Language & Dialect Detection:**
   - **Banglish:** Automatically detects romanized Bangla (e.g. *"apnader 3 day bootcamp er price koto?"*) and crafts friendly, polite replies in Banglish.
   - **Bangla:** Detects Bengali script (e.g. *"ফেলোশিপ প্রোগ্রামে ভর্তি হতে চাই"*) and drafts formal replies in Bangla.
   - **English:** Detects English and drafts professional responses.

3. **Intelligent Enquiry Classification & Triage:**
   - Categorizes each enquiry into **Bootcamp**, **Fellowship**, **Corporate Training**, **Refund / Support**, **Job Application**, or **Spam**.
   - Tags priority: `URGENT` (e.g. angry refund threats), `HIGH` (enterprise corporate training), `NORMAL`, and `LOW` (spam).

4. **1-Click WhatsApp Direct Chat:**
   - Sales reps can click **"Open in WhatsApp"** (`wa.me/88017...`) with the AI-suggested response pre-filled into WhatsApp Web.

5. **48-Hour SLA Overdue Tracker:**
   - Automatically highlights leads waiting more than 48 hours without contact with a prominent `>48h` alert badge.

6. **Quick-Paste Single Message Box:**
   - Paste any raw incoming message from WhatsApp or Facebook to watch AI extract sender details, phone number, category, and draft the reply live. Includes quick demo buttons for testing.

7. **AI Executive Weekly Summary:**
   - Generates an executive summary of pipeline activity, top programs demanded, high-value corporate deals, and urgent follow-ups.

---

## 🛠️ How to Run Locally

### 1. Backend (FastAPI + MySQL)
```bash
cd backend

# 1. (Optional) Enter your MySQL password or Gemini API key in .env
# DB_PASSWORD=your_mysql_password
# GEMINI_API_KEY=your_gemini_key

# 2. Start the FastAPI server on port 8000
uv run uvicorn src.main:app --reload --port 8000
```
* Interactive API Documentation (Swagger): [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 2. Frontend (Next.js 16)
```bash
cd frontend

# Start the Next.js development server on port 3000
npm run dev
```
* Dashboard URL: [http://localhost:3000](http://localhost:3000)

---

## 📹 5-Minute Loom Video Guide
When presenting your solution for Round 2:
1. **The Problem:** Explain that enquiries get lost across WhatsApp, Facebook, and forms without visibility.
2. **The Pipeline Board:** Show the 20 sample enquiries already classified into stages.
3. **Bangla & Banglish Handling:** Show how a Banglish message gets a Banglish reply, and a Bangla message gets a Bangla reply.
4. **Live Quick Paste:** Paste a new message (using the quick demo button) and watch AI extract details in real-time.
5. **WhatsApp Click-to-Chat:** Show the button opening WhatsApp with the drafted reply.
6. **48h Overdue SLA & AI Weekly Summary:** Open the executive summary modal to show the management overview.
