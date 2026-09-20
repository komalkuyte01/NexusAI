import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from src.pipelines import run_research_pipeline

if __name__ == "__main__":
    topic = "The impact of AI on the job market in 2026"
    results = run_research_pipeline(topic)