# Research & Report Agent

An autonomous Multi-Agent Research and Report Generation system built with LangChain, OpenAI, Tavily Search, and Streamlit.

## Features
- Multi-Agent research workflow
- Web search & intelligent scraping with Tavily, BeautifulSoup, and Trafilatura
- Synthesis and report generation
- Interactive Streamlit user interface

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/komalkuyte01/research-report-agent.git
   cd research-report-agent
   ```

2. **Create and activate virtual environment:**
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\Activate.ps1
   # On Linux/macOS:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Variables:**
   Create a `.env` file in the project root and add your API keys:
   ```env
   OPENAI_API_KEY=your_openai_api_key
   TAVILY_API_KEY=your_tavily_api_key
   ```


5. **Run the application:**
   ```bash
   streamlit run app.py
   ```
