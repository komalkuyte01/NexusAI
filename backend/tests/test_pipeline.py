import unittest
import sys
import os

# Add backend directory to sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from models import SourceItem, ResearchRequest, ResearchResponse
from research import normalize_url, evaluate_source_quality
from verification import (
    extract_candidate_claims,
    verify_claim_against_evidence,
    evaluate_research_claims_and_metrics
)
from report import fallback_synthesize_report, STRUCTURE_REPORT, STRUCTURE_RESEARCH_PAPER

class TestResearchPipeline(unittest.TestCase):

    def test_url_normalization(self):
        url1 = "https://example.com/research/paper/?utm_source=twitter&utm_medium=social#anchor"
        url2 = "https://example.com/research/paper"
        self.assertEqual(normalize_url(url1), url2)

    def test_source_quality_tiering(self):
        score_edu, tier_edu, verified_edu = evaluate_source_quality("mit.edu")
        self.assertEqual(score_edu, 1.0)
        self.assertTrue(verified_edu)
        self.assertIn("Academic", tier_edu)

        score_reuters, tier_reuters, verified_reuters = evaluate_source_quality("reuters.com")
        self.assertEqual(score_reuters, 0.85)
        self.assertTrue(verified_reuters)

        score_random, tier_random, verified_random = evaluate_source_quality("random-blog.xyz")
        self.assertEqual(score_random, 0.60)
        self.assertFalse(verified_random)

    def test_claim_extraction(self):
        text = (
            "Autonomous agent adoption increased by 45% in 2026 across Global 2000 enterprises. "
            "However, multi-agent frameworks continue to face security challenges. "
            "According to the benchmark, latency dropped to 120ms."
        )
        claims = extract_candidate_claims(text, max_claims=3)
        self.assertTrue(len(claims) >= 2)
        self.assertTrue(any("45%" in c for c in claims))

    def test_claim_verification_statuses(self):
        source = SourceItem(
            title="AI Enterprise Survey 2026",
            url="https://mit.edu/survey-2026",
            snippet="Autonomous agent adoption increased by 45% in 2026 across Global 2000 enterprises.",
            is_verified=True
        )

        # 1. Verified Claim
        claim1 = "Autonomous agent adoption increased by 45% in 2026."
        result1 = verify_claim_against_evidence(claim1, [source])
        self.assertEqual(result1.verification_status, "Verified")
        self.assertEqual(result1.source_url, "https://mit.edu/survey-2026")

        # 2. Conflicting Claim
        claim2 = "Autonomous agent adoption increased by 12% in 2026."
        result2 = verify_claim_against_evidence(claim2, [source])
        self.assertIn(result2.verification_status, ["Conflicting Evidence", "Partially Verified"])

        # 3. Unverified Claim
        claim3 = "Quantum computing teleportation broke commercial records in aerospace."
        result3 = verify_claim_against_evidence(claim3, [source])
        self.assertEqual(result3.verification_status, "Unverified")

    def test_quality_metrics_computation(self):
        sources = [
            SourceItem(
                title="AI Research 2026",
                url="https://arxiv.org/abs/1234.5678",
                snippet="Autonomous agent adoption increased by 45% in 2026 across Global 2000 enterprises.",
                is_verified=True
            ),
            SourceItem(
                title="Random Source",
                url="https://unverified.com/post",
                snippet="General thoughts on artificial intelligence without metrics.",
                is_verified=False
            )
        ]
        sample_content = (
            "Autonomous agent adoption increased by 45% in 2026. "
            "Security remains an unresolved concern."
        )
        claims, metrics = evaluate_research_claims_and_metrics(sample_content, sources)
        self.assertTrue(len(claims) > 0)
        self.assertGreater(metrics.claim_support_rate, 0.0)
        self.assertEqual(metrics.source_verification_rate, 50.0)
        self.assertEqual(metrics.total_sources_evaluated, 2)

    def test_fallback_synthesis_structures(self):
        context = (
            "Source: NIST Post-Quantum Cryptography\n"
            "URL: https://nist.gov/pqc\n"
            "Content: NIST announced final standardization of ML-KEM and ML-DSA in 2026."
        )

        # 1. Academic Paper Structure
        academic_doc = fallback_synthesize_report(
            topic="Post-Quantum Cryptography Migration",
            research_context=context,
            report_type="research_paper"
        )
        self.assertIn("## Abstract", academic_doc)
        self.assertIn("## 1. Introduction", academic_doc)
        self.assertIn("## 2. Literature Review", academic_doc)
        self.assertIn("## 3. Research Question and Objectives", academic_doc)
        self.assertIn("## 4. Methodology", academic_doc)
        self.assertIn("## 5. Results and Discussion", academic_doc)
        self.assertIn("## 6. Limitations", academic_doc)
        self.assertIn("## 7. Conclusion and Future Work", academic_doc)
        self.assertIn("## 8. References", academic_doc)

        # 2. Executive Report Structure
        report_doc = fallback_synthesize_report(
            topic="Post-Quantum Cryptography Migration",
            research_context=context,
            report_type="report"
        )
        self.assertIn("## Executive Summary", report_doc)
        self.assertIn("## Introduction", report_doc)
        self.assertIn("## Research Findings", report_doc)
        self.assertIn("## Analysis and Discussion", report_doc)
        self.assertIn("## Limitations", report_doc)
        self.assertIn("## Recommendations", report_doc)
        self.assertIn("## Conclusion", report_doc)
        self.assertIn("## References", report_doc)

if __name__ == "__main__":
    unittest.main()
