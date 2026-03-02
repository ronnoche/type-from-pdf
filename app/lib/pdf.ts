import * as pdfjsLib from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

export async function extractTextFromPdf(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  const pageTexts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items
      .filter((item): item is TextItem => "str" in item)
      .map((item) => item.str);
    pageTexts.push(strings.join(" "));
  }

  return pageTexts
    .join("\n\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
