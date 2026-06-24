import { AssessmentAnswers } from "./assessmentLogic";
import { RESOURCE_LINKS } from "./resourceLinks";

interface Recommendation {
  deploymentModel: string;
  licensingOption: string;
  licensingDetails: string;
  architecture: string;
  costConsiderations: string;
  complianceNotes: string;
  keyBenefits: string[];
  nextSteps: string[];
  recommendedInstances?: string[];
}

interface AssessmentResult {
  recommendation: Recommendation;
  summary: string;
  estimatedComplexity: "Low" | "Medium" | "High";
}

type PdfLine = {
  text: string;
  size?: number;
  gapAfter?: number;
  style?: "title" | "subtitle" | "meta" | "section" | "label" | "body" | "bullet" | "link" | "footer";
  indent?: number;
};

const pageWidth = 612;
const pageHeight = 792;
const margin = 54;
const contentWidth = pageWidth - margin * 2;
const lineHeight = 14;

function normalizeText(value: unknown): string {
  return String(value ?? "N/A")
    .replace(/[“”]/g, "\"")
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/↔/g, "<->")
    .replace(/\u00a0/g, " ")
    .replace(/[^\x09\x0a\x0d\x20-\x7e]/g, "")
    .trim();
}

function escapePdfString(value: string): string {
  return normalizeText(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrapText(text: string, size = 10): string[] {
  const clean = normalizeText(text);
  if (!clean) return [""];

  const approxCharWidth = size * 0.52;
  const maxChars = Math.max(35, Math.floor(contentWidth / approxCharWidth));
  const words = clean.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }

    if (current) lines.push(current);
    current = word;
  }

  if (current) lines.push(current);
  return lines;
}

function section(title: string): PdfLine[] {
  return [
    { text: title.toUpperCase(), size: 12, gapAfter: 8, style: "section" },
  ];
}

function paragraph(text: string, size = 10, style: PdfLine["style"] = "body", indent = 0): PdfLine[] {
  return wrapText(text, size).map((line, index, lines) => ({
    text: line,
    size,
    gapAfter: index === lines.length - 1 ? 5 : 0,
    style,
    indent,
  }));
}

function bullet(text: string): PdfLine[] {
  const [first, ...rest] = wrapText(text, 10);
  return [
    { text: `- ${first}`, size: 10, style: "bullet", indent: 10 },
    ...rest.map((line) => ({ text: `  ${line}`, size: 10, style: "body" as const, indent: 18 })),
  ];
}

function buildDocumentLines(answers: AssessmentAnswers, result: AssessmentResult, recommendation: Recommendation): PdfLine[] {
  return [
    { text: "OCI Windows and SQL Server Migration Assessment", size: 20, gapAfter: 8, style: "title" },
    { text: "Windows, SQL Server, licensing, and OCI migration planning", size: 10, gapAfter: 12, style: "subtitle" },
    { text: `Assessment Date: ${new Date().toLocaleDateString()}`, size: 10, style: "meta" },
    { text: `Customer / Project: ${normalizeText(answers.customerName)}`, size: 10, style: "meta" },
    { text: `Oracle Owner: ${normalizeText(answers.customerEmail)}`, size: 10, style: "meta" },
    { text: `Estimated Complexity: ${result.estimatedComplexity}`, size: 10, gapAfter: 12, style: "meta" },

    ...section("Current State"),
    ...paragraph(`Source: ${answers.sourcePlatform || "N/A"} / ${answers.currentDeploymentType || "N/A"}`, 10, "label"),
    ...paragraph(`Workload: ${answers.workloadType || "N/A"}`, 10, "label"),
    ...paragraph(`Instances: ${answers.numInstances || "N/A"}, vCPU: ${answers.totalVcpu || "N/A"}, Storage TB: ${answers.totalStorageTb || "N/A"}`, 10, "label"),
    ...paragraph(`Current SQL: ${answers.currentVersion || "N/A"} / ${answers.currentEdition || "N/A"}`, 10, "label"),

    ...section("Recommendation"),
    ...paragraph(`Deployment Model: ${recommendation.deploymentModel}`),
    ...paragraph(`Licensing Option: ${recommendation.licensingOption}`),
    ...paragraph(`Architecture: ${recommendation.architecture}`),
    ...paragraph(`Licensing Details: ${recommendation.licensingDetails}`),
    ...paragraph(`Cost Considerations: ${recommendation.costConsiderations}`),

    ...section("Recommended Instances"),
    ...(recommendation.recommendedInstances?.length
      ? recommendation.recommendedInstances.flatMap((item) => bullet(item))
      : bullet("Validate final shape selection after source utilization review.")),

    ...section("Key Benefits"),
    ...recommendation.keyBenefits.flatMap((item) => bullet(item)),

    ...section("Next Steps"),
    ...recommendation.nextSteps.flatMap((item, index) => bullet(`${index + 1}. ${item}`)),

    ...section("Reference Links"),
    ...RESOURCE_LINKS.flatMap((link) => [
      ...bullet(`${link.category}: ${link.title} - ${link.description}`),
      ...paragraph(link.url, 8, "link", 10),
    ]),

    ...section("Disclaimer"),
    ...paragraph(recommendation.complianceNotes, 9, "footer"),
    ...paragraph("This assessment is for Oracle internal migration planning. Validate final licensing, commercial terms, and architecture before customer-facing commitments.", 9, "footer"),
  ];
}

