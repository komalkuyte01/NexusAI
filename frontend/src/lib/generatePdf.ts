import { jsPDF } from "jspdf";
import { ResearchResponse } from "@/types";

interface TextToken {
  text: string;
  bold: boolean;
}

/**
 * Clean topic string into a publication-grade filename slug.
 */
export function getDocumentFileSlug(rawTopic: string): string {
  if (!rawTopic) return "research";

  // Strip conversational prompt prefixes
  const cleaned = rawTopic.trim().replace(
    /^(please\s+)?(generate\s+(info|information|a\s+report|an\s+analysis)?\s+(on|about)?|write\s+(a\s+report|an\s+essay|an\s+analysis|about)?\s+(on|about)?|tell\s+me\s+about|research\s+(on|about)?|give\s+me\s+(info|information|details)\s+(on|about)?|what\s+is\s+the\s+condition\s+of|what\s+is|what\s+are|overview\s+of)\s+/i,
    ""
  ).trim();

  const target = cleaned || rawTopic;
  const slug = target
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug.slice(0, 60).replace(/-+$/, "") || "research";
}

/**
 * Tokenize a string into bold (**bold**) and normal text segments.
 */
function tokenizeFormattedText(text: string): TextToken[] {
  const tokens: TextToken[] = [];
  const regex = /(\*\*[^*]+\*\*|[^*]+)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const raw = match[0];
    if (raw.startsWith("**") && raw.endsWith("**") && raw.length >= 4) {
      tokens.push({ text: raw.slice(2, -2), bold: true });
    } else {
      tokens.push({ text: raw, bold: false });
    }
  }

  return tokens.length > 0 ? tokens : [{ text, bold: false }];
}

/**
 * Render multi-line rich text with inline bold support, wrapping, and automatic page breaks.
 */
