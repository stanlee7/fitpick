// 배정 파이프라인 — 의뢰접수부터 정산까지 전부 로컬(localStorage). 백엔드/외부 추적 없음.
// 에이전시 실무 플로우(의뢰접수 → 일정조율 → 배정요청 → 확정·진행 → 정산) 그대로 단계를 둔다.
// 의뢰 건(Deal)은 수동으로 추가하거나, 제안서 링크를 만들 때 자동으로 쌓인다.

export type DealStage =
  | "inquiry" // 의뢰접수
  | "coordinating" // 제안·조율
  | "requested" // 배정요청
  | "confirmed" // 확정·진행
  | "settled" // 정산완료
  | "lost"; // 무산

export interface Deal {
  id: string;
  client: string;
  title: string;
  stage: DealStage;
  createdAt: number;
  updatedAt: number;
  memo?: string;
  instructorNames?: string; // 배정/후보 강사 (자유 텍스트)
  lectureDate?: string; // 강의 예정일 (YYYY-MM-DD)
  fee?: number; // 강의료(원) — 정산 관리용
  proposalPid?: string; // 연결된 공유 제안서 링크의 pid
}

export const STAGE_LABELS: Record<DealStage, string> = {
  inquiry: "의뢰접수",
  coordinating: "제안·조율",
  requested: "배정요청",
  confirmed: "확정·진행",
  settled: "정산완료",
  lost: "무산",
};

export const STAGE_HINTS: Record<DealStage, string> = {
  inquiry: "고객사 문의 기록",
  coordinating: "제안서 발송·일정 조율",
  requested: "강사 배정 요청",
  confirmed: "강의 확정·진행",
  settled: "정산 완료된 건",
  lost: "무산된 건",
};

// 화면에 깔리는 칸반 컬럼 순서. 무산은 ◀▶ 이동 대상이 아니라 별도 액션으로만 진입한다.
export const STAGE_ORDER: DealStage[] = [
  "inquiry",
  "coordinating",
  "requested",
  "confirmed",
  "settled",
  "lost",
];

export const ACTIVE_STAGES: DealStage[] = [
  "inquiry",
  "coordinating",
  "requested",
  "confirmed",
  "settled",
];

const KEY = "fitpick_deals";
const LEGACY_KEY = "fitpick_sent_proposals";

// 짧은 식별자 생성 (의뢰 건 id / 제안서 링크 pid 공용)
export function genPid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function getDeals(): Deal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
    return migrateLegacy();
  } catch {
    return [];
  }
}

// 구 "보낸 제안서 관리"(fitpick_sent_proposals) 기록을 파이프라인 건으로 1회 변환.
// 구 키는 지우지 않는다(구버전 데스크톱과 병행 사용 대비).
function migrateLegacy(): Deal[] {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return [];
    const legacy: {
      pid: string;
      client: string;
      title: string;
      createdAt: number;
      status?: string;
      memo?: string;
    }[] = JSON.parse(raw);

    const stageMap: Record<string, DealStage> = {
      sent: "coordinating",
      opened: "coordinating",
      replied: "coordinating",
      progress: "requested",
      won: "confirmed",
      lost: "lost",
    };

    const deals: Deal[] = legacy.map((p) => ({
      id: p.pid,
      client: p.client,
      title: p.title,
      stage: stageMap[p.status || "sent"] || "coordinating",
      createdAt: p.createdAt,
      updatedAt: p.createdAt,
      memo: p.memo,
      proposalPid: p.pid,
    }));
    writeAll(deals);
    return deals;
  } catch {
    return [];
  }
}

function writeAll(list: Deal[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 500)));
  } catch {
    /* localStorage 한계 등은 조용히 무시 */
  }
}

export function addDeal(
  input: Pick<Deal, "client" | "title"> & Partial<Deal>
): Deal {
  const now = Date.now();
  const deal: Deal = {
    id: genPid(),
    stage: "inquiry",
    createdAt: now,
    updatedAt: now,
    ...input,
  };
  const list = getDeals();
  list.unshift(deal);
  writeAll(list);
  return deal;
}

export function updateDeal(id: string, patch: Partial<Deal>): void {
  const list = getDeals().map((d) =>
    d.id === id ? { ...d, ...patch, updatedAt: Date.now() } : d
  );
  writeAll(list);
}

export function deleteDeal(id: string): void {
  writeAll(getDeals().filter((d) => d.id !== id));
}

// 제안서 링크 생성 시 호출 — 같은 고객사·주제의 접수/조율 단계 건이 있으면
// 그 건에 제안서를 연결하고 조율 단계로 올린다(링크 재복사 때 중복 건 방지).
export function upsertDealFromProposal(
  pid: string,
  client: string,
  title: string
): void {
  const existing = getDeals().find(
    (d) =>
      (d.stage === "inquiry" || d.stage === "coordinating") &&
      d.client === client &&
      d.title === title
  );
  if (existing) {
    updateDeal(existing.id, { stage: "coordinating", proposalPid: pid });
  } else {
    addDeal({ client, title, stage: "coordinating", proposalPid: pid });
  }
}
