"use client";

import React, { useEffect, useState } from "react";
import {
  getDeals,
  addDeal,
  updateDeal,
  deleteDeal,
  Deal,
  DealStage,
  STAGE_LABELS,
  STAGE_HINTS,
  STAGE_ORDER,
  ACTIVE_STAGES,
} from "../lib/pipeline";
import { track } from "../lib/analytics";

function fmtDate(ts: number): string {
  try {
    const d = new Date(ts);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  } catch {
    return "-";
  }
}

function fmtLectureDate(iso?: string): string {
  if (!iso) return "";
  const [, m, d] = iso.split("-");
  return m && d ? `${Number(m)}/${Number(d)} 강의` : "";
}

const stageAccent: Record<DealStage, string> = {
  inquiry: "border-t-slate-300",
  coordinating: "border-t-blue-400",
  requested: "border-t-violet-400",
  confirmed: "border-t-amber-400",
  settled: "border-t-emerald-400",
  lost: "border-t-rose-200",
};

const stageCount: Record<DealStage, string> = {
  inquiry: "bg-slate-100 text-slate-500",
  coordinating: "bg-blue-50 text-brand-blue",
  requested: "bg-violet-50 text-violet-600",
  confirmed: "bg-amber-50 text-amber-600",
  settled: "bg-emerald-50 text-emerald-600",
  lost: "bg-rose-50 text-rose-400",
};

