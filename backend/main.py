import sys
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from models import ResearchRequest, ResearchResponse, SourceItem
from research import perform_research
from report import generate_report
from verification import evaluate_research_claims_and_metrics
from prompt_parser import extract_prompt_instructions

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

app = FastAPI(
    title="NexusAI - Autonomous Research & Report Generator API",
    description="Enterprise-grade autonomous deep research and synthesis backend using FastAPI, LangChain, Tavily, and multi-model LLMs.",
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
    Extracts custom formatting and length/word count mandates from the prompt if present.
    """
    try:
        # Step 0: Extract clean topic, target length, and custom format from user query
        cleaned_topic, extracted_reqs, extracted_format = extract_prompt_instructions(request.topic)

        # Merge user-provided requirements and format with extracted ones
        req_parts = []
        if extracted_reqs:
            req_parts.append(extracted_reqs)
        if request.requirements and request.requirements.strip():
            req_parts.append(request.requirements.strip())
        final_requirements = "\n\n".join(req_parts) if req_parts else None

        final_format = (
            request.custom_format.strip()
            if request.custom_format and request.custom_format.strip()
            else extracted_format
        )

        # Step 1: Web Research via Tavily using cleaned topic for highest signal grounding
        research_data = perform_research(
            query=cleaned_topic,
            max_results=6,
            report_type=request.report_type
        )
        sources_list = [SourceItem(**s) for s in research_data["sources"]]

        # Step 2: Report Generation via LangChain with custom formatting and word count adherence
        generated_content = generate_report(
            topic=cleaned_topic,
            research_context=research_data["context"],
            report_type=request.report_type,
            requirements=final_requirements,
            custom_format=final_format,
            user_gemini_key=request.gemini_api_key
        )

        # Step 3: Claim Verification and Quality Metrics Evaluation
        claims, metrics = evaluate_research_claims_and_metrics(
            content=generated_content,
            sources=sources_list
        )

        return ResearchResponse(
            topic=cleaned_topic,
            report_type=request.report_type,
            sources=sources_list,
            content=generated_content,
            created_at=datetime.utcnow().isoformat() + "Z",
            claims=claims,
            metrics=metrics
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