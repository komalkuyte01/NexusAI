import sys
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from models import ResearchRequest, ResearchResponse, SourceItem
from research import perform_research
from report import generate_report

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

app = FastAPI(
    title="AI Research & Report Generator API",
    description="Minimal, interview-ready backend using FastAPI, LangChain, and Tavily to research topics and generate reports.",
    version="1.0.0"
)

# Enable CORS so any frontend (HTML, Tailwind CSS, JS) can connect without issues
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    """Health check endpoint confirming API status."""
    return {
        "status": "online",
        "service": "AI Research & Report Generator API",
        "version": "1.0.0",
        "endpoints": {
            "research": "POST /research",
            "docs": "GET /docs"
        }
    }

@app.post("/research", response_model=ResearchResponse)
def research_endpoint(request: ResearchRequest):
    """
    Perform web research with Tavily and generate a structured report via LangChain.
    """
    try:
        # Step 1: Web Research via Tavily
        research_data = perform_research(query=request.topic, max_results=5)
        sources_list = [SourceItem(**s) for s in research_data["sources"]]

        # Step 2: Report Generation via LangChain
        generated_content = generate_report(
            topic=request.topic,
            research_context=research_data["context"],
            report_type=request.report_type,
            requirements=request.requirements,
            custom_format=request.custom_format
        )

        return ResearchResponse(
            topic=request.topic,
            report_type=request.report_type,
            sources=sources_list,
            content=generated_content,
            created_at=datetime.utcnow().isoformat() + "Z"
        )

    except ValueError as e:
        # Configuration or missing API key errors
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # General unhandled exceptions
        raise HTTPException(
            status_code=500,
            detail=f"Error generating research report: {str(e)}"
        )

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)