export default function PipelineBoard() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newClient, setNewClient] = useState("");
  const [newTitle, setNewTitle] = useState("");

  const reload = () => setDeals(getDeals());

  useEffect(() => {
    reload();
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.trim()) return;
    addDeal({ client: newClient.trim(), title: newTitle.trim() || "강의 의뢰" });
    track("deal_added", { method: "manual" });
    setNewClient("");
    setNewTitle("");
    setShowAdd(false);
    reload();
  };

  const handleMove = (deal: Deal, dir: -1 | 1) => {
    const idx = ACTIVE_STAGES.indexOf(deal.stage);
    if (idx < 0) return; // 무산 건은 ◀▶ 이동 없음
    const next = ACTIVE_STAGES[idx + dir];
    if (!next) return;
    updateDeal(deal.id, { stage: next });
    track("deal_stage_changed", { from: deal.stage, to: next });
    reload();
  };

  const handlePatch = (id: string, patch: Partial<Deal>) => {
    updateDeal(id, patch);
    reload();
  };

  const handleLost = (deal: Deal) => {
    updateDeal(deal.id, { stage: "lost" });
    track("deal_stage_changed", { from: deal.stage, to: "lost" });
    reload();
  };

  const handleRestore = (deal: Deal) => {
    updateDeal(deal.id, { stage: "inquiry" });
    reload();
  };

  const handleDelete = (deal: Deal) => {
    if (confirm(`'${deal.client || "의뢰사"}' 건을 파이프라인에서 삭제할까요?`)) {
      deleteDeal(deal.id);
      reload();
    }
  };

  const settledSum = deals
    .filter((d) => d.stage === "settled" && d.fee)
    .reduce((sum, d) => sum + (d.fee || 0), 0);

  return (
    <div className="glass-panel p-5 rounded-[28px] border-slate-200/50 bg-gradient-to-br from-blue-50/20 via-white/50 to-indigo-50/20 shadow-sm space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base">📋</span>
          <div>
            <h3 className="text-xs font-bold text-slate-800">배정 파이프라인</h3>
            <p className="text-[10px] text-text-slate leading-normal">
              의뢰접수부터 정산까지 진행 단계를 직접 기록해 추적하세요. (내 PC에만 저장)
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-700 active:scale-95 transition-all cursor-pointer shadow-sm"
        >
          ＋ 의뢰 추가
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-white border border-slate-150">
          <input
            type="text"
            value={newClient}
            onChange={(e) => setNewClient(e.target.value)}
            placeholder="고객사명 *"
            autoFocus
            className="flex-1 min-w-[120px] bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-[11px] text-slate-700 focus:outline-none focus:border-brand-blue"
          />
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="강의 주제 (예: 생성형 AI 실무)"
            className="flex-[2] min-w-[160px] bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-[11px] text-slate-700 focus:outline-none focus:border-brand-blue"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white text-[11px] font-bold active:scale-95 transition-all cursor-pointer"
          >
            접수
          </button>
        </form>
      )}

      {deals.length === 0 && !showAdd ? (
        <p className="text-[11px] text-text-muted text-center py-3">
          고객사 의뢰가 들어오면 <strong>＋ 의뢰 추가</strong>로 접수하세요. 제안서 링크를 만들면 자동으로 여기에 쌓입니다.
        </p>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {STAGE_ORDER.map((stage) => {
            const items = deals.filter((d) => d.stage === stage);
            const isLost = stage === "lost";
            return (
              <div
                key={stage}
                className={`min-w-[168px] flex-1 rounded-2xl bg-white/70 border border-slate-150 border-t-2 ${stageAccent[stage]} ${isLost ? "opacity-60" : ""}`}
              >
                <div className="px-2.5 pt-2 pb-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-700">{STAGE_LABELS[stage]}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full font-mono ${stageCount[stage]}`}>
                      {items.length}
                    </span>
                  </div>
                  <p className="text-[8px] text-text-muted mt-0.5">{STAGE_HINTS[stage]}</p>
                </div>

                <div className="px-1.5 pb-1.5 space-y-1.5 max-h-[300px] overflow-y-auto">
                  {items.map((deal) => {
                    const expanded = expandedId === deal.id;
                    const stageIdx = ACTIVE_STAGES.indexOf(deal.stage);
                    return (
                      <div key={deal.id} className="p-2 rounded-xl bg-white border border-slate-150 shadow-sm space-y-1.5">
                        <button
                          type="button"
                          onClick={() => setExpandedId(expanded ? null : deal.id)}
                          className="w-full text-left cursor-pointer"
                        >
                          <p className="text-[11px] font-bold text-slate-800 truncate">{deal.client || "의뢰사"}</p>
                          <p className="text-[9px] text-text-muted truncate">{deal.title || "강의 의뢰"}</p>
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            <span className="text-[8px] text-text-muted font-mono">{fmtDate(deal.createdAt)} 접수</span>
                            {deal.lectureDate && (
                              <span className="text-[8px] font-bold text-amber-600 bg-amber-50 px-1 py-0.5 rounded">
                                {fmtLectureDate(deal.lectureDate)}
                              </span>
                            )}
                            {deal.instructorNames && (
                              <span className="text-[8px] font-semibold text-brand-blue bg-blue-50 px-1 py-0.5 rounded truncate max-w-full">
                                👤 {deal.instructorNames}
                              </span>
                            )}
                            {typeof deal.fee === "number" && deal.fee > 0 && (
                              <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded font-mono">
                                {deal.fee.toLocaleString("ko-KR")}원
                              </span>
                            )}
                            {deal.memo && <span className="text-[8px]">📝</span>}
                          </div>
                        </button>

                        {expanded && (
                          <div className="space-y-1.5 pt-1 border-t border-slate-100">
                            <input
                              type="text"
                              value={deal.instructorNames || ""}
                              onChange={(e) => handlePatch(deal.id, { instructorNames: e.target.value })}
                              placeholder="배정/후보 강사"
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[10px] text-slate-700 focus:outline-none focus:border-brand-blue"
                            />
                            <div className="flex gap-1.5">
                              <input
                                type="date"
                                value={deal.lectureDate || ""}
                                onChange={(e) => handlePatch(deal.id, { lectureDate: e.target.value })}
                                className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[10px] text-slate-700 focus:outline-none focus:border-brand-blue"
                                title="강의 예정일"
                              />
                              <input
                                type="number"
                                value={deal.fee ?? ""}
                                onChange={(e) =>
                                  handlePatch(deal.id, { fee: e.target.value ? Number(e.target.value) : undefined })
                                }
                                placeholder="강의료(원)"
                                min={0}
                                step={10000}
                                className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[10px] text-slate-700 focus:outline-none focus:border-brand-blue"
                              />
                            </div>
                            <textarea
                              value={deal.memo || ""}
                              onChange={(e) => handlePatch(deal.id, { memo: e.target.value })}
                              placeholder="예: 6/12 담당자 통화, 오전 일정 조율 중"
                              rows={2}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[10px] text-slate-700 focus:outline-none focus:border-brand-blue resize-none leading-relaxed"
                            />
                            <div className="flex items-center justify-between">
                              {isLost ? (
                                <button
                                  type="button"
                                  onClick={() => handleRestore(deal)}
                                  className="text-[9px] font-bold text-brand-blue hover:underline cursor-pointer"
                                >
                                  ↩ 접수로 복구
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleLost(deal)}
                                  className="text-[9px] font-bold text-rose-400 hover:text-rose-600 cursor-pointer"
                                >
                                  무산 처리
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDelete(deal)}
                                className="text-[9px] font-bold text-slate-300 hover:text-rose-500 cursor-pointer"
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                        )}

                        {!isLost && (
                          <div className="flex items-center justify-between pt-0.5">
                            <button
                              type="button"
                              onClick={() => handleMove(deal, -1)}
                              disabled={stageIdx <= 0}
                              className="px-1.5 py-0.5 rounded-lg text-[9px] font-bold text-slate-400 hover:text-brand-blue hover:bg-blue-50 disabled:opacity-25 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-default"
                              title="이전 단계로"
                            >
                              ◀
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMove(deal, 1)}
                              disabled={stageIdx >= ACTIVE_STAGES.length - 1}
                              className="px-1.5 py-0.5 rounded-lg text-[9px] font-bold text-slate-400 hover:text-brand-blue hover:bg-blue-50 disabled:opacity-25 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-default"
                              title="다음 단계로"
                            >
                              ▶
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {items.length === 0 && (
                    <p className="text-[9px] text-slate-300 text-center py-4 select-none">비어 있음</p>
                  )}
                </div>

                {stage === "settled" && settledSum > 0 && (
                  <div className="px-2.5 py-1.5 border-t border-slate-100">
                    <p className="text-[9px] font-bold text-emerald-600 font-mono text-right">
                      합계 {settledSum.toLocaleString("ko-KR")}원
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
