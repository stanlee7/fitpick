// 공유 제안서 인코딩/디코딩 — 백엔드/DB가 없는 정적 앱이라
// 제안서 내용을 URL 해시(#p=)에 담아 전달한다.
// (이미지 같은 무거운 데이터는 제외하고, 받는 쪽에서 이름 기반 아바타로 재생성)

import { TemplateType } from "./templates";

export interface SharedInstructor {
  name: string;
  role: string;
  bio: string;
  rating: number;
  reviewCount: number;
  availability: string;
  materials: { title: string; type: string }[];
  // 신뢰신호 — 제안서 링크(#p=)에 함께 실려 받는 쪽에서 렌더된다.
  yearsTeaching?: number;
  sessionsCount?: number;
  traineesCount?: number;
  careerHistory?: string[];
  clientCompanies?: string[];
  testimonials?: { quote: string; author: string }[];
  sampleVideoUrl?: string;
}

export interface SharedProposal {
  client: string;
  title: string;
  note: string;
  template: TemplateType;
  instructors: SharedInstructor[];
}

/** 제안서 → URL 해시에 넣을 문자열 (utf8 안전, base64 미사용) */
export function encodeProposal(p: SharedProposal): string {
  return encodeURIComponent(JSON.stringify(p));
}

/** URL 해시 문자열 → 제안서. 실패 시 null */
export function decodeProposal(raw: string): SharedProposal | null {
  try {
    const obj = JSON.parse(decodeURIComponent(raw));
    if (!obj || !Array.isArray(obj.instructors)) return null;
    return obj as SharedProposal;
  } catch {
    return null;
  }
}

/**
 * 공유 링크의 기준 도메인.
 * - NEXT_PUBLIC_SITE_URL 이 있으면 그것을 사용
 * - 없고 현재가 file://(데스크톱 앱)이면 운영 웹 주소로 대체(받는 사람이 열 수 있도록)
 * - 그 외(웹)에서는 현재 origin
 */
export function getShareBase(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, "");
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    if (origin.startsWith("http")) return origin;
  }
  return "https://fitpick-nine.vercel.app";
}
