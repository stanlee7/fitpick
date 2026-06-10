// 보낸 제안서 파이프라인 — 전부 로컬(localStorage). 백엔드/외부 추적 없음.
// 큐레이터가 제안서를 보낼 때 자동으로 쌓이고, 상태/메모는 직접 기록한다.

export type ProposalStatus = "sent" | "opened" | "replied" | "progress" | "won" | "lost";

export interface SentProposal {
  pid: string;
  client: string;
  title: string;
  createdAt: number;
  status?: ProposalStatus;
  memo?: string;
}

export const STATUS_LABELS: Record<ProposalStatus, string> = {
  sent: "보냄",
  opened: "열람 확인",
  replied: "회신 옴",
  progress: "진행 중",
  won: "계약 ✓",
  lost: "종료",
};

export const STATUS_ORDER: ProposalStatus[] = [
  "sent",
  "opened",
  "replied",
  "progress",
  "won",
  "lost",
];

const KEY = "fitpick_sent_proposals";

// 짧은 제안서 식별자 생성(링크에 부여)
export function genPid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function getSentProposals(): SentProposal[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function writeAll(list: SentProposal[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 300)));
  } catch {
    /* localStorage 한계 등은 조용히 무시 */
  }
}

export function saveSentProposal(p: SentProposal): void {
  const list = getSentProposals();
  list.unshift({ status: "sent", ...p });
  writeAll(list);
}

export function updateSentProposal(pid: string, patch: Partial<SentProposal>): void {
  const list = getSentProposals().map((p) => (p.pid === pid ? { ...p, ...patch } : p));
  writeAll(list);
}

export function deleteSentProposal(pid: string): void {
  writeAll(getSentProposals().filter((p) => p.pid !== pid));
}
