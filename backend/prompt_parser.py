import re
from typing import Tuple, Optional

def extract_prompt_instructions(raw_topic: str) -> Tuple[str, Optional[str], Optional[str]]:
    """
    Intelligently parses user prompt to extract:
    1. Cleaned core topic (for search grounding and professional document title)
    2. Extracted requirements (e.g. target word count, depth, table requests)
    3. Extracted custom formatting (e.g. user-specified section outlines)
    """
    if not raw_topic:
        return "Research Topic", None, None

    text = raw_topic.strip()
    extracted_reqs = []
    extracted_format = None

    # 1. Custom Sections / Outline detection
    # Example: "AI Agents in Banking with sections: Overview, Architecture, Regulatory Challenges, Conclusion"
    sections_match = re.search(
        r'(?:with\s+sections?|custom\s+sections?|custom\s+outline|sections?:\s*)\s*[:\-]?\s*(.+)$',
        text,
        re.IGNORECASE
    )
    if sections_match:
        raw_sections = sections_match.group(1).strip()
        sec_list = [s.strip() for s in re.split(r'[,;]|\band\b', raw_sections) if s.strip()]
        if len(sec_list) >= 2:
            formatted_secs = "\n\n".join([f"## {s}" for s in sec_list])
            extracted_format = f"# [Topic Title]\n\n{formatted_secs}\n\n## References"
            text = text[:sections_match.start()].strip()

    # 2. Word Count / Target Length extraction
    # Example: "5000 words", "5k words", "with 4000 words", "in 3k words"
    wc_pattern = r'(?:(?:with|in|around|about|approximately|target|of|min|at least)\s+)?(\d+(?:,\d+)?|\d+(?:\.\d+)?k)\s*(?:[- ]?\s*(?:words?|w\b))'
    wc_match = re.search(wc_pattern, text, re.IGNORECASE)
    if wc_match:
        val_str = wc_match.group(1).lower().replace(',', '')
        if val_str.endswith('k'):
            words = int(float(val_str[:-1]) * 1000)
        else:
            words = int(val_str)
        extracted_reqs.append(
            f"TARGET LENGTH: Approximately {words:,} words. Provide deep, comprehensive empirical analysis, thorough multi-paragraph sections (###), comparative tables, and extensive coverage."
        )
        text = re.sub(wc_pattern, '', text, flags=re.IGNORECASE)

    # 3. Format requests (e.g., comparison table, SWOT, bullet points)
    if re.search(r'\b(?:comparison\s+table|table\s+format|in\s+tables?)\b', text, re.IGNORECASE):
        extracted_reqs.append("Include structured markdown comparison tables for key findings and evaluation.")
        text = re.sub(r'(?:with|including|include)?\s*(?:a\s+)?(?:structured\s+)?(?:comparison\s+table|table\s+format|in\s+tables?)\s*', '', text, flags=re.IGNORECASE)

    if re.search(r'\b(?:swot\s+analysis|swot)\b', text, re.IGNORECASE):
        extracted_reqs.append("Include a comprehensive SWOT analysis matrix.")
        text = re.sub(r'(?:with|including|include)?\s*(?:a\s+)?(?:swot\s+analysis|swot)\s*', '', text, flags=re.IGNORECASE)

    # 4. Remove leading conversational prompt prefixes
    prefix_pattern = (
        r'^(?:please\s+)?(?:generate|write|create|give\s+me|provide|tell\s+me\s+about|research|produce|draft)\s+'
        r'(?:a\s+|an\s+|the\s+)?(?:comprehensive\s+|detailed\s+|deep\s+dive\s+)?'
        r'(?:report|research\s+paper|paper|analysis|study|overview|summary)?(?:\s+(?:on|about|regarding|for))?\s*'
    )
    text = re.sub(prefix_pattern, '', text, flags=re.IGNORECASE)

    # 5. Remove trailing conversational suffixes
    suffix_pattern = r'\s+(?:report|research\s+paper|paper|essay|analysis|summary)?\s*(?:give\s+me|please|thanks)?\s*$'
    text = re.sub(suffix_pattern, '', text, flags=re.IGNORECASE)

    # 6. Clean whitespace and trailing dangling prepositions/punctuation
    cleaned_topic = re.sub(r'\s+', ' ', text).strip(' ,.:;?!-')
    cleaned_topic = re.sub(r'\s+(?:with|in|for|on|about)$', '', cleaned_topic, flags=re.IGNORECASE).strip(' ,.:;?!-')

    if not cleaned_topic:
        cleaned_topic = raw_topic.strip()

    reqs_str = "\n".join(extracted_reqs) if extracted_reqs else None
    return cleaned_topic, reqs_str, extracted_format
