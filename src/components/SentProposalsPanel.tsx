"use client";

import React, { useEffect, useState } from "react";
import {
  getSentProposals,
  updateSentProposal,
  deleteSentProposal,
  SentProposal,
  ProposalStatus,
  STATUS_LABELS,
  STATUS_ORDER,
} from "../lib/tracking";

function fmtDate(ts: number): string {
  try {
    const d = new Date(ts);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  } catch {
    return "-";
  }
}

const statusStyle: Record<ProposalStatus, string> = {
  sent: "bg-slate-100 text-slate-600 border-slate-200",
  opened: "bg-blue-50 text-brand-blue border-blue-100",
  replied: "bg-violet-50 text-violet-600 border-violet-100",
  progress: "bg-amber-50 text-amber-600 border-amber-100",
  won: "bg-emerald-50 text-emerald-600 border-emerald-100",
  lost: "bg-rose-50 text-rose-500 border-rose-100",
};

export default function SentProposalsPanel() {
  const [sent, setSent] = useState<SentProposal[]>([]);
  const [memoOpen, setMemoOpen] = useState<string | null>(null);

  const reload = () => setSent(getSentProposals());

  useEffect(() => {
    reload();
  }, []);

  if (sent.length === 0) return null;

  const handleStatus = (pid: string, status: ProposalStatus) => {
    updateSentProposal(pid, { status });
    reload();
  };
  const handleMemo = (pid: string, memo: string) => {
    updateSentProposal(pid, { memo });
    reload();
  };
  const handleDelete = (pid: string, client: string) => {
    if (confirm(`'${client || "의뢰사"}' 제안서 기록을 목록에서 삭제할까요?`)) {
      deleteSentProposal(pid);
      reload();
    }
  };

  return (
    <div className="glass-panel p-5 rounded-[28px] border-slate-200/50 bg-gradient-to-br from-blue-50/20 via-white/50 to-indigo-50/20 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-base">📨</span>
        <div>
          <h3 className="text-xs font-bold text-slate-800">보낸 제안서 관리</h3>
          <p className="text-[10px] text-text-slate leading-normal">
            보낸 제안서의 열람·회신 상태를 직접 기록해 파이프라인을 관리하세요. (내 PC에만 저장)
          </p>
        </div>
      </div>

      <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
        {sent.map((p) => (
          <div key={p.pid} className="p-3 rounded-2xl bg-white border border-slate-150 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 truncate">{p.client || "의뢰사"}</p>
                <p className="text-[10px] text-text-muted truncate">{p.title || "제안서"}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[9px] text-text-muted font-mono">{fmtDate(p.createdAt)}</span>
                <button
                  type="button"
                  onClick={() => handleDelete(p.pid, p.client)}
                  className="p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                  title="기록 삭제"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* 상태 선택 (수동) */}
              <div className="relative">
                <select
                  value={p.status || "sent"}
                  onChange={(e) => handleStatus(p.pid, e.target.value as ProposalStatus)}
                  className={`appearance-none text-[10px] font-bold pl-2.5 pr-6 py-1 rounded-full border cursor-pointer focus:outline-none ${statusStyle[p.status || "sent"]}`}
                >
                  {STATUS_ORDER.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
                <svg className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-60" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              <button
                type="button"
                onClick={() => setMemoOpen(memoOpen === p.pid ? null : p.pid)}
                className="text-[10px] font-semibold text-text-muted hover:text-brand-blue transition-colors"
              >
                {p.memo ? "📝 메모" : "＋ 메모"}
              </button>
            </div>

            {(memoOpen === p.pid || p.memo) && (
              <textarea
                value={p.memo || ""}
                onChange={(e) => handleMemo(p.pid, e.target.value)}
                placeholder="예: 6/12 담당자 통화, 예산 협의 중"
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-[11px] text-slate-700 focus:outline-none focus:border-brand-blue resize-none leading-relaxed"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
