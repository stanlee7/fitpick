// 강사 이력서/소개서 파일에서 텍스트 추출 — 전부 클라이언트 사이드(백엔드 없음).
// PDF: pdf.js, DOCX: mammoth, TXT/MD: 그대로. 동적 import로 필요할 때만 로드.

export async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".pdf")) return extractPdf(file);
  if (name.endsWith(".docx")) return extractDocx(file);
  if (name.endsWith(".txt") || name.endsWith(".md")) return file.text();

  if (name.endsWith(".hwp") || name.endsWith(".hwpx")) {
    throw new Error(
      "한글(HWP) 파일은 아직 지원하지 않습니다. 한글에서 'PDF로 저장' 후 올려주세요."
    );
  }
  throw new Error("지원하지 않는 형식입니다. PDF, DOCX, TXT 파일을 올려주세요.");
}

async function extractPdf(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  // 워커는 버전에 맞는 CDN에서 로드(웹). pdfjs 버전과 동일하게 핀.
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

  const buf = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buf }).promise;
  const parts: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const line = content.items
      .map((it) => ("str" in it ? (it as { str: string }).str : ""))
      .join(" ");
    parts.push(line);
  }
  const text = parts.join("\n").trim();
  if (!text) {
    throw new Error(
      "PDF에서 텍스트를 찾지 못했습니다. 스캔(이미지) PDF일 수 있어요. 텍스트 PDF로 올려주세요."
    );
  }
  return text;
}

async function extractDocx(file: File): Promise<string> {
  // 'mammoth' 메인을 import하면 webpack의 browser 필드가 브라우저 빌드로 치환한다.
  const mammoth = (await import("mammoth")).default;
  const buf = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buf });
  const text = (result?.value || "").trim();
  if (!text) throw new Error("DOCX에서 텍스트를 찾지 못했습니다.");
  return text;
}