function renderRichParagraph(
  doc: jsPDF,
  rawText: string,
  startX: number,
  startY: number,
  maxWidth: number,
  lineHeight: number,
  bottomLimit: number,
  topMargin: number,
  fontSize: number = 12
): number {
  doc.setFontSize(fontSize);

  // Clean links [Text](url) -> Text (url) and backticks `code` -> code
  const cleaned = rawText
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    .replace(/`([^`]+)`/g, "$1");

  const tokens = tokenizeFormattedText(cleaned);
  let curX = startX;
  let curY = startY;

  for (const token of tokens) {
    doc.setFont("times", token.bold ? "bold" : "normal");

    // Split token into words while preserving whitespace
    const words = token.text.split(/(\s+)/);

    for (const word of words) {
      if (!word) continue;

      const isSpace = /^\s+$/.test(word);

      // Skip leading whitespace at start of a new line
      if (isSpace && curX === startX) {
        continue;
      }

      const wordWidth = doc.getTextWidth(word);

      // Check if word overflows current line
      if (curX + wordWidth > startX + maxWidth && !isSpace) {
        curX = startX;
        curY += lineHeight;

        // Check page break
        if (curY > bottomLimit) {
          doc.addPage();
          curY = topMargin;
        }
      }

      doc.text(word, curX, curY);
      curX += wordWidth;
    }
  }

  return curY + lineHeight;
}

/**
 * Generate and download a publication-grade PDF report according to standard academic guidelines:
 * - Font: Times New Roman
 * - Margins: 1 inch (25.4mm) on all sides
 * - Body text: 12 pt
 * - Main title: 18 pt bold (centered)
 * - Headings: 14 pt bold
 * - Line spacing: 1.5 (approx 6.35mm)
 */
export function generatePublicationPdf(report: ResearchResponse): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 25.4; // 1 inch = 25.4mm margin on all sides
  const contentWidth = pageWidth - margin * 2; // 159.2mm
  const bottomLimit = pageHeight - margin - 5;
  const topMargin = margin;

  let y = topMargin;

  const checkPageBreak = (neededHeight: number): void => {
    if (y + neededHeight > bottomLimit) {
      doc.addPage();
      y = topMargin;
    }
  };

  const lines = report.content.split("\n");

  // Determine Main Document Title
  let mainTitle = "";
  let firstLineH1Index = -1;

  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith("# ")) {
      mainTitle = trimmed.replace(/^#\s*/, "").replace(/[*_]/g, "").trim();
      firstLineH1Index = i;
      break;
    }
  }

  if (!mainTitle) {
    mainTitle = report.topic
      .split(" ")
      .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : ""))
      .join(" ");
  }

  const isAcademic = report.report_type === "research_paper";

  // Main title: 18 pt, bold, centered
  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  const titleLines = doc.splitTextToSize(mainTitle, contentWidth);
  doc.text(titleLines, pageWidth / 2, y, { align: "center" });
  y += titleLines.length * 8 + 4;

  if (isAcademic) {
    // Academic Authors & Affiliation
    doc.setFont("times", "normal");
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text("NexusResearch Autonomous AI Synthesis System", pageWidth / 2, y, { align: "center" });
    y += 5.5;
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    doc.text("Autonomous Web Intelligence & Empirical Synthesis Lab", pageWidth / 2, y, { align: "center" });
    y += 6.5;

    // Academic divider
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.line(margin + 20, y, margin + contentWidth - 20, y);
    y += 8;
  } else {
    // Report divider rule
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.4);
    doc.line(margin, y, margin + contentWidth, y);
    y += 8;
  }

  // 1.5 Line spacing for 12pt body text is approx 6.35mm
  const bodyLineHeight = 6.35;

  // Process Document Body
  for (let i = 0; i < lines.length; i++) {
    if (i === firstLineH1Index) {
      continue; // Skip title as it's already rendered
    }

    const rawLine = lines[i].trim();

    // Blank line -> Paragraph spacing
    if (!rawLine) {
      y += 3;
      continue;
    }

    if (rawLine.startsWith("> [!WARNING]") || rawLine.startsWith("> [!NOTE]")) {
      continue;
    }

    // Heading 1 (# Heading): 14 pt, bold
    if (rawLine.startsWith("# ")) {
      const headingText = rawLine.replace(/^#\s*/, "").replace(/[*_]/g, "").trim();
      checkPageBreak(18);
      y += 5;
      doc.setFont("times", "bold");
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      const hLines = doc.splitTextToSize(headingText, contentWidth);
      doc.text(hLines, margin, y);
      y += hLines.length * 6.5 + 2;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(margin, y, margin + contentWidth, y);
      y += 4.5;
      continue;
    }

    // Heading 2 (## Heading): 14 pt, bold
    if (rawLine.startsWith("## ")) {
      const headingText = rawLine.replace(/^##\s*/, "").replace(/[*_]/g, "").trim();
      checkPageBreak(15);
      y += 5;
      doc.setFont("times", "bold");
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      const hLines = doc.splitTextToSize(headingText, contentWidth);
      doc.text(hLines, margin, y);
      y += hLines.length * 6 + 2.5;
      continue;
    }

    // Heading 3 (### Heading): 12 pt, bold
    if (rawLine.startsWith("### ")) {
      const headingText = rawLine.replace(/^###\s*/, "").replace(/[*_]/g, "").trim();
      checkPageBreak(13);
      y += 4;
      doc.setFont("times", "bold");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      const hLines = doc.splitTextToSize(headingText, contentWidth);
      doc.text(hLines, margin, y);
      y += hLines.length * 5.5 + 2;
      continue;
    }

    // Blockquote (> Quote)
    if (rawLine.startsWith("> ")) {
      const quoteText = rawLine.replace(/^>\s*/, "").replace(/[*_]/g, "").trim();
      checkPageBreak(12);
      const quoteStartY = y;
      doc.setFont("times", "italic");
      doc.setFontSize(11);
      doc.setTextColor(50, 50, 50);
      const qLines = doc.splitTextToSize(quoteText, contentWidth - 10);
      const quoteHeight = qLines.length * 5.2;

      // Draw left bar
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.8);
      doc.line(margin + 1, quoteStartY - 3, margin + 1, quoteStartY + quoteHeight - 1);

      for (const ql of qLines) {
        checkPageBreak(5);
        doc.text(ql, margin + 6, y);
        y += 5.2;
      }
      y += 3;
      continue;
    }

    // Bullet list item (- Item or * Item)
    if (rawLine.startsWith("- ") || rawLine.startsWith("* ")) {
      const bulletContent = rawLine.replace(/^[-*]\s*/, "").trim();
      checkPageBreak(8);

      doc.setFont("times", "bold");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("\u2022", margin + 1.5, y);

      doc.setTextColor(0, 0, 0);
      y = renderRichParagraph(
        doc,
        bulletContent,
        margin + 7,
        y,
        contentWidth - 8,
        bodyLineHeight,
        bottomLimit,
        topMargin,
        12
      );
      y += 2;
      continue;
    }

    // Numbered list item (1. Item, 2. Item)
    const numMatch = rawLine.match(/^(\d+\.)\s+(.+)/);
    if (numMatch) {
      const prefix = numMatch[1];
      const itemContent = numMatch[2].trim();
      checkPageBreak(8);

      doc.setFont("times", "bold");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(prefix, margin + 0.5, y);

      doc.setTextColor(0, 0, 0);
      y = renderRichParagraph(
        doc,
        itemContent,
        margin + 8,
        y,
        contentWidth - 9,
        bodyLineHeight,
        bottomLimit,
        topMargin,
        12
      );
      y += 2;
      continue;
    }

    // Standard Body Paragraph: 12 pt, 1.5 line spacing
    checkPageBreak(8);
    doc.setTextColor(0, 0, 0);
    y = renderRichParagraph(
      doc,
      rawLine,
      margin,
      y,
      contentWidth,
      bodyLineHeight,
      bottomLimit,
      topMargin,
      12
    );
    y += 3;
  }

  // Document Integrity & Quality Validation Stamp
  if (report.metrics) {
    checkPageBreak(20);
    y += 5;
    doc.setDrawColor(212, 212, 212);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(margin, y, contentWidth, 14, 1.5, 1.5, "FD");
    
    doc.setFont("times", "bold");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text("VERIFICATION & ACCURACY AUDIT", margin + 4, y + 5);

    doc.setFont("times", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(60, 60, 60);
    const auditText = `Claim Support Rate: ${report.metrics.claim_support_rate}%   |   Citation Precision: ${report.metrics.citation_precision}%   |   Source Verification: ${report.metrics.source_verification_rate}%`;
    doc.text(auditText, margin + 4, y + 10);
    y += 18;
  }

  // Word-like Page Numbers in Footer
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Page ${p} of ${totalPages}`, pageWidth / 2, pageHeight - 12, {
      align: "center",
    });
  }

  // Trigger browser file download directly with topic-based naming
  const fileSlug = getDocumentFileSlug(report.topic);
  const suffix = isAcademic ? "research-paper" : "report";
  const safeFilename = `${fileSlug}-${suffix}.pdf`;

  doc.save(safeFilename);
}
