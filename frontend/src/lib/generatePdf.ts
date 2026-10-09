import { jsPDF } from "jspdf";
import { ResearchResponse } from "@/types";

interface TextToken {
  text: string;
  bold: boolean;
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
  fontSize: number = 10.5
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
    doc.setFont("helvetica", token.bold ? "bold" : "normal");

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
 * Generate and download a publication-grade Word-like PDF report.
 * - Standard Word margins (20mm all around)
 * - Zero browser junk (no localhost:3000, no browser date/headers/footers)
 * - No date in the document, pure topic information & synthesis
 * - Clean document typography matching Microsoft Word / Google Docs export
 */
export function generatePublicationPdf(report: ResearchResponse): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20; // 20mm margin like standard Word documents
  const contentWidth = pageWidth - margin * 2; // 170mm
  const bottomLimit = pageHeight - margin - 5; // 272mm
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
  // If markdown starts with # Title, use that and skip it in line processing
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

  if (isAcademic) {
    // Academic Paper Title: Centered 18pt bold
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(17, 24, 39); // #111827
    const titleLines = doc.splitTextToSize(mainTitle, contentWidth);
    doc.text(titleLines, pageWidth / 2, y, { align: "center" });
    y += titleLines.length * 7.5 + 3;

    // Academic Authors & Affiliation
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99); // #4b5563
    doc.text("NexusResearch Autonomous AI Synthesis System", pageWidth / 2, y, { align: "center" });
    y += 5;
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128); // #6b7280
    doc.text("Autonomous Web Intelligence & Empirical Synthesis Lab", pageWidth / 2, y, { align: "center" });
    y += 6;

    // Subtle academic divider line
    doc.setDrawColor(209, 213, 219); // #d1d5db
    doc.setLineWidth(0.3);
    doc.line(margin + 15, y, margin + contentWidth - 15, y);
    y += 7;
  } else {
    // Executive Report Title (Word-like 20pt bold, dark navy-slate)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42); // #0f172a
    const titleLines = doc.splitTextToSize(mainTitle, contentWidth);
    doc.text(titleLines, margin, y);
    y += titleLines.length * 8 + 2;

    // Title underline accent line (subtle Word-like rule)
    doc.setDrawColor(203, 213, 225); // #cbd5e1
    doc.setLineWidth(0.4);
    doc.line(margin, y, margin + contentWidth, y);
    y += 7;
  }

  // Process Document Body
  for (let i = 0; i < lines.length; i++) {
    if (i === firstLineH1Index) {
      continue; // Skip title as it's already rendered at the top
    }

    const rawLine = lines[i].trim();

    // Blank line -> Paragraph spacing
    if (!rawLine) {
      y += 2.5;
      continue;
    }

    // Skip duplicate title or warning banners
    if (rawLine.startsWith("> [!WARNING]") || rawLine.startsWith("> [!NOTE]")) {
      continue;
    }

    // Heading 1 (# Heading)
    if (rawLine.startsWith("# ")) {
      const headingText = rawLine.replace(/^#\s*/, "").replace(/[*_]/g, "").trim();
      checkPageBreak(18);
      y += 4;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(15, 23, 42);
      const hLines = doc.splitTextToSize(headingText, contentWidth);
      doc.text(hLines, margin, y);
      y += hLines.length * 6 + 1.5;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(margin, y, margin + contentWidth, y);
      y += 4;
      continue;
    }

    // Heading 2 (## Heading)
    if (rawLine.startsWith("## ")) {
      const headingText = rawLine.replace(/^##\s*/, "").replace(/[*_]/g, "").trim();
      checkPageBreak(15);
      y += 4;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13.5);
      doc.setTextColor(30, 58, 138); // #1e3a8a (Word Heading 2 Navy)
      const hLines = doc.splitTextToSize(headingText, contentWidth);
      doc.text(hLines, margin, y);
      y += hLines.length * 5.5 + 2.5;
      continue;
    }

    // Heading 3 (### Heading)
    if (rawLine.startsWith("### ")) {
      const headingText = rawLine.replace(/^###\s*/, "").replace(/[*_]/g, "").trim();
      checkPageBreak(13);
      y += 3;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11.5);
      doc.setTextColor(30, 41, 59); // #1e293b
      const hLines = doc.splitTextToSize(headingText, contentWidth);
      doc.text(hLines, margin, y);
      y += hLines.length * 5 + 2;
      continue;
    }

    // Blockquote (> Quote)
    if (rawLine.startsWith("> ")) {
      const quoteText = rawLine.replace(/^>\s*/, "").replace(/[*_]/g, "").trim();
      checkPageBreak(12);
      const quoteStartY = y;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105); // #475569
      const qLines = doc.splitTextToSize(quoteText, contentWidth - 8);
      const quoteHeight = qLines.length * 4.8;

      // Draw left bar
      doc.setDrawColor(59, 130, 246); // #3b82f6
      doc.setLineWidth(0.8);
      doc.line(margin + 1, quoteStartY - 3, margin + 1, quoteStartY + quoteHeight - 1);

      for (const ql of qLines) {
        checkPageBreak(5);
        doc.text(ql, margin + 5, y);
        y += 4.8;
      }
      y += 2.5;
      continue;
    }

    // Bullet list item (- Item or * Item)
    if (rawLine.startsWith("- ") || rawLine.startsWith("* ")) {
      const bulletContent = rawLine.replace(/^[-*]\s*/, "").trim();
      checkPageBreak(8);

      // Draw bullet point symbol
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(30, 58, 138); // #1e3a8a
      doc.text("\u2022", margin + 1, y);

      // Render bullet content with inline bold and indentation
      doc.setTextColor(31, 41, 55); // #1f2937
      y = renderRichParagraph(
        doc,
        bulletContent,
        margin + 5.5,
        y,
        contentWidth - 6,
        5.0,
        bottomLimit,
        topMargin,
        10
      );
      y += 1.5;
      continue;
    }

    // Numbered list item (1. Item, 2. Item)
    const numMatch = rawLine.match(/^(\d+\.)\s+(.+)/);
    if (numMatch) {
      const prefix = numMatch[1];
      const itemContent = numMatch[2].trim();
      checkPageBreak(8);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(30, 58, 138);
      doc.text(prefix, margin + 0.5, y);

      doc.setTextColor(31, 41, 55);
      y = renderRichParagraph(
        doc,
        itemContent,
        margin + 6,
        y,
        contentWidth - 6.5,
        5.0,
        bottomLimit,
        topMargin,
        10
      );
      y += 1.5;
      continue;
    }

    // Standard Body Paragraph
    checkPageBreak(8);
    doc.setTextColor(31, 41, 55); // #1f2937
    y = renderRichParagraph(
      doc,
      rawLine,
      margin,
      y,
      contentWidth,
      5.2,
      bottomLimit,
      topMargin,
      10.5
    );
    y += 2.5;
  }

  // Add Word-like Page Numbers in Footer (No URL, No localhost:3000, No Date)
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184); // #94a3b8
    doc.text(`Page ${p} of ${totalPages}`, pageWidth / 2, pageHeight - 10, {
      align: "center",
    });
  }

  // Trigger browser file download directly
  const safeFilename = `${(report.topic || "research-report")
    .slice(0, 35)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}-report.pdf`;

  doc.save(safeFilename);
}