function lineHeightFor(line: PdfLine): number {
  const size = line.size ?? 10;
  if (line.style === "title") return 28;
  if (line.style === "section") return 28;
  return lineHeight + (line.gapAfter ?? 0) + (size > 12 ? 4 : 0);
}

function paginate(lines: PdfLine[]): PdfLine[][] {
  const pages: PdfLine[][] = [];
  let currentPage: PdfLine[] = [];
  let y = pageHeight - margin;

  for (const line of lines) {
    const required = lineHeightFor(line);

    if (y - required < margin && currentPage.length > 0) {
      pages.push(currentPage);
      currentPage = [];
      y = pageHeight - margin;
    }

    currentPage.push(line);
    y -= required;
  }

  if (currentPage.length > 0) pages.push(currentPage);
  return pages;
}

function pageContent(lines: PdfLine[], pageNumber: number): string {
  const commands: string[] = [];
  let y = pageHeight - margin;

  commands.push("0.985 0.976 0.960 rg");
  commands.push(`0 0 ${pageWidth} ${pageHeight} re f`);
  commands.push("0.545 0.118 0.067 rg");
  commands.push(`0 ${pageHeight - 28} ${pageWidth} 28 re f`);
  commands.push("0.78 0.17 0.10 rg");
  commands.push(`${margin} 42 ${contentWidth} 2 re f`);

  for (const line of lines) {
    const size = line.size ?? 10;
    const x = margin + (line.indent ?? 0);

    if (line.style === "title") {
      commands.push("0.545 0.118 0.067 rg");
      commands.push(`${margin - 16} ${y - 8} ${contentWidth + 32} 42 re f`);
      commands.push(`1 1 1 rg BT /F1 ${size} Tf ${margin} ${y + 8} Td (${escapePdfString(line.text)}) Tj ET`);
      y -= lineHeightFor(line);
      continue;
    }

    if (line.style === "subtitle") {
      commands.push(`1 0.88 0.84 rg BT /F1 ${size} Tf ${margin} ${y + 6} Td (${escapePdfString(line.text)}) Tj ET`);
      y -= lineHeightFor(line);
      continue;
    }

    if (line.style === "section") {
      commands.push("0.18 0.17 0.16 rg");
      commands.push(`${margin - 8} ${y - 4} ${contentWidth + 16} 20 re f`);
      commands.push("0.78 0.17 0.10 rg");
      commands.push(`${margin - 8} ${y - 4} 5 20 re f`);
      commands.push(`1 1 1 rg BT /F1 ${size} Tf ${margin + 6} ${y + 2} Td (${escapePdfString(line.text)}) Tj ET`);
      y -= lineHeightFor(line);
      continue;
    }

    if (line.style === "meta" || line.style === "label") {
      commands.push("1 1 1 rg");
      commands.push(`${margin - 8} ${y - 4} ${contentWidth + 16} 18 re f`);
      commands.push("0.78 0.17 0.10 rg");
      commands.push(`${margin - 8} ${y - 4} 3 18 re f`);
    }

    const color =
      line.style === "link"
        ? "0.00 0.25 0.55 rg"
        : line.style === "footer"
          ? "0.35 0.35 0.35 rg"
          : line.style === "bullet"
            ? "0.18 0.17 0.16 rg"
            : "0.12 0.12 0.12 rg";

    commands.push(`${color} BT /F1 ${size} Tf ${x} ${y} Td (${escapePdfString(line.text)}) Tj ET`);
    y -= lineHeightFor(line);
  }

  commands.push(`0.35 0.35 0.35 rg BT /F1 8 Tf ${margin} 28 Td (Confidential - Oracle Internal Use Only | Page ${pageNumber}) Tj ET`);
  return commands.join("\n");
}

function buildPdf(lines: PdfLine[]): string {
  const pages = paginate(lines);
  const objects: string[] = [];
  const catalogId = 1;
  const pagesId = 2;
  const fontId = 3;
  const firstPageId = 4;

  objects[catalogId] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[fontId] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

  const pageRefs: string[] = [];
  pages.forEach((pageLines, index) => {
    const pageId = firstPageId + index * 2;
    const contentId = pageId + 1;
    const content = pageContent(pageLines, index + 1);

    pageRefs.push(`${pageId} 0 R`);
    objects[pageId] = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`;
    objects[contentId] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
  });

  objects[pagesId] = `<< /Type /Pages /Kids [${pageRefs.join(" ")}] /Count ${pages.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  for (let id = 1; id < objects.length; id++) {
    offsets[id] = pdf.length;
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length}\n`;
  pdf += "0000000000 65535 f \n";
  for (let id = 1; id < objects.length; id++) {
    pdf += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

function reportFileName(customerName: string) {
  const safeName = normalizeText(customerName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50) || "assessment";

  return `oci-sql-assessment-${safeName}-${new Date().toISOString().slice(0, 10)}.pdf`;
}

export function generatePDF(answers: AssessmentAnswers, result: AssessmentResult, recommendation: Recommendation) {
  const lines = buildDocumentLines(answers, result, recommendation);
  const pdf = buildPdf(lines);
  const blob = new Blob([pdf], { type: "application/pdf" });
  downloadBlob(blob, reportFileName(answers.customerName));
}
