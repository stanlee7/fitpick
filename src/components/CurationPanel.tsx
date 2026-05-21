"use strict";

import React, { useState } from "react";
import { Instructor } from "../data/mockInstructors";

interface CurationPanelProps {
  selectedInstructors: Instructor[];
  onClearSelection: () => void;
}

type TemplateType = "neon" | "minimal" | "notion" | "gold";

export default function CurationPanel({
  selectedInstructors,
  onClearSelection,
}: CurationPanelProps) {
  const [clientName, setClientName] = useState("");
  const [inquiryTitle, setInquiryTitle] = useState("");
  const [curationNote, setCurationNote] = useState("");
  const [template, setTemplate] = useState<TemplateType>("neon");
  const [showClientPreview, setShowClientPreview] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  // Tracking alerts simulation
  const [showTrackingAlert, setShowTrackingAlert] = useState(false);

  const handleGenerateCuration = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedInstructors.length === 0) {
      alert("큐레이션 제안서에 담을 강사를 1명 이상 선택해 주세요!");
      return;
    }
    setShowClientPreview(true);
    
    // Simulate real-time tracking notification after 4 seconds
    setTimeout(() => {
      setShowTrackingAlert(true);
      // Auto-hide alert after 5 seconds
      setTimeout(() => setShowTrackingAlert(false), 5000);
    }, 4000);
  };

  const handleCopyLink = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Styles based on templates (All optimized for beautiful light backgrounds)
  const getTemplateStyles = (type: TemplateType) => {
    switch (type) {
      case "neon":
        return {
          wrapper: "bg-[#f8f9fa] text-[#191f28] font-sans",
          card: "bg-white border border-[#3182f6]/15 shadow-[0_8px_30px_rgba(49,130,246,0.04)] rounded-3xl",
          headerBg: "bg-gradient-to-r from-brand-blue to-indigo-600 text-transparent bg-clip-text",
          accentColor: "text-brand-blue",
          badgeColor: "bg-brand-blue-light text-brand-blue border-brand-blue/20",
          button: "bg-gradient-to-r from-brand-blue to-indigo-600 text-white font-bold hover:opacity-90",
          title: "Neon Light 테마"
        };
      case "minimal":
        return {
          wrapper: "bg-[#f2f4f6] text-[#191f28] font-sans",
          card: "bg-white border border-slate-100 shadow-sm rounded-3xl",
          headerBg: "text-slate-900 font-bold",
          accentColor: "text-slate-800",
          badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
          button: "bg-slate-900 text-white font-semibold hover:bg-slate-800",
          title: "Sleek Minimal 테마"
        };
      case "notion":
        return {
          wrapper: "bg-white text-[#191f28] font-sans",
          card: "bg-white border border-slate-200 rounded-lg shadow-none hover:shadow-sm transition-shadow",
          headerBg: "text-slate-900 font-serif border-b pb-4",
          accentColor: "text-slate-850",
          badgeColor: "bg-slate-100 text-slate-650 border-slate-200 rounded-md",
          button: "bg-white border border-slate-350 text-slate-700 font-medium hover:bg-slate-50",
          title: "Notion 표준 테마"
        };
      case "gold":
        return {
          wrapper: "bg-[#faf8f5] text-[#191f28] font-sans",
          card: "bg-white border border-amber-500/15 shadow-[0_8px_30px_rgba(217,119,6,0.03)] rounded-3xl",
          headerBg: "bg-gradient-to-r from-amber-600 to-yellow-600 text-transparent bg-clip-text",
          accentColor: "text-amber-650",
          badgeColor: "bg-amber-50 text-amber-600 border-amber-200/50",
          button: "bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold",
          title: "Premium Gold Light 테마"
        };
    }
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
                <label className="text-[10px] font-semibold text-text-slate uppercase tracking-wider block mb-1">
                  큐레이션 추천 코멘트 (에이전시 종합 소견)
                </label>
                <textarea
                  placeholder="예: 의뢰하신 목적에 가장 알맞은 포트폴리오를 보유한 정예 강사진입니다. 실습 위주의 진행과 풍부한 대기업 레퍼런스를 보유하여 성공적인 교육이 보장됩니다."
                  value={curationNote}
                  onChange={(e) => setCurationNote(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all resize-none leading-relaxed placeholder:text-slate-400"
                />
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

      {/* Real-time Tracking Alert Overlay */}
      {showTrackingAlert && (
        <div className="fixed bottom-6 left-6 z-50 p-5 rounded-[24px] bg-white border border-emerald-150 shadow-[0_12px_40px_rgba(45,202,115,0.12)] max-w-sm animate-bounce">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-success-green animate-pulse" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900">🔥 실시간 열람 알림! (추적)</h4>
              <p className="text-[10px] text-text-slate mt-1 leading-relaxed">
                클라이언트 <strong>{clientName || "의뢰사"}</strong>가 방금 스마트 제안서를 열어 강사 프로필 카드를 확인했습니다!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CLIENT CURATION PREVIEW MODAL */}
      {showClientPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-[4px] overflow-y-auto p-4 md:p-8 flex justify-center">
          <div className={`w-full max-w-4xl rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)] my-auto border border-slate-100 relative ${style.wrapper}`}>
            
            {/* Modal Controls Banner (Agency Only view) */}
            <div className="sticky top-0 z-40 bg-white text-slate-800 px-6 py-4.5 flex flex-wrap items-center justify-between border-b border-slate-100 gap-3">
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
            <div className="p-6 md:p-12 space-y-8 max-w-3xl mx-auto">
              
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
                      className={`p-6 ${style.card} space-y-4`}
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

                      {/* Client-visible Specs */}
                      <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 bg-slate-50/50 px-2 rounded-2xl">
                        <div className="text-center border-r border-slate-200/60">
                          <span className="text-[9px] text-text-muted font-bold block">평점 및 만족도</span>
                          <p className="text-xs font-bold text-slate-800 mt-0.5">★ {inst.rating.toFixed(1)} / 5.0</p>
                        </div>
                        <div className="text-center">
                          <span className="text-[9px] text-text-muted font-bold block">누적 강의 이력</span>
                          <p className="text-xs font-bold text-slate-800 mt-0.5">{inst.reviewCount}개 기업 검증</p>
                        </div>
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
                              alert(`'${item.title}' 파일 다운로드를 개시합니다! (체크아웃 추적 코드 작동)`);
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
                  onClick={() => alert("에이전시 측으로 조율 접수가 접수되었습니다. 24시간 내에 연락드립니다!")}
                  className={`px-8 py-3.5 rounded-2xl shadow-lg transition-all active:scale-95 text-xs md:text-sm font-bold cursor-pointer ${style.button}`}
                >
                  추천 강사 매칭 조율 상담 요청하기
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
