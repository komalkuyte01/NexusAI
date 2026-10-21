# Research & Report Agent (NexusAI)

An autonomous Multi-Agent Research and Publication-Grade Synthesis system built with FastAPI, LangChain, Tavily Search, Google Gemini, and a Next.js TypeScript web application.

## Key Features

- **Autonomous Multi-Agent Research Pipeline**: Performs multi-query web search, source deduplication, quality scoring, and structured synthesis.
- **Chat & History Archive**:
  - **Auto-Saved Sessions**: Automatically archives research sessions and chats for easy review and offline retrieval.
  - **Pin Important Chats**: Pin your favorite or crucial research sessions so they always stay anchored at the top of the history list with dedicated visual badges.
  - **History Checking & Quick Details**: Inspect key findings, claim support rates, citations coverage, and snippet previews directly inside the history drawer without losing your active research view.
  - **Filter & Search**: Quickly filter history by *Pinned*, *Executive Reports*, or *Academic Papers*, and perform real-time search across topics and contents.
  - **Archive Export**: Download your full chat and research history as a portable JSON file.
- **Publication-Grade Exports**: Clean Word-like PDF export (jsPDF), Word `.doc` HTML formatting, and Markdown downloads.
- **Fact-Checking & Quality Audit**: Claim-level evidence mapping, verified citation rates, and precision auditing.

## Architecture Overview

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, jsPDF.
- **Backend**: FastAPI, LangChain, Tavily Search API, Google Gemini.

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/komalkuyte01/research-report-agent.git
cd research-report-agent
```

### 2. Backend Setup
```bash
python -m venv venv

# Windows:
.\venv\Scripts\Activate.ps1
# Linux / macOS:
source venv/bin/activate

pip install -r backend/requirements.txt
```

Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key
TAVILY_API_KEY=your_tavily_api_key
```

Run the backend server:
```bash
python -B backend/main.py
```
Backend API will be active at `http://127.0.0.1:8000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

## How to Pin Chats & Check History

1. **Run Research**: Enter any topic in the research input. Once synthesized, the chat session is automatically saved to your history.
2. **Pin a Chat**:
   - In the active report view, click the **"Pin Chat"** button in the header or the floating action dock.
   - Or open the **History** drawer and click the pin icon next to any chat card to keep it at the top.
3. **Check History Details**:
   - Open the **History** drawer from the top navbar.
   - Use the **"Pinned"** tab to view all pinned chats.
   - Click **"Check Details"** on any session to view its summary metrics, citations list, and preview before opening.
