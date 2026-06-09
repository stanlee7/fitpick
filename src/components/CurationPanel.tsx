"use strict";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Instructor } from "../data/mockInstructors";
import { track } from "../lib/analytics";
import { TemplateType, getTemplateStyles } from "../lib/templates";
import { encodeProposal, getShareBase, SharedProposal } from "../lib/proposal";

interface CurationPanelProps {
  selectedInstructors: Instructor[];
  onClearSelection: () => void;
}

export default function CurationPanel({
  selectedInstructors,
  onClearSelection,
}: CurationPanelProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const [clientName, setClientName] = useState("");
  const [inquiryTitle, setInquiryTitle] = useState("");
  const [curationNote, setCurationNote] = useState("");
  const [template, setTemplate] = useState<TemplateType>("neon");
  const [showClientPreview, setShowClientPreview] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // 추천 문구 초안 작성 상태 (로컬 템플릿 — AI 아님)
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiStatusText, setAiStatusText] = useState("");

  // Curation Request Consultation states
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [consultantName, setConsultantName] = useState("");
  const [consultantEmail, setConsultantEmail] = useState("");
  const [consultantPhone, setConsultantPhone] = useState("");
  const [consultantMessage, setConsultantMessage] = useState("");
  const [showConsultSuccessToast, setShowConsultSuccessToast] = useState(false);

  // 선택한 강사 정보를 조합해 추천 코멘트 '초안'을 만든다 (로컬 템플릿 — 실제 AI 아님).
  const handleAiGenerate = () => {
    if (selectedInstructors.length === 0) {
      alert("추천 문구 초안을 만들려면 먼저 강사를 1명 이상 제안서에 담아주세요!");
      return;
    }

    setIsAiGenerating(true);
    setAiStatusText("선택한 강사 정보로 추천 문구 초안을 구성하는 중...");

    setTimeout(() => {
      const title = inquiryTitle.trim() || "전문 맞춤형 강연";
      let generatedText = `의뢰해주신 '${title}' 주제에 적합한 검증된 강사진을 아래와 같이 추천드립니다.\n\n`;

      selectedInstructors.forEach((inst, index) => {
        const topTags = inst.tags.slice(0, 3).join(", ");
        const career = inst.yearsTeaching ? `강의 경력 ${inst.yearsTeaching}년차, ` : "";
        const clients = inst.clientCompanies && inst.clientCompanies.length > 0
          ? ` (${inst.clientCompanies.slice(0, 3).join(", ")} 등 강의 진행)`
          : "";
        generatedText += `${index + 1}. ${inst.name} 강사 — ${inst.role} (${career}#${topTags})${clients}\n`;
      });

      generatedText += `\n※ 본 초안은 자동 생성된 기본 문구입니다. 의뢰 맥락에 맞게 직접 다듬어 보내주세요.`;

      setCurationNote(generatedText);
      setIsAiGenerating(false);
      setAiStatusText("");
    }, 500);
  };

  const handleGenerateCuration = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedInstructors.length === 0) {
      alert("큐레이션 제안서에 담을 강사를 1명 이상 선택해 주세요!");
      return;
    }
    setShowClientPreview(true);
    track("proposal_created", {
      instructors: selectedInstructors.length,
      template,
    });
  };

  const handleCopyLink = () => {
    // 실제로 열리는 공유 제안서 링크 생성 — 제안서 내용을 URL 해시에 담음
    const payload: SharedProposal = {
      client: clientName || "의뢰사",
      title: inquiryTitle || "전문 강연",
      note: curationNote,
      template,
      instructors: selectedInstructors.map((inst) => ({
        name: inst.name,
        role: inst.role,
        bio: inst.bio,
        rating: inst.rating,
        reviewCount: inst.reviewCount,
        availability: inst.availability,
        materials: inst.portfolioItems.map((m) => ({ title: m.title, type: m.type })),
        // 신뢰신호 동봉
        yearsTeaching: inst.yearsTeaching,
        sessionsCount: inst.sessionsCount,
        traineesCount: inst.traineesCount,
        careerHistory: inst.careerHistory,
        clientCompanies: inst.clientCompanies,
        testimonials: inst.testimonials,
        sampleVideoUrl: inst.sampleVideoUrl,
      })),
    };
    const previewUrl = `${getShareBase()}/proposal#p=${encodeProposal(payload)}`;
    track("proposal_link_copied", { instructors: selectedInstructors.length });

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(previewUrl)
        .then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        })
        .catch(() => {
          alert("링크 복사 중 오류가 발생했습니다.");
        });
    } else {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = previewUrl;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        alert("링크 복사에 실패했습니다.");
      }
      document.body.removeChild(textArea);
    }
  };

  // 제안서를 PDF로 저장 / 인쇄 (브라우저 인쇄 대화상자 → "PDF로 저장")
  const handlePrint = () => {
    const prevTitle = document.title;
    // 저장 시 기본 파일명이 되도록 문서 제목을 임시 변경 (윈도우 파일명 금지문자 제거)
    const safeClient = (clientName || "의뢰사").replace(/[\\/:*?"<>|]/g, "").trim();
    document.title = `핏픽_강사제안서_${safeClient}`;

    const restore = () => {
      document.title = prevTitle;
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);

    track("proposal_pdf_export", { instructors: selectedInstructors.length });
    window.print();
  };

  const handleConsultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    track("consult_request", { client: clientName || "unknown" });

    // 실제 동작: 입력 내용을 메일 초안으로 만들어 기본 메일 클라이언트로 전달.
    // 수신자는 큐레이터 이메일(env)로, 없으면 사용자가 직접 채우도록 빈값.
    const to = process.env.NEXT_PUBLIC_CONSULT_EMAIL || "";
    const subject = `[강사 매칭 상담] ${clientName || "의뢰사"} · ${inquiryTitle || "강연 문의"}`;
    const body = [
      `■ 담당자/의뢰사: ${consultantName}`,
      `■ 이메일: ${consultantEmail}`,
      `■ 연락처: ${consultantPhone}`,
      "",
      "■ 문의 내용:",
      consultantMessage,
    ].join("\n");
    const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    if (typeof window !== "undefined") {
      window.location.href = mailto;
    }

    setShowConsultModal(false);
    setShowConsultSuccessToast(true);

    // Reset inputs
    setConsultantName("");
    setConsultantEmail("");
    setConsultantPhone("");
    setConsultantMessage("");

    setTimeout(() => {
      setShowConsultSuccessToast(false);
    }, 5000);
  };

  const style = getTemplateStyles(template);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-outfit font-bold text-slate-900 flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-blue"></span>
          </span>
          의뢰 큐레이션 작성기
        </h3>
        
        {selectedInstructors.length > 0 && (
          <button
            onClick={onClearSelection}
            className="text-xs text-text-muted hover:text-brand-blue underline transition-colors"
          >
            선택 초기화 ({selectedInstructors.length})
          </button>
        )}
      </div>

      {selectedInstructors.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
          <svg className="w-10 h-10 text-slate-400 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-sm font-semibold text-slate-800">선택된 강사 없음</p>
          <p className="text-xs text-text-slate mt-1 max-w-xs leading-relaxed">
            왼쪽 대시보드 카드에서 매칭할 강사의 체크박스를 클릭하여 큐레이션 보드에 담아주세요!
          </p>
        </div>
      ) : (
        <form onSubmit={handleGenerateCuration} className="flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-4 overflow-y-auto max-h-[460px] pr-1">
            {/* Selected Instructors Grid */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-text-slate uppercase tracking-wider">
                큐레이션 제안 강사 ({selectedInstructors.length}명)
              </label>
              <div className="space-y-1.5">
                {selectedInstructors.map((inst) => (
                  <div
                    key={inst.id}
                    className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-150 rounded-2xl"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={inst.avatar} alt={inst.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{inst.name}</p>
                      <p className="text-[10px] text-text-muted truncate">{inst.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Input fields */}
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-text-slate uppercase tracking-wider block mb-1">
                  클라이언트명
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: SK하이닉스 교육기획팀"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-text-slate uppercase tracking-wider block mb-1">
                  의뢰 강의명 / 주제
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 신입 디자이너 대상 피그마 실무 워크숍"
                  value={inquiryTitle}
                  onChange={(e) => setInquiryTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-semibold text-text-slate uppercase tracking-wider">
                    큐레이션 추천 코멘트 (에이전시 종합 소견)
                  </label>
                  <button
                    type="button"
                    disabled={isAiGenerating}
                    onClick={handleAiGenerate}
                    className="flex items-center gap-1.5 text-[9px] px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200 font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm active:scale-95"
                    title="선택한 강사 정보로 추천 문구 초안을 자동 작성합니다 (직접 다듬어 사용)"
                  >
                    {isAiGenerating ? (
                      <span className="flex h-1.5 w-1.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-slate-500"></span>
                      </span>
                    ) : (
                      "✍️"
                    )}
                    추천 문구 초안 작성
                  </button>
                </div>
                
                {isAiGenerating ? (
                  <div className="w-full bg-purple-50/40 border border-purple-100/60 rounded-2xl px-4 py-6 flex flex-col items-center justify-center text-center space-y-2.5 animate-pulse min-h-[96px]">
                    <svg className="w-5 h-5 text-purple-600 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-[10px] font-bold text-purple-800 leading-normal font-mono">{aiStatusText}</p>
                  </div>
                ) : (
                  <textarea
                    placeholder="예: 의뢰하신 목적에 가장 알맞은 포트폴리오를 보유한 정예 강사진입니다. 실습 위주의 진행과 풍부한 대기업 레퍼런스를 보유하여 성공적인 교육이 보장됩니다."
                    value={curationNote}
                    onChange={(e) => setCurationNote(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all resize-none leading-relaxed placeholder:text-slate-400"
                  />
                )}
              </div>
            </div>

            {/* Template selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-text-slate uppercase tracking-wider">
                제안서 디자인 템플릿 선택
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["neon", "minimal", "notion", "gold"] as TemplateType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTemplate(t)}
                    className={`py-3 px-3 rounded-2xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                      template === t
                        ? "bg-brand-blue-light border-brand-blue/30 text-brand-blue shadow-sm"
                        : "bg-slate-50 border-slate-200 text-text-slate hover:bg-slate-100/60"
                    }`}
                  >
                    {t === "neon" && "✨ Neon Light"}
                    {t === "minimal" && "🕊️ Minimal White"}
                    {t === "notion" && "📓 Notion Style"}
                    {t === "gold" && "👑 Gold Premium"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-brand-blue text-white font-outfit font-bold rounded-2xl shadow-[0_4px_15px_rgba(49,130,246,0.18)] hover:bg-brand-blue-hover active:scale-[0.98] transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18V6c0-1.1.9-2 2-2h9v3.75a1.125 1.125 0 001.125 1.125z" />
            </svg>
            클라이언트 제안 페이지 자동 생성 및 발송
          </button>
        </form>
      )}

      {/* CLIENT CURATION PREVIEW MODAL */}
      {showClientPreview && mounted && createPortal(
        <div className="fitpick-print-overlay fixed inset-0 z-[9999] bg-slate-900/30 backdrop-blur-[4px] overflow-y-auto p-4 md:p-8 flex justify-center">
          <div className={`fitpick-print-modal w-full max-w-4xl rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)] my-auto border border-slate-100 relative ${style.wrapper}`}>

            {/* Modal Controls Banner (Agency Only view) */}
            <div className="no-print sticky top-0 z-40 bg-white text-slate-800 px-6 py-4.5 flex flex-wrap items-center justify-between border-b border-slate-100 gap-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-brand-blue-light text-brand-blue text-[10px] font-bold rounded-lg border border-brand-blue/10">
                  에이전시 프리뷰
                </span>
                <span className="text-xs text-text-slate font-medium">
                  선택한 디자인 템플릿: <strong className="text-slate-900">{style.title}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                  </svg>
                  PDF로 저장 / 인쇄
                </button>

                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z" />
                  </svg>
                  {isCopied ? "링크 복사 완료!" : "공유 제안 링크 복사"}
                </button>

                <button
                  onClick={() => setShowClientPreview(false)}
                  className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 text-xs font-bold transition-all cursor-pointer"
                >
                  프리뷰 닫기
                </button>
              </div>
            </div>

            {/* ACTUAL CLIENT VIEW */}
            <div className="fitpick-print-area p-6 md:p-12 space-y-8 max-w-3xl mx-auto">
              
              {/* Header Title Block */}
              <div className="text-center space-y-3.5 pb-6 border-b border-slate-200/60">
                <span className={`text-[10px] tracking-widest font-bold uppercase ${style.accentColor}`}>
                  ★ FITPICK 큐레이션 강사 제안서
                </span>
                <h1 className={`text-2xl md:text-4xl font-outfit font-black leading-tight ${style.headerBg}`}>
                  {clientName || "의뢰사"} 추천 강사 리스트
                </h1>
                <p className="text-xs md:text-sm text-text-slate font-medium max-w-lg mx-auto">
                  의뢰 주제: <strong className="text-slate-800">{inquiryTitle || "전문 맞춤형 강연 의뢰"}</strong>
                </p>
              </div>

              {/* Agency Comment Card */}
              <div className={`p-6 ${style.card} leading-relaxed space-y-3.5`}>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-brand-blue-light border border-brand-blue/20 flex items-center justify-center text-[10px] text-brand-blue font-bold">
                    ✍
                  </div>
                  <span className="text-xs font-extrabold text-slate-800">에이전시 종합 제안 소견</span>
                </div>
                <p className="text-xs md:text-sm text-slate-700 font-normal whitespace-pre-wrap pl-8 leading-relaxed">
                  {curationNote || "의뢰하신 분야의 핵심 성공 요인을 완벽히 충족하며, 검증된 경력과 훌륭한 강의 피드백을 축적한 최고의 전문가들을 엄선하여 추천드립니다. 하단의 강의 계획 자료를 바로 다운로드하실 수 있습니다."}
                </p>
              </div>

              {/* Recommended Instructors List */}
              <div className="space-y-6">
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                  추천 강사 리스트 ({selectedInstructors.length})
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedInstructors.map((inst) => (
                    <div
                      key={inst.id}
                      className={`print-card p-6 ${style.card} space-y-4`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-100 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={inst.avatar} alt={inst.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-outfit font-bold text-base text-slate-900">{inst.name} 강사</h3>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${style.badgeColor}`}>
                              {inst.availability}
                            </span>
                          </div>
                          <p className="text-xs text-text-slate font-normal leading-snug mt-1">{inst.role}</p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-650 font-normal leading-relaxed min-h-[50px]">
                        {inst.bio}
                      </p>

                      {/* 신뢰신호: 강의경력(검증 #1) */}
                      <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 bg-slate-50/50 px-2 rounded-2xl">
                        <div className="text-center border-r border-slate-200/60">
                          <span className="text-[9px] text-text-muted font-bold block">강의 경력</span>
                          <p className="text-xs font-bold text-slate-800 mt-0.5">{inst.yearsTeaching ? `${inst.yearsTeaching}년차` : "—"}</p>
                        </div>
                        <div className="text-center border-r border-slate-200/60">
                          <span className="text-[9px] text-text-muted font-bold block">누적 강의</span>
                          <p className="text-xs font-bold text-slate-800 mt-0.5">{inst.sessionsCount ? `${inst.sessionsCount}회` : "—"}</p>
                        </div>
                        <div className="text-center">
                          <span className="text-[9px] text-text-muted font-bold block">교육 인원</span>
                          <p className="text-xs font-bold text-slate-800 mt-0.5">{inst.traineesCount ? `${inst.traineesCount.toLocaleString()}명` : "—"}</p>
                        </div>
                      </div>

                      {/* 신뢰신호: 기업재직경력(검증 #2) */}
                      {inst.careerHistory && inst.careerHistory.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">실무 경력</span>
                          <p className="text-[11px] text-slate-700 font-medium leading-snug">{inst.careerHistory.join("  ·  ")}</p>
                        </div>
                      )}

                      {/* 신뢰신호: 강의 진행 기업(사회적 증거) */}
                      {inst.clientCompanies && inst.clientCompanies.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">강의 진행 기업</span>
                          <div className="flex flex-wrap gap-1">
                            {inst.clientCompanies.map((c, ci) => (
                              <span key={ci} className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-semibold">{c}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 신뢰신호: 실제 수강 후기 */}
                      {inst.testimonials && inst.testimonials.length > 0 && (
                        <div className="rounded-2xl bg-brand-blue-light/40 border border-brand-blue/10 p-3 space-y-1.5">
                          <p className="text-[11px] text-slate-700 italic leading-relaxed">“{inst.testimonials[0].quote}”</p>
                          <p className="text-[9px] text-text-muted font-semibold text-right">— {inst.testimonials[0].author}</p>
                        </div>
                      )}

                      {/* 평점 + 샘플영상 */}
                      <div className="flex items-center justify-between pt-0.5">
                        <span className="text-[11px] font-bold text-slate-800">★ {inst.rating.toFixed(1)} <span className="text-text-muted font-normal">/ 5.0 (후기 {inst.reviewCount})</span></span>
                        {inst.sampleVideoUrl && (
                          <a
                            href={inst.sampleVideoUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] font-bold text-brand-blue hover:underline flex items-center gap-1"
                          >
                            ▶ 강의 샘플 영상
                          </a>
                        )}
                      </div>

                      {/* Downloadable Materials for Clients */}
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                          📋 공유 제안 및 계획서 자료 다운로드
                        </span>
                        {inst.portfolioItems.map((item, index) => (
                          <a
                            key={index}
                            href="#download"
                            onClick={(e) => {
                              e.preventDefault();
                              alert(`'${item.title}'\n자료 원본은 강사에게 요청해 제안서에 첨부해 주세요.`);
                            }}
                            className="flex items-center p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-150 text-xs text-text-slate hover:text-slate-900 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5 text-brand-blue mr-2 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="truncate flex-1 font-mono text-[10px] font-medium">{item.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Call to Action for Clients */}
              <div className="text-center pt-8 border-t border-slate-200/60 space-y-4">
                <p className="text-xs text-text-slate font-medium">
                  마음에 드는 강사를 선택하셨거나 상세 일정 및 견적 조율이 필요하신가요?
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowConsultModal(true);
                  }}
                  className={`px-8 py-3.5 rounded-2xl shadow-lg transition-all active:scale-95 text-xs md:text-sm font-bold cursor-pointer ${style.button}`}
                >
                  추천 강사 매칭 조율 상담 요청하기
                </button>
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 1. CONSULTATION REQUEST MODAL */}
      {showConsultModal && mounted && createPortal(
        <div className="fixed inset-0 z-[10000] bg-slate-900/40 backdrop-blur-[5px] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border border-slate-100 w-full max-w-md overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.15)] relative animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-blue"></div>
            
            <div className="p-8 pt-10">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50/70 border border-blue-100 text-brand-blue">
                    <svg className="w-5 h-5 text-brand-blue" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-950 font-outfit">강사 매칭 조율 상담 신청</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowConsultModal(false)}
                  className="p-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleConsultSubmit} className="space-y-4 text-left">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">담당자 성함 / 의뢰사</label>
                  <input
                    type="text"
                    required
                    placeholder="홍길동 대리 (SK하이닉스)"
                    value={consultantName}
                    onChange={(e) => setConsultantName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-brand-blue"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">이메일</label>
                    <input
                      type="email"
                      required
                      placeholder="gildong@company.com"
                      value={consultantEmail}
                      onChange={(e) => setConsultantEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-brand-blue font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">연락처</label>
                    <input
                      type="text"
                      required
                      placeholder="010-0000-0000"
                      value={consultantPhone}
                      onChange={(e) => setConsultantPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-brand-blue font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">조율 및 상담 문의 내용</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="희망하시는 교육 일정, 선호 강사, 강의 예산 조건 등 문의 사항을 남겨주시면 큐레이터가 정교하게 맞춤 제안을 보강해 드립니다."
                    value={consultantMessage}
                    onChange={(e) => setConsultantMessage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-brand-blue resize-none leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-brand-blue hover:bg-brand-blue-hover text-white font-bold rounded-2xl shadow-[0_4px_15px_rgba(49,130,246,0.15)] active:scale-95 transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  ✉️ 조율 상담 접수하기
                </button>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 2. CONSULTATION SUCCESS TOAST */}
      {showConsultSuccessToast && mounted && createPortal(
        <div className="fixed bottom-6 right-6 z-[10001] p-5 rounded-[24px] bg-white border border-emerald-150 shadow-[0_16px_50px_rgba(45,202,115,0.15)] max-w-sm animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-success-green" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900">✉️ 메일 작성 창을 열었습니다</h4>
              <p className="text-[10px] text-text-slate mt-1 leading-relaxed">
                입력하신 내용으로 메일 초안이 만들어졌습니다. <strong>전송</strong>하시면 큐레이터에게 문의가 전달됩니다.
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
