"use client";

// 등록 신청 가져오기 — /register 로 들어온 강사 신청(Supabase)을 풀에 추가.
// service_role 키는 이 PC의 localStorage에만 저장 (Anthropic 키와 동일한 로컬 보안 모델).

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Instructor } from "../data/mockInstructors";
import {
  fetchRegistrations,
  registrationToInstructor,
  loadImportedIds,
  saveImportedIds,
  SERVICE_KEY_STORAGE,
  RegistrationRow,
} from "../lib/registry";
import { track } from "../lib/analytics";

interface RegistrationImportProps {
  existingInstructors: Instructor[];
  onClose: () => void;
  onImportSuccess: (insts: Instructor[]) => void;
}

export default function RegistrationImport({ existingInstructors, onClose, onImportSuccess }: RegistrationImportProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const [serviceKey, setServiceKey] = useState(
    typeof window !== "undefined" ? localStorage.getItem(SERVICE_KEY_STORAGE) || "" : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState<RegistrationRow[] | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  const registerUrl = useMemo(() => {
    if (typeof window === "undefined") return "/register";
    const site = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    return `${site.replace(/\/$/, "")}/register`;
  }, []);

  const importedIds = useMemo(() => loadImportedIds(), []);
  const existingEmails = useMemo(
    () => new Set(existingInstructors.map((i) => i.email.trim().toLowerCase()).filter(Boolean)),
    [existingInstructors]
  );

  const isAlreadyIn = (row: RegistrationRow) =>
    importedIds.has(String(row.id)) || existingEmails.has(row.email.trim().toLowerCase());

  const handleLoad = async () => {
    setError("");
    if (!serviceKey.trim()) return setError("Supabase service_role 키를 입력해 주세요.");
    try {
      localStorage.setItem(SERVICE_KEY_STORAGE, serviceKey.trim());
    } catch {
      /* ignore */
    }
    setLoading(true);
    try {
      const data = await fetchRegistrations(serviceKey.trim());
      setRows(data);
      setChecked(new Set(data.filter((r) => !isAlreadyIn(r)).map((r) => String(r.id))));
    } catch (e) {
      setError(e instanceof Error ? e.message : "신청 목록을 불러오지 못했습니다.");
    }
    setLoading(false);
  };

  const toggleRow = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleImport = () => {
    if (!rows) return;
    const picked = rows.filter((r) => checked.has(String(r.id)));
    if (!picked.length) return alert("가져올 신청을 선택해 주세요.");
    const insts = picked.map(registrationToInstructor);
    const nextImported = new Set(importedIds);
    picked.forEach((r) => nextImported.add(String(r.id)));
    saveImportedIds(nextImported);
    onImportSuccess(insts);
    track("registration_import", { count: insts.length });
    alert(`✅ 등록 신청 ${insts.length}건을 강사 풀에 추가했습니다.`);
    onClose();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(registerUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
      track("register_link_copy");
    } catch {
      prompt("아래 링크를 복사하세요:", registerUrl);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-[4px] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-[32px] border border-slate-100 w-full max-w-lg overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.15)] relative my-auto">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-blue" />
        <div className="p-8 pt-9 max-h-[88vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2.5">
              <svg className="w-5 h-5 text-brand-blue" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.981l7.5-4.039a2.25 2.25 0 012.134 0l7.5 4.039a2.25 2.25 0 011.183 1.98V19.5z" />
              </svg>
              <h2 className="text-lg font-outfit font-extrabold text-slate-900">강사 등록 신청함</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 공유용 등록 링크 */}
          <div className="bg-blue-50/50 border border-blue-100/60 rounded-2xl p-4 mb-4 space-y-2">
            <p className="text-[11px] font-bold text-brand-blue">📮 강사에게 공유하는 등록 링크</p>
            <div className="flex gap-1.5">
              <input
                readOnly
                value={registerUrl}
                className="flex-1 min-w-0 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-slate-600 focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-brand-blue hover:bg-brand-blue-hover text-white text-[11px] font-bold cursor-pointer"
              >
                {copied ? "복사됨!" : "복사"}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              강사가 이 링크로 신청하면 아래 신청함에 쌓입니다. (구 AgentL 강사풀 신청 포함)
            </p>
          </div>

          {/* 연결 단계 */}
          {!rows && (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Supabase service_role 키
                </label>
                <input
                  type="password"
                  value={serviceKey}
                  onChange={(e) => setServiceKey(e.target.value)}
                  placeholder="eyJhbGciOi... (supabase.com → 프로젝트 → Settings → API Keys)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 focus:outline-none focus:border-brand-blue"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  신청자 개인정보 보호를 위해 관리자 키로만 열람됩니다. 키는 이 PC에만 저장돼요.
                </p>
              </div>

              {error && (
                <p className="text-[11px] text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 leading-relaxed">{error}</p>
              )}

              <button
                onClick={handleLoad}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold shadow-sm active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? "불러오는 중..." : "신청 목록 불러오기"}
              </button>
            </div>
          )}

          {/* 목록 단계 */}
          {rows && (
            <div className="space-y-3">
              {rows.length === 0 ? (
                <div className="text-center py-8 space-y-1.5">
                  <p className="text-sm font-semibold text-slate-700">아직 등록 신청이 없습니다</p>
                  <p className="text-[11px] text-slate-400">위 등록 링크를 강사들에게 공유해 보세요.</p>
                </div>
              ) : (
                <>
                  <div className="text-[11px] rounded-xl px-3 py-2 border bg-blue-50 border-blue-100 text-brand-blue">
                    신청 <strong>{rows.length}건</strong> — 이미 풀에 있는 신청은 자동으로 체크 해제됩니다.
                  </div>
                  <div className="space-y-1.5 max-h-[38vh] overflow-y-auto pr-1">
                    {rows.map((row) => {
                      const id = String(row.id);
                      const dup = isAlreadyIn(row);
                      return (
                        <label
                          key={id}
                          className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                            checked.has(id) ? "bg-brand-blue-light/60 border-brand-blue/20" : "bg-white border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked.has(id)}
                            onChange={() => toggleRow(id)}
                            className="mt-0.5 accent-brand-blue"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              {(row.name || "").trim() || row.email.split("@")[0]}
                              {dup && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-500">
                                  이미 추가됨
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate">{row.email}</p>
                            {(row.specialties?.length ?? 0) > 0 && (
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">{row.specialties.join(" · ")}</p>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setRows(null)}
                      className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                    >
                      다시
                    </button>
                    <button
                      onClick={handleImport}
                      className="flex-1 py-3 rounded-2xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                    >
                      {checked.size}건 강사 풀에 추가하기
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
