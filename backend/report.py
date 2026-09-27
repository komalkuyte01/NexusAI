import os
from typing import Optional
from dotenv import load_dotenv, find_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

load_dotenv(find_dotenv())

def get_llm() -> ChatOpenAI:
    api_key = os.getenv("OPENAI_API_KEY") or os.getenv("OPEN_API_KEY")
    if not api_key or api_key.startswith("placeholder") or api_key == "your_openai_api_key":
        raise ValueError("OPENAI_API_KEY is not configured in .env file.")
    return ChatOpenAI(model="gpt-4o-mini", temperature=0.2, api_key=api_key)

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

def generate_report(
    topic: str,
    research_context: str,
    report_type: str = "report",
    requirements: Optional[str] = None,
    custom_format: Optional[str] = None
) -> str:
    """
    Generate a structured report or research paper using LangChain and ChatOpenAI.
    """
    llm = get_llm()

    # Determine structural instructions
    if custom_format and custom_format.strip():
        structure_instructions = f"Follow this specific custom format/sections requested by user:\n{custom_format.strip()}"
    elif report_type == "research_paper":
        structure_instructions = STRUCTURE_RESEARCH_PAPER
    else:
        structure_instructions = STRUCTURE_REPORT

    # Additional requirements block
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
