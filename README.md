# BIAI AI-Powered CRM

An intelligent, multi-channel Customer Relationship Management (CRM) system built for **BIAI (Bangladesh Institute of AI)** to streamline admissions and corporate training enquiries across WhatsApp, Facebook, Website Forms, and Phone calls.

Built with **Next.js 16 (App Router + Tailwind CSS)** on the frontend, **FastAPI + SQLAlchemy** on the backend, and **MySQL 8.0** database with **Google Gemini / Heuristic AI** message parsing.

---

##  Key Features

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
