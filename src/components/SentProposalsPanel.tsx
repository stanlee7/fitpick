"use client";

import React, { useEffect, useState } from "react";
import {
  getSentProposals,
  fetchOpens,
  trackingEnabled,
  SentProposal,
  OpenStat,
} from "../lib/tracking";

function timeAgo(iso: string | null): string {
  if (!iso) return "-";
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금 전";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  return `${d}일 전`;
}

export default function SentProposalsPanel() {
  const [sent, setSent] = useState<SentProposal[]>([]);
  const [opens, setOpens] = useState<Record<string, OpenStat>>({});
  const [loading, setLoading] = useState(false);

  const load = () => {
    if (!trackingEnabled()) return;
    const list = getSentProposals();
    setSent(list);
    if (list.length === 0) return;
    setLoading(true);
    fetchOpens(list.map((p) => p.pid)).then((stats) => {
      const map: Record<string, OpenStat> = {};
      stats.forEach((s) => {
        map[s.pid] = s;
      });
      setOpens(map);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 백엔드 미설정이거나 보낸 제안서가 없으면 패널 자체를 숨김
  if (!trackingEnabled() || sent.length === 0) return null;

  return (
    <div className="glass-panel p-5 rounded-[28px] border-slate-200/50 bg-gradient-to-br from-blue-50/20 via-white/50 to-indigo-50/20 shadow-sm space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base">📨</span>
          <div>
            <h3 className="text-xs font-bold text-slate-800">보낸 제안서 열람 현황</h3>
            <p className="text-[10px] text-text-slate leading-normal">
              공유한 제안서를 의뢰사가 열어봤는지 실시간으로 확인하세요.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={load}
          className="text-[10px] font-bold text-brand-blue hover:underline disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "불러오는 중..." : "새로고침"}
        </button>
      </div>

      <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
        {sent.map((p) => {
          const stat = opens[p.pid];
          const count = stat?.count ?? 0;
          const opened = count > 0;
          return (
            <div
              key={p.pid}
              className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-white border border-slate-150"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 truncate">{p.client || "의뢰사"}</p>
                <p className="text-[10px] text-text-muted truncate">{p.title || "제안서"}</p>
              </div>
              <div className="text-right shrink-0">
                {opened ? (
                  <>
                    <span className="text-[11px] font-extrabold text-emerald-600">열람 {count}회</span>
                    <p className="text-[9px] text-text-muted">최근 {timeAgo(stat?.lastOpenedAt ?? null)}</p>
                  </>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-400">미열람</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
