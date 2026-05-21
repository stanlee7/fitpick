"use strict";

import React, { useState, useEffect } from "react";
import { Instructor } from "../data/mockInstructors";

interface NotionImportProps {
  onClose: () => void;
  onImportSuccess: (newInstructor: Instructor) => void;
}

type SyncStep = "idle" | "fetching" | "parsing" | "mapping" | "success";

export default function NotionImport({
  onClose,
  onImportSuccess,
}: NotionImportProps) {
  const [notionUrl, setNotionUrl] = useState("");
  const [syncStep, setSyncStep] = useState<SyncStep>("idle");
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (syncStep === "fetching") {
      setStatusText("🔗 노션 프로필 링크 연결 중...");
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 30) {
            clearInterval(interval);
            setSyncStep("parsing");
            return 30;
          }
          return prev + 5;
        });
      }, 150);
    } else if (syncStep === "parsing") {
      setStatusText("📝 노션 데이터 및 경력 기술서 블록 추출 중...");
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 70) {
            clearInterval(interval);
            setSyncStep("mapping");
            return 70;
          }
          return prev + 8;
        });
      }, 200);
    } else if (syncStep === "mapping") {
      setStatusText("⚡ 강사 정보 카드 및 단가/포트폴리오 매핑 중...");
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setSyncStep("success");
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    }

    return () => clearInterval(interval);
  }, [syncStep]);

  const handleStartSync = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notionUrl || !notionUrl.includes("notion.so")) {
      alert("올바른 노션 프로필 주소(notion.so)를 입력해 주세요.");
      return;
    }
    setSyncStep("fetching");
    setProgress(0);
  };

  const handleComplete = () => {
    // Generate new mock instructor based on sync simulation
    const randomId = `inst-notion-${Math.floor(Math.random() * 1000)}`;
    const newInst: Instructor = {
      id: randomId,
      name: "한재준",
      role: "IT 대기업 출신 애자일 코치 & 스타트업 조직문화 컨설턴트",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80",
      hourlyRate: 170000,
      rating: 4.9,
      reviewCount: 12,
      availability: "즉시 가용",
      tags: ["애자일코칭", "조직문화", "스타트업", "구글경험"],
      bio: "전 구글 아태평양 조직문화 리드로 근무하며 다양한 테크 기업의 애자일 정착을 이끌었습니다. 리더십 진단 및 성과 중심의 애자일 실습 워크숍을 설계합니다.",
      notionUrl: notionUrl || "https://notion.so/jaejun-agile-hub",
      email: "jaejun.agile@fitpick.co.kr",
      phone: "010-4444-8888",
      portfolioItems: [
        { title: "2026 스타트업을 위한 애자일 조직 설계.pdf", type: "pdf" },
        { title: "조직문화 개선 대면 워크숍 프로그램 구성안.slide", type: "slide" }
      ]
    };

    onImportSuccess(newInst);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[4px] transition-all duration-300">
      <div className="w-full max-w-md bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.12)] relative">
        {/* Top Accent line (Toss Blue) */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-blue"></div>

        <div className="p-8 pt-10">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-800">
                <svg className="w-5 h-5 text-brand-blue" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4.17 2.23C3 2.23 2 3.23 2 4.4v15.2C2 20.77 3 21.77 4.17 21.77h15.66C21 21.77 22 20.77 22 19.6V4.4c0-1.17-1-2.17-2.17-2.17H4.17zm11.75 3.32h2.23v12.9h-2.23V5.55zm-1.85 0v12.9H11.5L8.43 9.47v8.98H6.2V5.55h2.57l3.07 6.08V5.55h2.23z"/>
                </svg>
              </div>
              <h2 className="text-lg font-outfit font-extrabold text-slate-900">노션 프로필 동기화</h2>
            </div>
            
            {syncStep !== "fetching" && syncStep !== "parsing" && syncStep !== "mapping" && (
              <button 
                onClick={onClose}
                className="p-1.5 rounded-full bg-slate-55/60 hover:bg-slate-100 border border-slate-150 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Sync Input Form */}
          {syncStep === "idle" && (
            <form onSubmit={handleStartSync} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  강사가 전달한 노션 링크
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://notion.so/username/page-id..."
                  value={notionUrl}
                  onChange={(e) => setNotionUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3.5 text-sm text-slate-800 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all font-mono placeholder:text-slate-400 placeholder:font-sans"
                />
              </div>

              <div className="bg-blue-50/40 border border-blue-100/50 rounded-2xl p-4 text-xs text-slate-650 space-y-2.5 leading-relaxed">
                <p className="font-bold text-brand-blue">💡 핏픽만의 스마트 동기화 혜택</p>
                <ul className="list-disc list-inside space-y-1 pl-0.5 font-normal">
                  <li>강사의 프로필 핵심 역량 및 자기소개 자동 추출</li>
                  <li>강의 단가 정보와 평점 자동 스크래핑</li>
                  <li>노션 내부에 첨부된 강의 제안서 및 PDF 다운로드 연동</li>
                  <li>원본 노션 주소를 유지하여 언제든 최신 동기화 가능</li>
                </ul>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-brand-blue text-white font-outfit font-bold rounded-2xl shadow-[0_4px_15px_rgba(49,130,246,0.18)] hover:bg-brand-blue-hover active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-1.5"
              >
                <span>원클릭 동기화 및 강사 추가</span>
                <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
            </form>
          )}

          {/* Sync Processing Screen */}
          {(syncStep === "fetching" || syncStep === "parsing" || syncStep === "mapping") && (
            <div className="py-8 flex flex-col items-center justify-center">
              {/* Pulsing Outer Ring */}
              <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-brand-blue/5 animate-ping"></div>
                <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-brand-blue animate-spin"></div>
                <svg className="absolute w-6 h-6 text-brand-blue" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mb-1">강사 정보 AI 파싱 및 추출</h3>
              <p className="text-[11px] text-slate-500 font-mono animate-pulse text-center px-4 max-w-xs">{statusText}</p>

              {/* Progress Bar Container */}
              <div className="w-full bg-slate-100 rounded-full h-2 mt-6 relative overflow-hidden border border-slate-200/20">
                <div 
                  className="bg-brand-blue h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-xs text-slate-550 font-mono mt-2 font-semibold">{progress}%</span>
            </div>
          )}

          {/* Sync Success Screen */}
          {syncStep === "success" && (
            <div className="py-2 text-center space-y-5">
              {/* Confetti Check Circle */}
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto shadow-[0_4px_15px_rgba(45,202,115,0.06)]">
                <svg className="w-8 h-8 text-success-green" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900">노션 동기화 성공!</h3>
                <p className="text-xs text-slate-500 leading-relaxed px-4">
                  노션 링크 분석이 완벽하게 완료되었습니다.<br />
                  새로운 특급 강사 정보가 풀에 자동 추가되었습니다.
                </p>
              </div>

              {/* Parsed Output Preview */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left space-y-2.5 max-w-sm mx-auto">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80" 
                      alt="Han Jae Jun"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">한재준 강사 (즉시 가용)</h4>
                    <p className="text-[10px] text-slate-500 font-medium">애자일 코치 & 스타트업 컨설턴트</p>
                  </div>
                </div>
                <div className="border-t border-slate-200/60 pt-2 flex flex-wrap gap-1.5">
                  <span className="text-[9px] bg-white text-slate-650 px-2.5 py-0.5 rounded-lg border border-slate-200 font-semibold">강사료: ₩170,000</span>
                  <span className="text-[9px] bg-white text-slate-650 px-2.5 py-0.5 rounded-lg border border-slate-200 font-semibold">자료: PDF 1건, 슬라이드 1건</span>
                </div>
              </div>

              <button
                onClick={handleComplete}
                className="w-full py-4 bg-brand-blue text-white font-outfit font-bold rounded-2xl shadow-[0_4px_15px_rgba(49,130,246,0.18)] hover:bg-brand-blue-hover active:scale-[0.98] transition-all text-sm"
              >
                대시보드 강사 리스트에서 확인하기
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

