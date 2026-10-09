import re
from typing import List, Dict, Any, Tuple
from models import ClaimItem, QualityMetrics, SourceItem

def extract_candidate_claims(content: str, max_claims: int = 5) -> List[str]:
    """
    Extract factual claims containing numbers, percentages, dates, or key assertions.
    """
    sentences = re.split(r"(?<=[.!?])\s+", content)
    claims: List[str] = []

    # Priority patterns: sentences with numbers, years, percentages, or strong assertions
    priority_patterns = [
        r"\b\d+(\.\d+)?%\b",                    # percentages: 45%, 3.5%
        r"\b(19\d\d|20\d\d)\b",                 # years: 2024, 2026
        r"\$\s*\d+",                            # dollar amounts
        r"\b(increased|decreased|exceeded|outperformed|adopted|deployed|reported)\b",
        r"\b(according to|found that|demonstrated|concluded)\b"
    ]

    for sentence in sentences:
        s = sentence.strip().replace("#", "").replace("*", "")
        if len(s) < 30 or len(s) > 250:
            continue
        # Avoid section headers
        if s.lower().startswith("chapter") or s.lower().startswith("section") or s.endswith(":"):
            continue

        if any(re.search(pat, s, re.IGNORECASE) for pat in priority_patterns):
            claims.append(s)
            if len(claims) >= max_claims:
                break

    # If no priority pattern found, take the most substantial sentences
    if not claims:
        for sentence in sentences:
            s = sentence.strip().replace("#", "").replace("*", "")
            if 40 <= len(s) <= 200 and not s.endswith(":"):
                claims.append(s)
                if len(claims) >= max_claims:
                    break

    return claims

def verify_claim_against_evidence(
    claim: str,
    sources: List[SourceItem]
) -> ClaimItem:
    """
    Cross-examine a claim against collected source evidence passages.
    Check numbers, years, and key terms to assign one of:
    'Verified', 'Partially Verified', 'Conflicting Evidence', 'Unverified'.
    """
    claim_words = set(re.findall(r"\b[a-zA-Z]{4,}\b", claim.lower()))
    claim_numbers = set(re.findall(r"\b\d+(?:\.\d+)?%?\b", claim))

    best_match_url = None
    best_match_snippet = ""
    max_overlap = 0
    number_matched = False
    conflict_detected = False

    for source in sources:
        snippet_text = source.snippet.lower()
        snippet_numbers = set(re.findall(r"\b\d+(?:\.\d+)?%?\b", source.snippet))

        overlap = len(claim_words.intersection(set(re.findall(r"\b[a-zA-Z]{4,}\b", snippet_text))))
        
        if overlap > max_overlap:
            max_overlap = overlap
            best_match_url = source.url
            best_match_snippet = source.snippet

            # Check if numerical values align
            if claim_numbers:
                # Distinguish metrics/percentages from standard 4-digit years
                claim_metrics = {n for n in claim_numbers if "%" in n or len(n) < 4}
                snippet_metrics = {n for n in snippet_numbers if "%" in n or len(n) < 4}

                if claim_metrics and snippet_metrics and not claim_metrics.intersection(snippet_metrics):
                    conflict_detected = True
                elif claim_numbers.issubset(snippet_numbers):
                    number_matched = True
                elif claim_numbers.intersection(snippet_numbers):
                    # Partially matched numbers
                    number_matched = True
                elif snippet_numbers:
                    conflict_detected = True

    # Determine Status
    overlap_ratio = (max_overlap / max(1, len(claim_words)))

    if conflict_detected and overlap_ratio >= 0.35:
        status = "Conflicting Evidence"
        explanation = "Retrieved sources present divergent numerical metrics or contradictory findings on this point."
    elif overlap_ratio >= 0.45 and (number_matched or not claim_numbers):
        status = "Verified"
        explanation = "Claim directly supported by verified source passage with consistent entities and metrics."
    elif overlap_ratio >= 0.25:
        status = "Partially Verified"
        explanation = "Contextual support found, but specific numerical or temporal parameters require primary literature verification."
    else:
        status = "Unverified"
        explanation = "Insufficient direct corroboration in retrieved search snippets."
        best_match_snippet = best_match_snippet or "No matching excerpt found in collected passages."

    return ClaimItem(
        claim=claim,
        evidence=best_match_snippet[:300] if best_match_snippet else "Evidence excerpt unavailable.",
        source_url=best_match_url,
        verification_status=status,
        explanation=explanation
    )

def evaluate_research_claims_and_metrics(
    content: str,
    sources: List[SourceItem]
) -> Tuple[List[ClaimItem], QualityMetrics]:
    """
    Extract claims from generated text, verify them against evidence passages,
    and compute standard evaluation metrics:
    - Claim Support Rate
    - Citation Precision
    - Citation Coverage
    - Source Verification Rate
    """
    candidate_claims = extract_candidate_claims(content, max_claims=6)
    claim_items: List[ClaimItem] = []

    supported_count = 0
    for c in candidate_claims:
        item = verify_claim_against_evidence(c, sources)
        claim_items.append(item)
        if item.verification_status == "Verified":
            supported_count += 1.0
        elif item.verification_status == "Partially Verified":
            supported_count += 0.5

    total_claims = len(claim_items)
    total_sources = len(sources)

    # 1. Claim Support Rate = (Supported Claims / Total Evaluated Claims) * 100
    claim_support_rate = round((supported_count / total_claims * 100), 1) if total_claims > 0 else 100.0

    # 2. Source Verification Rate = (Sources Passing Checks / Total Sources) * 100
    verified_sources = sum(1 for s in sources if getattr(s, "is_verified", True))
    source_verification_rate = round((verified_sources / total_sources * 100), 1) if total_sources > 0 else 100.0

    # 3. Citation Coverage = Percentage of claims requiring citations that cite valid sources
    cited_claims = sum(1 for item in claim_items if item.source_url)
    citation_coverage = round((cited_claims / total_claims * 100), 1) if total_claims > 0 else 100.0

    # 4. Citation Precision = Percentage of citations that actually support the claim
    supporting_citations = sum(1 for item in claim_items if item.verification_status in ["Verified", "Partially Verified"])
    citation_precision = round((supporting_citations / max(1, cited_claims) * 100), 1) if cited_claims > 0 else 100.0

    metrics = QualityMetrics(
        claim_support_rate=claim_support_rate,
        citation_precision=citation_precision,
        citation_coverage=citation_coverage,
        source_verification_rate=source_verification_rate,
        total_claims_evaluated=total_claims,
        total_sources_evaluated=total_sources,
        summary_notes=(
            f"Evaluated {total_claims} core factual claims against {total_sources} independent web evidence references. "
            f"{int(supported_count)} claims substantiated with direct or partial evidence alignment."
        )
    )

    return claim_items, metrics
