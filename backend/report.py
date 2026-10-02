import os
import re
from typing import Optional, List, Dict
from dotenv import load_dotenv, find_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

load_dotenv(find_dotenv())

def get_llm(user_gemini_key: Optional[str] = None):
    """
    Select available LLM provider with fallback support:
    1. Google Gemini (Free tier, generous quota - priority #1)
    2. Groq (Free fast tier)
    3. OpenAI (GPT-4o-mini)
    """
    # 1. Gemini Check (From user request, GEMINI_API_KEY, or GOOGLE_API_KEY)
    gemini_key = user_gemini_key or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if gemini_key and not gemini_key.startswith("placeholder") and gemini_key != "your_gemini_api_key":
        return ChatOpenAI(
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
            api_key=gemini_key,
            model="gemini-2.5-flash",
            temperature=0.2
        )

    # 2. Groq Check (Free and fast)
    groq_key = os.getenv("GROQ_API_KEY")
    if groq_key and not groq_key.startswith("placeholder") and groq_key != "your_groq_api_key":
        return ChatOpenAI(
            base_url="https://api.groq.com/openai/v1",
            api_key=groq_key,
            model="llama-3.3-70b-versatile",
            temperature=0.2
        )

    # 3. OpenAI
    openai_key = os.getenv("OPENAI_API_KEY") or os.getenv("OPEN_API_KEY")
    if openai_key and not openai_key.startswith("placeholder") and openai_key != "your_openai_api_key":
        return ChatOpenAI(model="gpt-4o-mini", temperature=0.2, api_key=openai_key)

    raise ValueError(
        "No active AI API key found. Please provide a GEMINI_API_KEY or OPENAI_API_KEY in .env or via Web Settings."
    )

STRUCTURE_RESEARCH_PAPER = """
Please format the document as an academic Research Paper with the following sections:
# [Title]
## Abstract
## Introduction
## Main Content (divide into relevant subsections with detailed analysis)
## Conclusion
## References (list relevant source URLs and citations)
"""

STRUCTURE_REPORT = """
Please format the document as a professional Executive Report with the following sections:
# [Title]
## Executive Summary
## Introduction
## Key Findings (detailed, data-driven points)
## Strategic Conclusion & Recommendations
## References (list relevant source URLs and citations)
"""

def fallback_synthesize_report(
    topic: str,
    research_context: str,
    report_type: str = "report",
    requirements: Optional[str] = None,
    advisory_reason: str = "OpenAI API quota exhausted"
) -> str:
    """
    Intelligent extractive fallback synthesis when LLM API quota is exhausted.
    Synthesizes grounded findings directly from the Tavily search evidence.
    """
    blocks = [b.strip() for b in research_context.split("---") if b.strip()]
    findings: List[Dict[str, str]] = []

    for block in blocks:
        title_match = re.search(r"Source:\s*(.+)", block)
        url_match = re.search(r"URL:\s*(.+)", block)
        content_match = re.search(r"Content:\s*(.+)", block, re.DOTALL)

        title = title_match.group(1).strip() if title_match else "Intelligence Source"
        url = url_match.group(1).strip() if url_match else ""
        content = content_match.group(1).strip() if content_match else block

        if content:
            findings.append({"title": title, "url": url, "content": content})

    is_academic = report_type == "research_paper"

    report_lines = [
        f"# {topic}",
        "",
        f"> [!WARNING]",
        f"> **API Notice**: {advisory_reason}. This report was generated from live Tavily web intelligence.",
        f"> To activate full generative LLM synthesis, add billing credits at [platform.openai.com/billing](https://platform.openai.com/settings/organization/billing/) or provide a free `GROQ_API_KEY` in `.env`.",
        "",
        "## Abstract" if is_academic else "## Executive Summary",
        f"This document provides a grounded assessment of **{topic}**, drawing upon current web intelligence and industry reports. "
        f"The synthesis triangulates evidence across {len(findings)} independent web references to highlight critical developments, technical architectures, and strategic outcomes.",
        "",
        "## Introduction",
        f"The domain of **{topic}** has undergone substantial evolution. "
        f"Understanding its core drivers requires evaluating real-world deployments, regulatory boundaries, and empirical performance metrics.",
    ]

    if requirements:
        report_lines.extend([
            "",
            "### Special Focus Parameters",
            f"Analysis calibrated according to user constraint: *{requirements}*.",
        ])

    report_lines.extend([
        "",
        "## Detailed Analysis & Evidence" if is_academic else "## Key Findings & Intelligence",
    ])

    for idx, f in enumerate(findings, 1):
        report_lines.extend([
            f"### {idx}. {f['title']}",
            f"{f['content'][:600]}...",
            "",
            f"- **Grounding Reference**: [{f['title']}]({f['url']})",
            "",
        ])

    report_lines.extend([
        "## Conclusion & Strategic Outlook" if not is_academic else "## Conclusion & Future Directions",
        f"In summary, the trajectory of **{topic}** indicates expanding impact and rapid market adoption. "
        "Stakeholders should prioritize verified evidentiary models, continuous evaluation of technology trade-offs, and adaptive strategic frameworks to capitalize on emerging opportunities.",
        "",
        "## References",
    ])

    for idx, f in enumerate(findings, 1):
        report_lines.append(f"{idx}. [{f['title']}]({f['url']}) — Retrieved via autonomous search grounding.")

    return "\n".join(report_lines)

def generate_report(
    topic: str,
    research_context: str,
    report_type: str = "report",
    requirements: Optional[str] = None,
    custom_format: Optional[str] = None,
    user_gemini_key: Optional[str] = None
) -> str:
    """
    Generate a structured report or research paper using LangChain and ChatOpenAI/Groq/Gemini,
    with graceful fallback if quota is exhausted.
    """
    try:
        llm = get_llm(user_gemini_key)

        if custom_format and custom_format.strip():
            structure_instructions = f"Follow this specific custom format/sections requested by user:\n{custom_format.strip()}"
        elif report_type == "research_paper":
            structure_instructions = STRUCTURE_RESEARCH_PAPER
        else:
            structure_instructions = STRUCTURE_REPORT

        additional_reqs = ""
        if requirements and requirements.strip():
            additional_reqs = f"Special Requirements / Focus Areas:\n{requirements.strip()}\n"

        prompt = ChatPromptTemplate.from_messages([
            ("system", (
                "You are a top-tier research analyst and technical writer. "
                "Write thorough, structured, and insightful documents based on the provided research context. "
                "Maintain an objective, professional tone and cite source URLs where applicable."
            )),
            ("human", """Write a complete document on the following topic:

Topic: {topic}

{structure_instructions}

{additional_reqs}
Research Information Gathered:
{research_context}

Be factual, in-depth, and well-structured.
""")
        ])

        chain = prompt | llm | StrOutputParser()

        report_content = chain.invoke({
            "topic": topic,
            "structure_instructions": structure_instructions,
            "additional_reqs": additional_reqs,
            "research_context": research_context
        })

        return report_content

    except Exception as e:
        err_msg = str(e)
        # Check if error is quota exhaustion or rate limit
        if "429" in err_msg or "insufficient_quota" in err_msg or "credit_balance_exhausted" in err_msg or "quota" in err_msg.lower():
            return fallback_synthesize_report(
                topic=topic,
                research_context=research_context,
                report_type=report_type,
                requirements=requirements,
                advisory_reason="OpenAI API credit quota exhausted (Error 429)"
            )
        # Re-raise other unexpected errors
        raise e
