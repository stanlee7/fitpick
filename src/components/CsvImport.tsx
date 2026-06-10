"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Instructor } from "../data/mockInstructors";
import { parseCsv, guessMapping, buildInstructors, FIELD_DEFS, Mapping } from "../lib/csvImport";
import { track } from "../lib/analytics";

interface CsvImportProps {
  onClose: () => void;
  onImportSuccess: (insts: Instructor[]) => void;
}

type Step = "input" | "mapping";

export default function CsvImport({ onClose, onImportSuccess }: CsvImportProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const [step, setStep] = useState<Step>("input");
  const [error, setError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [dataRows, setDataRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Mapping | null>(null);

  const handleFile = async (file: File) => {
    setError("");
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("CSV 파일(.csv)만 지원합니다. 노션 DB → ··· → Export → Markdown & CSV 로 내보내세요.");
      return;
    }
    setFileName(file.name);
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (rows.length < 2) {
        setError("데이터가 없습니다. 헤더(첫 줄) + 최소 1명 이상의 행이 필요합니다.");
        return;
      }
      const hdr = rows[0];
      setHeaders(hdr);
      setDataRows(rows.slice(1));
      setMapping(guessMapping(hdr));
      setStep("mapping");
    } catch {
      setError("CSV를 읽지 못했습니다. 파일을 확인해 주세요.");
    }
  };

  const setField = (key: keyof Mapping, col: number) => {
    setMapping((prev) => (prev ? { ...prev, [key]: col } : prev));
  };

  const validCount = mapping
    ? dataRows.filter((r) => {
        const idx = mapping.name;
        return idx >= 0 && idx < r.length && r[idx].trim().length > 0;
      }).length
    : 0;

  const handleImport = () => {
    if (!mapping) return;
    if (mapping.name < 0) {
      alert("'이름' 컬럼은 반드시 매핑해야 합니다.");
      return;
    }
    const insts = buildInstructors(dataRows, mapping);
    if (insts.length === 0) {
      alert("추가할 강사가 없습니다. '이름' 컬럼 매핑을 확인해 주세요.");
      return;
    }
    onImportSuccess(insts);
    track("csv_import", { count: insts.length });
    alert(`✅ ${insts.length}명의 강사를 강사 풀에 추가했습니다.`);
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
              <span className="text-xl">📊</span>
              <h2 className="text-lg font-outfit font-extrabold text-slate-900">CSV로 강사 일괄 추가</h2>
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

          {step === "input" && (
            <div className="space-y-4">
              <div className="bg-blue-50/50 border border-blue-100/60 rounded-2xl p-4 text-[11px] text-slate-600 leading-relaxed space-y-1.5">
                <p className="font-bold text-brand-blue">💡 노션에서 가져오는 법</p>
                <p>노션 강사 데이터베이스 → 우상단 <strong>···</strong> → <strong>Export</strong> → 형식 <strong>Markdown &amp; CSV</strong> → 받은 <strong>.csv</strong>를 여기에 올리면, 열(이름·경력·고객사…)을 자동으로 강사 필드에 맞춰 여러 명을 한 번에 추가합니다. 엑셀에서 만든 CSV도 됩니다.</p>
              </div>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
                }}
                onClick={() => document.getElementById("csv-file-input")?.click()}
                className={`py-10 px-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                  isDragOver ? "border-brand-blue bg-blue-50/40" : "border-slate-200 bg-slate-50 hover:border-slate-300"
                }`}
              >
                <input
                  id="csv-file-input"
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  className="hidden"
                />
                <svg className="w-9 h-9 text-slate-400 mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
                </svg>
                <p className="text-sm font-bold text-slate-700">CSV 파일 드래그 또는 클릭</p>
                <p className="text-[11px] text-slate-400 mt-1">노션 Export 또는 엑셀 CSV (.csv)</p>
              </div>

              {error && (
                <p className="text-[11px] text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 leading-relaxed">{error}</p>
              )}
            </div>
          )}

          {step === "mapping" && mapping && (
            <div className="space-y-3">
              <div className="text-[11px] rounded-xl px-3 py-2 border bg-blue-50 border-blue-100 text-brand-blue">
                📄 <strong className="font-mono">{fileName}</strong> — 총 <strong>{validCount}명</strong> 감지. 열 매칭을 확인하고 추가하세요.
              </div>

              <p className="text-[10px] text-slate-400">CSV의 어느 열을 어떤 필드로 가져올지 지정합니다. (자동 추측됨)</p>

              <div className="space-y-1.5 max-h-[42vh] overflow-y-auto pr-1">
                {FIELD_DEFS.map((def) => (
                  <div key={def.key} className="flex items-center gap-2">
                    <label className="text-[11px] font-semibold text-slate-600 w-28 shrink-0">
                      {def.label}
                      {def.required && <span className="text-rose-500"> *</span>}
                    </label>
                    <select
                      value={mapping[def.key]}
                      onChange={(e) => setField(def.key, Number(e.target.value))}
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
                <button
                  onClick={() => setStep("input")}
                  className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  다시
                </button>
                <button
                  onClick={handleImport}
                  className="flex-1 py-3 rounded-2xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                >
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
