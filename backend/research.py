import os
import re
from typing import List, Dict, Any, Optional, Set
from urllib.parse import urlparse, urlunparse, parse_qsl, urlencode
from dotenv import load_dotenv, find_dotenv
from tavily import TavilyClient

load_dotenv(find_dotenv())

# Trusted Academic & Institutional Domain Whitelist Patterns
ACADEMIC_GOV_DOMAINS = {
    "arxiv.org", "nature.com", "ieee.org", "sciencedirect.com", "acm.org",
    "nih.gov", "nist.gov", "ncbi.nlm.nih.gov", "mit.edu", "stanford.edu",
    "harvard.edu", "ox.ac.uk", "cam.ac.uk", "springer.com", "wiley.com",
    "biorxiv.org", "medrxiv.org", "frontiersin.org", "cell.com", "science.org"
}

REPUTABLE_PUBLISHERS = {
    "reuters.com", "bloomberg.com", "wsj.com", "ft.com", "bbc.com",
    "apnews.com", "economist.com", "technologyreview.com", "wired.com"
}

def get_tavily_client() -> TavilyClient:
    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key or api_key == "your_tavily_api_key":
        raise ValueError("TAVILY_API_KEY is not configured in .env file.")
    return TavilyClient(api_key=api_key)

def normalize_url(raw_url: str) -> str:
    """Strip tracking query parameters, hashes, and trailing slashes for canonical matching."""
    if not raw_url:
        return ""
    try:
        parsed = urlparse(raw_url.strip())
        # Filter out common marketing/tracking parameters
        filtered_query = [
            (k, v) for k, v in parse_qsl(parsed.query)
            if not k.startswith("utm_") and k not in {"ref", "fbclid", "gclid", "source", "trk"}
        ]
        clean_query = urlencode(filtered_query)
        clean_path = parsed.path.rstrip("/") if parsed.path != "/" else "/"
        return urlunparse((
            parsed.scheme.lower(),
            parsed.netloc.lower(),
            clean_path,
            "",
            clean_query,
            ""  # drop fragment #
        ))
    except Exception:
        return raw_url.strip()

def evaluate_source_quality(domain: str) -> tuple[float, str, bool]:
    """
    Score source authority and assign quality tier.
    Returns: (quality_score: float, quality_tier: str, is_verified: bool)
    """
    domain = domain.lower().replace("www.", "")

    if domain.endswith(".edu") or domain.endswith(".gov") or domain in ACADEMIC_GOV_DOMAINS:
        return (1.0, "Academic / Peer-Reviewed / Official", True)
    
    if any(domain.endswith("." + ext) for ext in ["org", "int"]) or domain in REPUTABLE_PUBLISHERS:
        return (0.85, "Reputable Institutional / Publisher", True)
    
    if domain.endswith(".com") or domain.endswith(".io") or domain.endswith(".ai"):
        return (0.70, "Industry / Commercial Publication", True)
        
    return (0.60, "General Web Reference", False)

def perform_research(
    query: str,
    max_results: int = 6,
    report_type: str = "report"
) -> Dict[str, Any]:
    """
    Multi-stage autonomous web research:
    1. Multi-query expansion (academic vs executive).
    2. Tavily retrieval with advanced depth.
    3. URL canonicalization and duplicate removal.
    4. Text quality validation (filter low-signal/404 snippets).
    5. Domain authority evaluation.
    """
    client = get_tavily_client()
    clean_query = query.strip()

    search_queries = [clean_query]
    if report_type == "research_paper":
        search_queries.append(f"{clean_query} empirical research analysis methodology")
    else:
        search_queries.append(f"{clean_query} market analysis key findings challenges")

    raw_results: List[Dict[str, Any]] = []

    for q in search_queries[:2]:
        try:
            res = client.search(
                query=q,
                max_results=max_results,
                include_answer=False,
                search_depth="advanced"
            )
            raw_results.extend(res.get("results", []))
        except Exception:
            # Fallback to single basic search if advanced fails
            try:
                res = client.search(query=clean_query, max_results=max_results)
                raw_results.extend(res.get("results", []))
                break
            except Exception as search_err:
                # If tavily error occurs, re-raise to handle gracefully
                raise search_err

    sources: List[Dict[str, Any]] = []
    context_blocks: List[str] = []
    seen_urls: Set[str] = set()
    seen_snippets: Set[str] = set()

    for item in raw_results:
        raw_url = item.get("url", "")
        norm_url = normalize_url(raw_url)

        if not norm_url or norm_url in seen_urls:
            continue

        title = item.get("title", "Untitled Document").strip()
        content = item.get("content", "").strip()

        # Discard empty, near-empty, or obvious error snippets
        if len(content) < 40 or "404 Not Found" in content or "Access Denied" in content:
            continue

        # Detect near-duplicate text content
        snippet_fingerprint = re.sub(r"\W+", "", content[:100]).lower()
        if snippet_fingerprint in seen_snippets:
            continue

        seen_urls.add(norm_url)
        seen_snippets.add(snippet_fingerprint)

        # Domain & quality evaluation
        parsed_url = urlparse(norm_url)
        domain = parsed_url.netloc.replace("www.", "")
        quality_score, quality_tier, is_verified = evaluate_source_quality(domain)
        published_date = item.get("published_date") or None

        source_obj = {
            "title": title,
            "url": norm_url,
            "snippet": content[:350],
            "domain": domain,
            "published_date": published_date,
            "quality_score": quality_score,
            "quality_tier": quality_tier,
            "is_verified": is_verified
        }
        sources.append(source_obj)

        date_str = f"Date: {published_date} | " if published_date else ""
        context_blocks.append(
            f"Source [{len(sources)}]: {title}\n"
            f"URL: {norm_url}\n"
            f"Domain Authority: {quality_tier} (Score: {quality_score})\n"
            f"{date_str}Content: {content}\n"
        )

        if len(sources) >= max_results:
            break

    context_str = "\n---\n".join(context_blocks)
    if not context_str:
        context_str = "No verified online web results found. Flag research limitations in the final document."

    return {
        "sources": sources,
        "context": context_str
    }
