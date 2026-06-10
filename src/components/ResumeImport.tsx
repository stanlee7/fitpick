"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Instructor } from "../data/mockInstructors";
import { avatarFor } from "../lib/avatar";
import { extractTextFromFile } from "../lib/fileParse";
import { extractProfile, getApiKey, setApiKey, hasApiKey } from "../lib/aiExtract";
import { track } from "../lib/analytics";

interface ResumeImportProps {
  onClose: () => void;
  onImportSuccess: (inst: Instructor) => void;
}

type Step = "input" | "parsing" | "review";

export default function ResumeImport({ onClose, onImportSuccess }: ResumeImportProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const [step, setStep] = useState<Step>("input");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [usedAi, setUsedAi] = useState(false);
  const [fileName, setFileName] = useState("");

  // API 키 설정
  const [showKey, setShowKey] = useState(false);
  const [keyInput, setKeyInput] = useState(getApiKey());

  // 편집 가능한 추출 결과
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [careerInput, setCareerInput] = useState("");
  const [clientsInput, setClientsInput] = useState("");
  const [years, setYears] = useState<number | "">("");
  const [sessions, setSessions] = useState<number | "">("");
  const [trainees, setTrainees] = useState<number | "">("");
  const [testimonials, setTestimonials] = useState<{ quote: string; author: string }[]>([]);

  const handleFile = async (file: File) => {
    setError("");
    setFileName(file.name);
    setStep("parsing");
    try {
      setStatus("📄 파일에서 텍스트를 추출하는 중...");
      const text = await extractTextFromFile(file);

      setStatus(hasApiKey() ? "🤖 AI가 경력·고객사·후기를 구조화하는 중..." : "🔍 기본 정보를 정리하는 중...");
      const { profile, usedAi } = await extractProfile(text);

      setUsedAi(usedAi);
      setName(profile.name || "");
      setRole(profile.role || "");
      setBio(profile.bio || "");
      setTagsInput((profile.tags || []).join(", "));
      setCareerInput((profile.careerHistory || []).join(", "));
      setClientsInput((profile.clientCompanies || []).join(", "));
      setYears(profile.yearsTeaching ?? "");
      setSessions(profile.sessionsCount ?? "");
      setTrainees(profile.traineesCount ?? "");
      setTestimonials(profile.testimonials || []);
      setStep("review");
      track("resume_import", { ai: usedAi });
    } catch (e) {
      setError(e instanceof Error ? e.message : "파일을 처리하지 못했습니다.");
      setStep("input");
    }
  };

  const handleSaveKey = () => {
    setApiKey(keyInput);
    setShowKey(false);
  };

  const handleAdd = () => {
    if (!name.trim()) {
      alert("강사 이름을 입력해 주세요.");
      return;
    }
    const split = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
    const inst: Instructor = {
      id: `inst-resume-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`,
      name: name.trim(),
      role: role.trim() || "전문 분야 (수정 요망)",
      avatar: avatarFor(name.trim()),
      hourlyRate: 0,
      rating: 0,
      reviewCount: 0,
      availability: "일정 협의",
      tags: split(tagsInput),
      bio: bio.trim(),
      notionUrl: "",
      email: "",
      phone: "",
      portfolioItems: fileName ? [{ title: fileName, type: "pdf" }] : [],
      yearsTeaching: years === "" ? undefined : Number(years),
      sessionsCount: sessions === "" ? undefined : Number(sessions),
      traineesCount: trainees === "" ? undefined : Number(trainees),
      careerHistory: split(careerInput),
      clientCompanies: split(clientsInput),
      testimonials,
    };
    onImportSuccess(inst);
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
              <span className="text-xl">📑</span>
              <h2 className="text-lg font-outfit font-extrabold text-slate-900">이력서·소개서로 강사 추가</h2>
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

          {/* INPUT */}
          {step === "input" && (
            <div className="space-y-4">
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
                onClick={() => document.getElementById("resume-file-input")?.click()}
                className={`py-10 px-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                  isDragOver ? "border-brand-blue bg-blue-50/40" : "border-slate-200 bg-slate-50 hover:border-slate-300"
                }`}
              >
                <input
                  id="resume-file-input"
                  type="file"
                  accept=".pdf,.docx,.txt,.md"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  className="hidden"
                />
                <svg className="w-9 h-9 text-slate-400 mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                </svg>
                <p className="text-sm font-bold text-slate-700">이력서/소개서 파일 드래그 또는 클릭</p>
                <p className="text-[11px] text-slate-400 mt-1">PDF · DOCX · TXT 지원 (한글은 PDF로 저장 후)</p>
              </div>

              {error && (
                <p className="text-[11px] text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 leading-relaxed">{error}</p>
              )}

              {/* AI 설정 */}
              <div className="border border-slate-150 rounded-2xl p-3.5 bg-slate-50/50">
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-700"
                >
                  <span>🤖 AI 자동 정리 {hasApiKey() ? "(켜짐)" : "(꺼짐 — 키 없음)"}</span>
                  <svg className={`w-4 h-4 transition-transform ${showKey ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showKey && (
                  <div className="mt-3 space-y-2">
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      본인 Anthropic API 키를 넣으면 경력·고객사·후기까지 자동으로 정리됩니다. 키는 <strong>이 브라우저에만</strong> 저장되고 서버로 전송되지 않습니다. (키 없으면 이름·소개만 기본 추출)
                    </p>
                    <div className="flex gap-1.5">
                      <input
                        type="password"
                        value={keyInput}
                        onChange={(e) => setKeyInput(e.target.value)}
                        placeholder="sk-ant-..."
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-slate-700 focus:outline-none focus:border-brand-blue"
                      />
                      <button
                        onClick={handleSaveKey}
                        className="px-3 py-1.5 rounded-lg bg-brand-blue hover:bg-brand-blue-hover text-white text-[11px] font-bold cursor-pointer shrink-0"
                      >
                        저장
                      </button>
                    </div>
                    <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" className="text-[10px] text-brand-blue hover:underline inline-block">
                      API 키 발급받기 →
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PARSING */}
          {step === "parsing" && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <svg className="w-8 h-8 text-brand-blue animate-spin mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-xs font-bold text-slate-700">{status}</p>
              <p className="text-[10px] text-slate-400 mt-1 font-mono truncate max-w-[280px]">{fileName}</p>
            </div>
          )}

          {/* REVIEW */}
          {step === "review" && (
            <div className="space-y-3">
              <div className={`text-[11px] rounded-xl px-3 py-2 border ${usedAi ? "bg-blue-50 border-blue-100 text-brand-blue" : "bg-amber-50 border-amber-100 text-amber-700"}`}>
                {usedAi
                  ? "🤖 AI가 구조화했습니다. 확인하고 다듬어 추가하세요."
                  : "🔍 키가 없어 기본 정보만 추출했습니다. 직접 채워 추가하세요. (AI 켜면 자동 정리)"}
              </div>

              <Field label="이름">
                <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="강사명" />
              </Field>
              <Field label="전문 분야 / 타이틀">
                <input value={role} onChange={(e) => setRole(e.target.value)} className={inputCls} />
              </Field>
              <Field label="한 줄 소개">
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} className={`${inputCls} resize-none`} />
              </Field>

              <div className="grid grid-cols-3 gap-2">
                <Field label="경력(년)">
                  <input type="number" value={years} onChange={(e) => setYears(e.target.value === "" ? "" : Number(e.target.value))} className={inputCls} />
                </Field>
                <Field label="누적 강의(회)">
                  <input type="number" value={sessions} onChange={(e) => setSessions(e.target.value === "" ? "" : Number(e.target.value))} className={inputCls} />
                </Field>
                <Field label="교육 인원(명)">
                  <input type="number" value={trainees} onChange={(e) => setTrainees(e.target.value === "" ? "" : Number(e.target.value))} className={inputCls} />
                </Field>
              </div>

              <Field label="실무 경력 (쉼표로 구분)">
                <input value={careerInput} onChange={(e) => setCareerInput(e.target.value)} className={inputCls} placeholder="前 삼성전자 책임, 前 토스 PO" />
              </Field>
              <Field label="강의 진행 기업 (쉼표로 구분)">
                <input value={clientsInput} onChange={(e) => setClientsInput(e.target.value)} className={inputCls} placeholder="삼성전자, 카카오" />
              </Field>
              <Field label="핵심 태그 (쉼표로 구분)">
                <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className={inputCls} placeholder="UX/UI, 피그마" />
              </Field>

              {testimonials.length > 0 && (
                <p className="text-[10px] text-slate-500">📝 후기 {testimonials.length}건이 함께 등록됩니다.</p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setStep("input")}
                  className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  다시
                </button>
                <button
                  onClick={handleAdd}
                  className="flex-1 py-3 rounded-2xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                >
                  강사 풀에 추가하기
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

const inputCls =
  "w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">{label}</label>
      {children}
    </div>
  );
}
