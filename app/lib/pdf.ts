import * as pdfjsLib from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

type PositionedTextItem = {
  text: string;
  x: number;
  y: number;
};

function buildPageText(items: TextItem[]): string {
  const positioned: PositionedTextItem[] = items.map((item) => {
    const [ , , , , x, y ] = item.transform as unknown as number[];
    return {
      text: item.str,
      x: x ?? 0,
      y: y ?? 0,
    };
  });

  // Sort by vertical position (top to bottom), then left to right
  positioned.sort((a, b) => {
    if (a.y === b.y) return a.x - b.x;
    return b.y - a.y;
  });

  // Group into lines by similar y value
  const lines: { y: number; parts: string[] }[] = [];
  const yThreshold = 2;

  for (const item of positioned) {
    const last = lines[lines.length - 1];
    if (!last || Math.abs(last.y - item.y) > yThreshold) {
      lines.push({ y: item.y, parts: [item.text] });
    } else {
      last.parts.push(item.text);
    }
  }

  if (lines.length === 0) return "";

  // Estimate normal line spacing to detect paragraph gaps
  const gaps: number[] = [];
  for (let i = 1; i < lines.length; i++) {
    gaps.push(Math.abs(lines[i - 1].y - lines[i].y));
  }
  gaps.sort((a, b) => a - b);
  const medianGap =
    gaps.length > 0 ? gaps[Math.floor(gaps.length / 2)] : 0;

  const textParts: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineText = line.parts.join(" ").replace(/[ \t]+/g, " ").trimEnd();
    textParts.push(lineText);

    if (i < lines.length - 1) {
      const gap = Math.abs(lines[i].y - lines[i + 1].y);
      const isParagraphBreak =
        medianGap > 0 && gap > medianGap * 1.5;
      textParts.push(isParagraphBreak ? "\n\n" : "\n");
    }
  }

  return textParts.join("");
}

export async function extractTextFromPdf(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  const pageTexts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const textItems = content.items.filter(
      (item): item is TextItem => "str" in item
    );
    pageTexts.push(buildPageText(textItems));
  }

  return pageTexts
    .join("\n\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

