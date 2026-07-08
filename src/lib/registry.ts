// 강사 등록 신청(구 AgentL 강사풀) — Supabase REST 연동. 의존성 없이 fetch 직접 호출.
//
// 구조:
// - 공개 /register 페이지 → anon 키로 INSERT만 (RLS가 SELECT를 막아 신청자 정보는 공개되지 않음)
// - 대시보드 "등록 신청 가져오기" → 큐레이터 본인의 service_role 키로 SELECT
//   (키는 localStorage에만 저장 — Anthropic 키와 같은 로컬 보안 모델)
//
// anon 키는 공개용으로 설계된 값(구 agentl-pool.vercel.app 번들에도 노출)이라 하드코딩합니다.
// 예전에 Vercel 환경변수가 비어 배포 폼이 조용히 깨졌던 사고 방지 차원에서도 상수가 안전.

import { Instructor } from "../data/mockInstructors";
import { avatarFor } from "./avatar";

export const SUPABASE_URL = "https://jpostisvogzfonoememu.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impwb3N0aXN2b2d6Zm9ub2VtZW11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMzcyNzUsImV4cCI6MjA5NTkxMzI3NX0.G8freA_DGaCEEveVE-FEPi-qEpn7qL8unbF5Qq6iHMA";

export const SERVICE_KEY_STORAGE = "fitpick_supabase_service_key";
export const IMPORTED_IDS_STORAGE = "fitpick_imported_registration_ids";

const REST = `${SUPABASE_URL}/rest/v1/instructors`;

// AgentL 시절부터 쓰던 instructors 테이블 스키마 그대로
export interface RegistrationInput {
  name: string | null;
  email: string;
  linkedin_url: string;
  regions: string[];
  specialties: string[];
  target_audiences: string[];
  headline: string | null;
}

export interface RegistrationRow extends RegistrationInput {
  id: string | number;
  created_at?: string;
}

/** 공개 등록 폼 제출 (anon 키, INSERT 전용) */
export async function submitRegistration(input: RegistrationInput): Promise<void> {
  const res = await fetch(REST, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`등록 전송에 실패했습니다 (${res.status}). ${detail}`.trim());
  }
}

/** 큐레이터 가져오기 (service_role 키 필요 — RLS가 anon SELECT를 막음) */
export async function fetchRegistrations(serviceKey: string): Promise<RegistrationRow[]> {
  const res = await fetch(`${REST}?select=*&order=created_at.desc`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  });
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error("키가 올바르지 않습니다. Supabase 대시보드의 service_role 키를 확인하세요.");
    }
    throw new Error(`신청 목록을 불러오지 못했습니다 (${res.status}).`);
  }
  return (await res.json()) as RegistrationRow[];
}

export function loadImportedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(IMPORTED_IDS_STORAGE);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function saveImportedIds(ids: Set<string>): void {
  try {
    localStorage.setItem(IMPORTED_IDS_STORAGE, JSON.stringify([...ids]));
  } catch {
    /* ignore */
  }
}

/** 등록 신청 행 → FitPick 강사 카드. 신뢰신호(경력·고객사·후기)는 큐레이터가 이후 보강. */
export function registrationToInstructor(row: RegistrationRow): Instructor {
  const name = (row.name || "").trim() || row.email.split("@")[0];
  const specialties = row.specialties ?? [];
  const bioLines = [row.headline?.trim(), row.linkedin_url ? `LinkedIn: ${row.linkedin_url}` : ""]
    .filter(Boolean)
    .join("\n");
  return {
    id: `inst-reg-${row.id}`,
    name,
    role: specialties.join(" · ") || "AI 교육 강사 (분야 수정 요망)",
    avatar: avatarFor(name),
    hourlyRate: 0,
    rating: 0,
    reviewCount: 0,
    availability: "일정 협의",
    tags: [...specialties, ...(row.target_audiences ?? []), ...(row.regions ?? [])],
    bio: bioLines,
    notionUrl: "",
    email: row.email,
    phone: "",
    portfolioItems: [],
    testimonials: [],
  };
}
