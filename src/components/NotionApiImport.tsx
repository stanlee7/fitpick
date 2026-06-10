"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Instructor } from "../data/mockInstructors";
import { guessMapping, buildInstructors, FIELD_DEFS, Mapping } from "../lib/csvImport";
import { track } from "../lib/analytics";

interface NotionApiImportProps {
  onClose: () => void;
  onImportSuccess: (insts: Instructor[]) => void;
}

type DesktopApi = { notionQuery?: (opts: { token: string; databaseId: string }) => Promise<{ headers: string[]; rows: string[][] }> };
function getDesktop(): DesktopApi | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { fitpickDesktop?: DesktopApi };
  return w.fitpickDesktop?.notionQuery ? w.fitpickDesktop : null;
}

// 노션 DB URL/ID에서 32자리 데이터베이스 ID 추출 (?v= 뒤의 view id는 제외)
function parseDbId(input: string): string {
  const path = input.trim().split("?")[0].replace(/-/g, "");
  const matches = path.match(/[0-9a-fA-F]{32}/g);
  return matches ? matches[matches.length - 1] : "";
}

const TOKEN_KEY = "fitpick_notion_token";

export default function NotionApiImport({ onClose, onImportSuccess }: NotionApiImportProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const desktop = getDesktop();

  const [step, setStep] = useState<"connect" | "mapping">("connect");
  const [token, setToken] = useState(typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) || "" : "");
  const [dbUrl, setDbUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Mapping | null>(null);

  const handleLoad = async () => {
    setError("");
    const dbId = parseDbId(dbUrl);
    if (!token.trim()) return setError("노션 통합 토큰을 입력해 주세요.");
    if (!dbId) return setError("올바른 노션 데이터베이스 URL 또는 ID를 입력해 주세요.");
    if (!desktop?.notionQuery) return setError("데스크톱 앱에서만 가능합니다.");

    try {
      localStorage.setItem(TOKEN_KEY, token.trim());
    } catch {
      /* ignore */
    }
    setLoading(true);
    try {
      const { headers, rows } = await desktop.notionQuery({ token: token.trim(), databaseId: dbId });
      if (!rows.length) {
        setError("데이터베이스에 행이 없거나, 통합에 공유되지 않았습니다. DB를 통합에 'Connect' 했는지 확인하세요.");
        setLoading(false);
        return;
      }
      setHeaders(headers);
      setRows(rows);
      setMapping(guessMapping(headers));
      setStep("mapping");
    } catch (e) {
      setError(e instanceof Error ? e.message : "노션에서 데이터를 불러오지 못했습니다.");
    }
    setLoading(false);
  };

  const validCount = mapping
    ? rows.filter((r) => {
        const i = mapping.name;
        return i >= 0 && i < r.length && r[i].trim().length > 0;
      }).length
    : 0;

  const handleImport = () => {
    if (!mapping) return;
    if (mapping.name < 0) return alert("'이름' 컬럼을 매핑해 주세요.");
    const insts = buildInstructors(rows, mapping);
    if (!insts.length) return alert("추가할 강사가 없습니다. '이름' 매핑을 확인하세요.");
    onImportSuccess(insts);
    track("notion_api_import", { count: insts.length });
    alert(`✅ 노션에서 ${insts.length}명의 강사를 가져왔습니다.`);
    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-[4px] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-[32px] border border-slate-100 w-full max-w-lg overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.15)] relative my-auto">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-blue" />
        <div className="p-8 pt-9 max-h-[88vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2.5">
              <svg className="w-5 h-5 text-slate-800" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.17 2.23C3 2.23 2 3.23 2 4.4v15.2C2 20.77 3 21.77 4.17 21.77h15.66C21 21.77 22 20.77 22 19.6V4.4c0-1.17-1-2.17-2.17-2.17H4.17zm11.75 3.32h2.23v12.9h-2.23V5.55zm-1.85 0v12.9H11.5L8.43 9.47v8.98H6.2V5.55h2.57l3.07 6.08V5.55h2.23z" />
              </svg>
              <h2 className="text-lg font-outfit font-extrabold text-slate-900">노션 데이터베이스 연동</h2>
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

          {/* 웹: 데스크톱 전용 안내 */}
          {!desktop && (
            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-xs text-amber-800 leading-relaxed">
                노션 <strong>API 직접 연동</strong>은 <strong>데스크톱 앱 전용</strong>입니다. (노션 API는 웹 브라우저 직접 호출을 막아둬서요.)
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                웹에서는 <strong>CSV 일괄</strong> 가져오기를 쓰세요 — 노션 DB를 <strong>Export → Markdown &amp; CSV</strong>로 내보내 올리면 됩니다. 실시간 연동이 필요하면 데스크톱 앱을 설치하세요.
              </p>
              <div className="flex gap-2 pt-1">
                <a href="/download" className="flex-1 text-center py-3 rounded-2xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold cursor-pointer">
                  데스크톱 앱 다운로드
                </a>
                <button onClick={onClose} className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer">
                  닫기
                </button>
              </div>
            </div>
          )}

          {/* 데스크톱: 연결 */}
          {desktop && step === "connect" && (
            <div className="space-y-4">
              <div className="bg-blue-50/50 border border-blue-100/60 rounded-2xl p-4 text-[11px] text-slate-600 leading-relaxed space-y-1.5">
                <p className="font-bold text-brand-blue">💡 준비 (한 번만)</p>
                <p>1. <a href="https://www.notion.so/my-integrations" target="_blank" rel="noreferrer" className="text-brand-blue underline">notion.so/my-integrations</a>에서 내부 통합 생성 → 토큰(<span className="font-mono">ntn_…</span>) 복사</p>
                <p>2. 강사 데이터베이스 페이지 → <strong>···</strong> → <strong>Connections</strong> → 만든 통합 연결</p>
                <p>3. 그 DB 주소를 아래에 붙여넣기</p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">노션 통합 토큰</label>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ntn_..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 focus:outline-none focus:border-brand-blue"
                />
                <p className="text-[10px] text-slate-400 mt-1">이 PC에만 저장됩니다.</p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">데이터베이스 URL 또는 ID</label>
                <input
                  type="text"
                  value={dbUrl}
                  onChange={(e) => setDbUrl(e.target.value)}
                  placeholder="https://notion.so/...  또는  32자리 ID"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-brand-blue"
                />
              </div>

              {error && (
                <p className="text-[11px] text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 leading-relaxed">{error}</p>
              )}

              <button
                onClick={handleLoad}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold shadow-sm active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? "노션에서 불러오는 중..." : "강사 불러오기"}
              </button>
            </div>
          )}

          {/* 데스크톱: 매핑 */}
          {desktop && step === "mapping" && mapping && (
            <div className="space-y-3">
              <div className="text-[11px] rounded-xl px-3 py-2 border bg-blue-50 border-blue-100 text-brand-blue">
                노션에서 총 <strong>{validCount}명</strong> 불러옴. 열 매칭을 확인하고 추가하세요.
              </div>
              <div className="space-y-1.5 max-h-[44vh] overflow-y-auto pr-1">
                {FIELD_DEFS.map((def) => (
                  <div key={def.key} className="flex items-center gap-2">
                    <label className="text-[11px] font-semibold text-slate-600 w-28 shrink-0">
                      {def.label}
                      {def.required && <span className="text-rose-500"> *</span>}
                    </label>
                    <select
                      value={mapping[def.key]}
                      onChange={(e) => setMapping({ ...mapping, [def.key]: Number(e.target.value) })}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] text-slate-700 focus:outline-none focus:border-brand-blue"
                    >
                      <option value={-1}>(매핑 안 함)</option>
                      {headers.map((h, i) => (
                        <option key={i} value={i}>
                          {h || `열 ${i + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setStep("connect")} className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer">
                  다시
                </button>
                <button onClick={handleImport} className="flex-1 py-3 rounded-2xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold shadow-sm active:scale-[0.98] transition-all cursor-pointer">
                  {validCount}명 강사 풀에 추가하기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
