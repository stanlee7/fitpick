// 제안서 열람 추적 — 백엔드(NEXT_PUBLIC_API_URL) 설정 시에만 동작.
// 미설정이면 모든 함수가 무해하게 비활성(no-op)되어 기존 앱 동작에 영향 없음.

const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

export interface SentProposal {
  pid: string;
  client: string;
  title: string;
  createdAt: number;
}

export interface OpenStat {
  pid: string;
  count: number;
  lastOpenedAt: string | null;
}

const KEY = "fitpick_sent_proposals";

export function trackingEnabled(): boolean {
  return !!API;
}

// 짧은 제안서 식별자 생성 (브라우저)
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

export function saveSentProposal(p: SentProposal): void {
  if (typeof window === "undefined") return;
  try {
    const list = getSentProposals();
    list.unshift(p);
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 200)));
  } catch {
    /* localStorage 한계 등은 조용히 무시 */
  }
}

// 제안서 열람 시 백엔드에 1건 기록(fire-and-forget)
export function pingOpen(pid: string, client: string, title: string): void {
  if (!API || !pid) return;
  try {
    fetch(`${API}/api/opens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pid, client, title }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* 네트워크 오류 무시 */
  }
}

// 큐레이터 대시보드용: 내가 보낸 pid들의 열람 집계 조회
export async function fetchOpens(pids: string[]): Promise<OpenStat[]> {
  if (!API || pids.length === 0) return [];
  try {
    const res = await fetch(`${API}/api/opens?pids=${encodeURIComponent(pids.join(","))}`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
