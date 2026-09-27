import os
from typing import List, Dict, Any
from dotenv import load_dotenv, find_dotenv
from tavily import TavilyClient

load_dotenv(find_dotenv())

def get_tavily_client() -> TavilyClient:
    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key or api_key == "your_tavily_api_key":
        raise ValueError("TAVILY_API_KEY is not configured in .env file.")
    return TavilyClient(api_key=api_key)

def perform_research(query: str, max_results: int = 5) -> Dict[str, Any]:
    """
    Search Tavily for web sources on the topic and structure the findings.
    Returns:
        {
            "sources": [{"title": ..., "url": ..., "snippet": ...}],
            "context": "formatted string for LLM"
        }
    """
    client = get_tavily_client()
    search_response = client.search(query=query, max_results=max_results)

    raw_results = search_response.get("results", [])
    sources: List[Dict[str, str]] = []
    context_blocks: List[str] = []

    for item in raw_results:
        title = item.get("title", "Untitled")
        url = item.get("url", "")
        content = item.get("content", "").strip()

        sources.append({
            "title": title,
            "url": url,
            "snippet": content[:300]
        })

        context_blocks.append(
            f"Source: {title}\nURL: {url}\nContent: {content}\n"
        )

    context_str = "\n---\n".join(context_blocks)
    if not context_str:
        context_str = "No specific online web results found. Use established knowledge."

    return {
        "sources": sources,
        "context": context_str
    }
