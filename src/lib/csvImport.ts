// 노션 DB/엑셀 CSV → 강사 일괄 가져오기. 무백엔드, 의존성 없이 직접 파싱.
import { Instructor } from "../data/mockInstructors";
import { avatarFor } from "../lib/avatar";

// ── CSV 파서 (따옴표/이스케이프/줄바꿈 포함 셀/BOM 처리) ─────────────────────────────
export function parseCsv(text: string): string[][] {
  const t = text.replace(/^﻿/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (inQuotes) {
      if (c === '"') {
        if (t[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c === "\r") {
      // \r\n 의 \r 무시
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  // 완전히 빈 행 제거
  return rows.filter((r) => r.some((cell) => cell.trim().length > 0));
}

// ── 매핑 대상 필드 + 헤더 자동 추측 키워드 ─────────────────────────────
export type FieldKey =
  | "name"
  | "role"
  | "bio"
  | "yearsTeaching"
  | "sessionsCount"
  | "traineesCount"
  | "careerHistory"
  | "clientCompanies"
  | "testimonials"
  | "tags"
  | "email"
  | "phone";

interface FieldDef {
  key: FieldKey;
  label: string;
  required?: boolean;
  keywords: string[];
}

export const FIELD_DEFS: FieldDef[] = [
  { key: "name", label: "이름", required: true, keywords: ["이름", "성함", "강사명", "강사", "name"] },
  { key: "role", label: "전문 분야 / 타이틀", keywords: ["분야", "전문", "타이틀", "직함", "포지션", "role", "title"] },
  { key: "bio", label: "한 줄 소개", keywords: ["소개", "자기소개", "설명", "bio", "about"] },
  { key: "yearsTeaching", label: "강의 경력(년)", keywords: ["연차", "년차", "강의연차", "years"] },
  { key: "sessionsCount", label: "누적 강의(회)", keywords: ["강의횟수", "강의수", "누적강의", "출강", "sessions"] },
  { key: "traineesCount", label: "교육 인원(명)", keywords: ["교육인원", "수강생", "수강인원", "인원", "trainees"] },
  { key: "careerHistory", label: "실무 경력", keywords: ["경력", "재직", "이력", "커리어", "career"] },
  { key: "clientCompanies", label: "강의 진행 기업", keywords: ["고객사", "진행기업", "강의기업", "기업", "거래처", "clients", "company"] },
  { key: "testimonials", label: "수강 후기", keywords: ["후기", "리뷰", "추천사", "평가", "testimonial", "review"] },
  { key: "tags", label: "핵심 태그", keywords: ["태그", "키워드", "tags", "keyword"] },
  { key: "email", label: "이메일", keywords: ["이메일", "메일", "email", "e-mail"] },
  { key: "phone", label: "연락처", keywords: ["연락처", "전화", "휴대폰", "핸드폰", "phone", "mobile", "tel"] },
];

export type Mapping = Record<FieldKey, number>; // 컬럼 인덱스, 매핑 안 함 = -1

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, "");

/** 헤더명으로 각 필드에 맞는 컬럼을 자동 추측. 한 컬럼은 한 필드에만. */
export function guessMapping(headers: string[]): Mapping {
  const used = new Set<number>();
  const mapping = {} as Mapping;
  for (const def of FIELD_DEFS) {
    let found = -1;
    for (let i = 0; i < headers.length; i++) {
      if (used.has(i)) continue;
      const h = norm(headers[i]);
      if (def.keywords.some((k) => h.includes(norm(k)))) {
        found = i;
        break;
      }
    }
    if (found >= 0) used.add(found);
    mapping[def.key] = found;
  }
  return mapping;
}

// ── 행 → 강사 ─────────────────────────────
const splitMulti = (cell: string) =>
  cell
    .split(/[,;|/\n]+/)
    .map((x) => x.trim())
    .filter(Boolean);

const toNum = (cell: string): number | undefined => {
  const n = parseInt(cell.replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : undefined;
};

const cellAt = (row: string[], idx: number) => (idx >= 0 && idx < row.length ? row[idx].trim() : "");

export function buildInstructors(rows: string[][], mapping: Mapping): Instructor[] {
  const out: Instructor[] = [];
  rows.forEach((row, i) => {
    const name = cellAt(row, mapping.name);
    if (!name) return; // 이름 없는 행은 건너뜀

    const testimonialCell = cellAt(row, mapping.testimonials);
    const inst: Instructor = {
      id: `inst-csv-${Date.now().toString(36)}-${i}`,
      name,
      role: cellAt(row, mapping.role) || "전문 분야 (수정 요망)",
      avatar: avatarFor(name),
      hourlyRate: 0,
      rating: 0,
      reviewCount: 0,
      availability: "일정 협의",
      tags: splitMulti(cellAt(row, mapping.tags)),
      bio: cellAt(row, mapping.bio),
      notionUrl: "",
      email: cellAt(row, mapping.email),
      phone: cellAt(row, mapping.phone),
      portfolioItems: [],
      yearsTeaching: toNum(cellAt(row, mapping.yearsTeaching)),
      sessionsCount: toNum(cellAt(row, mapping.sessionsCount)),
      traineesCount: toNum(cellAt(row, mapping.traineesCount)),
      careerHistory: splitMulti(cellAt(row, mapping.careerHistory)),
      clientCompanies: splitMulti(cellAt(row, mapping.clientCompanies)),
      testimonials: testimonialCell ? [{ quote: testimonialCell, author: name }] : [],
    };
    out.push(inst);
  });
  return out;
}
