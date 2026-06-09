"use strict";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Instructor, PortfolioItem } from "../data/mockInstructors";
import { avatarFor } from "../lib/avatar";

interface NotionImportProps {
  onClose: () => void;
  onImportSuccess: (newInstructor: Instructor) => void;
}

type SyncStep = "idle" | "fetching" | "parsing" | "mapping" | "success";

export default function NotionImport({
  onClose,
  onImportSuccess,
}: NotionImportProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const [notionUrl, setNotionUrl] = useState("");
  const [syncStep, setSyncStep] = useState<SyncStep>("idle");
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [importedInstructor, setImportedInstructor] = useState<Instructor | null>(null);

  // New Local States for Notion Import Portfolio Uploader
  const [activeUploadTab, setActiveUploadTab] = useState<"file" | "link">("file");
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const parseNotionUrlToMockData = (url: string): Instructor => {
    const randomId = `inst-notion-${Math.floor(Math.random() * 1000)}`;
    const urlLower = url.toLowerCase();
    
    // Default base dummy (Jaejun agile coach)
    let name = "한재준";
    let role = "IT 대기업 출신 애자일 코치 & 스타트업 조직문화 컨설턴트";
    let avatar = "";
    let hourlyRate = 170000;
    let rating = 4.9;
    let reviewCount = 12;
    let availability: Instructor["availability"] = "즉시 가용";
    let tags = ["애자일코칭", "조직문화", "스타트업", "구글경험"];
    let bio = "전 구글 아태평양 조직문화 리드로 근무하며 다양한 테크 기업의 애자일 정착을 이끌었습니다. 리더십 진단 및 성과 중심의 애자일 실습 워크숍을 설계합니다.";
    let email = "jaejun.agile@fitpick.co.kr";
    let phone = "010-4444-8888";
    let portfolioItems: PortfolioItem[] = [
      { title: "2026 스타트업을 위한 애자일 조직 설계.pdf", type: "pdf" },
      { title: "조직문화 개선 대면 워크숍 프로그램 구성안.slide", type: "slide" }
    ];

    if (urlLower.includes("minwoo") || urlLower.includes("design")) {
      name = "김민우";
      role = "UX/UI 서비스 디자인 & 피그마 실무 마스터";
      hourlyRate = 150000;
      rating = 4.9;
      reviewCount = 24;
      availability = "즉시 가용";
      tags = ["UX/UI", "피그마", "서비스기획", "디자이너출신"];
      bio = "대기업 및 스타트업에서 8년간 서비스 디자인을 리드해 왔습니다. 단순 툴 사용법이 아닌 비즈니스 가치를 높이는 실무 디자인 설계 및 워크숍 강의를 제공합니다.";
      email = "minwoo.design@fitpick.co.kr";
      phone = "010-1234-5678";
      portfolioItems = [
        { title: "2026 UX/UI 실무 디자인 강의 커리큘럼.pdf", type: "pdf" },
        { title: "피그마 활용 프로토타이핑 가이드북.slide", type: "slide" },
        { title: "삼성전자 신입 디자이너 대상 강의 포트폴리오", type: "link" }
      ];
    } else if (urlLower.includes("jihye") || urlLower.includes("dev") || urlLower.includes("code")) {
      name = "이지혜";
      role = "Next.js & React 모던 프론트엔드 실무 개발";
      hourlyRate = 180000;
      rating = 4.8;
      reviewCount = 18;
      availability = "일정 협의";
      tags = ["React", "Next.js", "TypeScript", "웹개발"];
      bio = "현업 프론트엔드 테크 리드로 재직 중이며, 복잡한 웹 애플리케이션 아키텍처와 성능 최적화 강의에 특화되어 있습니다. 비개발자도 이해하기 쉬운 코딩 워크숍을 설계합니다.";
      email = "jihye.dev@fitpick.co.kr";
      phone = "010-8765-4321";
      portfolioItems = [
        { title: "초급자를 위한 React 실무 입문.pdf", type: "pdf" },
        { title: "Next.js 15 App Router 실무 마스터 클래스.slide", type: "slide" }
      ];
    } else if (urlLower.includes("taeyoung") || urlLower.includes("biz")) {
      name = "박태영";
      role = "스타트업 스케일업 & B2B 비즈니스 세일즈";
      hourlyRate = 200000;
      rating = 5.0;
      reviewCount = 32;
      availability = "즉시 가용";
      tags = ["스타트업", "B2B세일즈", "비즈니스전략", "스케일업"];
      bio = "스타트업 공동창업 및 스케일업 경험을 보유한 B2B 세일즈 전문가입니다. 실제 계약 전환을 이끄는 영업 파이프라인 설계 및 피칭 노하우를 명쾌하게 전달합니다.";
      email = "taeyoung.biz@fitpick.co.kr";
      phone = "010-5555-9999";
      portfolioItems = [
        { title: "B2B 제안서 작성 공식 및 템플릿 패키지.slide", type: "slide" },
        { title: "B2B 세일즈 강연 소개 영상.video", type: "video" }
      ];
    } else if (urlLower.includes("yoona") || urlLower.includes("marketing")) {
      name = "최윤아";
      role = "데이터 기반 그로스 마케팅 & 퍼포먼스 전략";
      hourlyRate = 160000;
      rating = 4.7;
      reviewCount = 15;
      availability = "마감";
      tags = ["그로스마케팅", "GA4", "퍼포먼스광고", "데이터분석"];
      bio = "무작정 쓰는 마케팅 예산은 가라! GA4 데이터 분석에 근거한 정량적 마케팅 최적화 이론과 구글 애드 실무 세팅 실습 과정을 운영합니다.";
      email = "yoona.growth@fitpick.co.kr";
      phone = "010-2222-3333";
      portfolioItems = [
        { title: "GA4 데이터 수집 및 분석 가이드라인.pdf", type: "pdf" },
        { title: "성공하는 그로스 마케팅 워크북.slide", type: "slide" }
      ];
    } else if (urlLower.includes("2298f29004ba80b09b5ed52845b7b1f8")) {
      name = "스탠리탬";
      role = "B2B 스마트 에이전시 사업 총괄 및 교육 매칭 전략 디렉터";
      hourlyRate = 250000;
      rating = 5.0;
      reviewCount = 50;
      availability = "즉시 가용";
      tags = ["에이전시총괄", "B2B교육", "매칭전략", "디렉터"];
      bio = "핏픽 플랫폼의 총괄 디렉터로서 10년 이상의 B2B 기업 맞춤형 교육 설계 및 강사 매칭 전략을 총괄해 왔습니다. 기업 성장을 위한 최적의 교육 설계 로드맵을 제안합니다.";
      email = "stanley.tam@fitpick.co.kr";
      phone = "010-2026-0526";
      portfolioItems = [
        { title: "2026 B2B 스마트 에이전시 매칭 마스터 계획서.pdf", type: "pdf" },
        { title: "핏픽 플랫폼 사업 소개서 및 강사 큐레이션 제안.slide", type: "slide" }
      ];
    } else {
      // 쿼리 파라미터(?source=...) 제거 후 정합성 있는 세그먼트 파싱
      const cleanUrl = url.split("?")[0];
      const urlParts = cleanUrl.split("/");
      const lastSegment = urlParts[urlParts.length - 1] || "user";
      
      let parsedName = lastSegment.replace(/[^a-zA-Z가-힣]/g, "");
      if (parsedName.length > 0 && parsedName.toLowerCase() !== "user") {
        parsedName = parsedName.charAt(0).toUpperCase() + parsedName.slice(1);
      } else {
        parsedName = "신규 연동 강사";
      }

      name = parsedName.length > 5 ? parsedName.slice(0, 5) : parsedName;
      role = "노션 연동 전문 분야 (수정 요망)";
      hourlyRate = 100000;
      rating = 4.5;
      reviewCount = 5;
      availability = "일정 협의";
      tags = ["노션연동", "신규강사", "피팅대기"];
      bio = "노션 프로필 링크로부터 성공적으로 정보를 추출했습니다. 에이전시 소속 강사에 맞게 한 줄 소개를 다듬고 추가해 보세요.";
      email = `${name.toLowerCase()}@fitpick.co.kr`;
      phone = "010-0000-0000";
      portfolioItems = [
        { title: `${name} 강사 2026 강의 상세 소개서.pdf`, type: "pdf" }
      ];
    }

    // 오프라인·데스크톱에서도 깨지지 않도록 모든 아바타를 로컬 이니셜 아바타로 통일
    avatar = avatarFor(name);

    return {
      id: randomId,
      name,
      role,
      avatar,
      hourlyRate,
      rating,
      reviewCount,
      availability,
      tags,
      bio,
      notionUrl: url,
      email,
      phone,
      portfolioItems
    };
  };

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
    const url = notionUrl.trim();
    // 노션 공유 링크는 notion.so(앱), notion.site(공개페이지), 커스텀 도메인 등 다양함.
    // 노션 계열 도메인을 폭넓게 허용하고, 형식만 최소 검증.
    const lower = url.toLowerCase();
    const isNotionLink =
      lower.includes("notion.so") ||
      lower.includes("notion.site") ||
      lower.includes("notion.com");
    if (!url || !isNotionLink) {
      alert("노션 링크를 붙여넣어 주세요.\n(예: https://○○.notion.site/... 또는 https://www.notion.so/...)");
      return;
    }

    // Parse target url dynamically
    const parsedData = parseNotionUrlToMockData(url);
    setImportedInstructor(parsedData);

    setSyncStep("fetching");
    setProgress(0);
  };

  const handleComplete = () => {
    if (importedInstructor) {
      onImportSuccess(importedInstructor);
    }
  };

  // Helper for virtual file upload mapping in Notion import
  const handleFileUpload = (file: File) => {
    const fileName = file.name;
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    
    // File size constraint validation (1.5MB)
    const maxSize = 1.5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("⚠️ 용량 초과: 프로필 이미지 및 파일 용량이 1.5MB를 초과하면 로컬 DB 한계로 인해 안전하게 저장되지 않을 수 있습니다.");
      return;
    }

    let fileType: PortfolioItem["type"] = "link";
    if (ext === "pdf") {
      fileType = "pdf";
    } else if (["ppt", "pptx", "key", "slide"].includes(ext)) {
      fileType = "slide";
    } else if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) {
      fileType = "video";
    } else {
      fileType = "link";
    }

    const newItem: PortfolioItem = {
      title: fileName,
      type: fileType,
    };

    setImportedInstructor((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        portfolioItems: [...prev.portfolioItems, newItem]
      };
    });
    alert(`📁 '${fileName}' 파일이 성공적으로 노션 소개 자료 리스트에 연동되었습니다!`);
  };

  const handleAddLink = () => {
    if (!newLinkTitle.trim()) {
      alert("자료의 제목을 입력해 주세요.");
      return;
    }
    
    const newItem: PortfolioItem = {
      title: newLinkTitle.trim(),
      type: "link",
    };

    setImportedInstructor((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        portfolioItems: [...prev.portfolioItems, newItem]
      };
    });
    setNewLinkTitle("");
    setNewLinkUrl("");
    alert(`🔗 외부 제안 링크가 목록에 성공적으로 동기화되었습니다!`);
  };

  const handleDeletePortfolio = (idx: number) => {
    setImportedInstructor((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        portfolioItems: prev.portfolioItems.filter((_, i) => i !== idx)
      };
    });
  };

  if (!mounted) return null;

  return createPortal(
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
                  type="text"
                  inputMode="url"
                  required
                  placeholder="https://○○.notion.site/... 또는 notion.so/..."
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
          {syncStep === "success" && importedInstructor && (
            <div className="py-2 text-center space-y-4">
              {/* Confetti Check Circle */}
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto shadow-[0_4px_15px_rgba(45,202,115,0.06)]">
                <svg className="w-6 h-6 text-success-green" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900">노션 프로필 분석 완료!</h3>
                <p className="text-xs text-slate-500 leading-normal px-4">
                  추출된 데이터를 확인하고 에이전시 조건에 맞게 보정해 주세요.
                </p>
              </div>

              {/* Parsed Output Preview & Interactive Edit Form */}
              <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 text-left space-y-3 max-w-sm mx-auto text-xs">
                
                {/* Avatar Display */}
                <div className="flex items-center gap-3 pb-2.5 border-b border-slate-250/50">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={importedInstructor.avatar} 
                      alt={importedInstructor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">분석 완료된 프로필 사진</span>
                    <p className="text-[10px] text-slate-500 font-semibold truncate max-w-[200px]">
                      {importedInstructor.name} 강사 셋업 완료
                    </p>
                  </div>
                </div>

                {/* Interactive Fields */}
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">강사 이름</label>
                      <input
                        type="text"
                        value={importedInstructor.name}
                        onChange={(e) => {
                          setImportedInstructor(prev => prev ? { ...prev, name: e.target.value } : null);
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-blue"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">가용 일정</label>
                      <select
                        value={importedInstructor.availability}
                        onChange={(e) => {
                          setImportedInstructor(prev => prev ? { ...prev, availability: e.target.value as Instructor["availability"] } : null);
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-blue"
                      >
                        <option value="즉시 가용">즉시 가용</option>
                        <option value="일정 협의">일정 협의</option>
                        <option value="마감">마감</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">전문 분야 / 타이틀</label>
                    <input
                      type="text"
                      value={importedInstructor.role}
                      onChange={(e) => {
                        setImportedInstructor(prev => prev ? { ...prev, role: e.target.value } : null);
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-850 focus:outline-none focus:border-brand-blue"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">시간당 강사료</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-2.5 text-slate-400 font-bold">₩</span>
                      <input
                        type="number"
                        value={importedInstructor.hourlyRate}
                        onChange={(e) => {
                          setImportedInstructor(prev => prev ? { ...prev, hourlyRate: Number(e.target.value) || 0 } : null);
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg pl-6 pr-2 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-brand-blue font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">한 줄 프로필 소개</label>
                    <textarea
                      value={importedInstructor.bio}
                      onChange={(e) => {
                        setImportedInstructor(prev => prev ? { ...prev, bio: e.target.value } : null);
                      }}
                      rows={2}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] text-slate-700 leading-normal focus:outline-none focus:border-brand-blue resize-none"
                    />
                  </div>
                </div>

                {/* 📂 New: Notion Import Portfolio Interactive Editor & Actual File Sync */}
                <div className="border-t border-slate-200/50 pt-3.5 mt-2 text-xs space-y-3.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium pb-1.5 border-b border-slate-100/50">
                    <span className="font-bold">📂 노션 연동 소개자료 및 포트폴리오 ({importedInstructor.portfolioItems.length}건)</span>
                  </div>

                  {/* 1. Real-time portfolio items list with trashcan delete button */}
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {importedInstructor.portfolioItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-150 text-[11px] text-slate-750"
                      >
                        <div className="flex items-center truncate flex-1 mr-2 font-medium">
                          {item.type === "pdf" && (
                            <svg className="w-3.5 h-3.5 text-rose-500 mr-1.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          )}
                          {item.type === "slide" && (
                            <svg className="w-3.5 h-3.5 text-amber-500 mr-1.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21h8M12 17V21M3 4h18M4 4h16v12H4V4z" />
                            </svg>
                          )}
                          {item.type === "video" && (
                            <svg className="w-3.5 h-3.5 text-sky-500 mr-1.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                          {item.type === "link" && (
                            <svg className="w-3.5 h-3.5 text-emerald-500 mr-1.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                          )}
                          <span className="truncate">{item.title}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePortfolio(idx);
                          }}
                          className="p-1 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg active:scale-95 transition-all cursor-pointer shrink-0"
                          title="자료 삭제"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    {importedInstructor.portfolioItems.length === 0 && (
                      <p className="text-[10px] text-slate-400 italic py-2 text-center bg-white border border-dashed border-slate-200 rounded-xl">동기화 첨부된 소개 자료가 없습니다.</p>
                    )}
                  </div>

                  {/* 2. Drag & Drop File/Link Uploader widget */}
                  <div className="border border-slate-250/60 bg-white rounded-2xl p-3 space-y-2.5 shadow-sm">
                    <div className="flex border-b border-slate-100 pb-1.5 gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveUploadTab("file");
                        }}
                        className={`flex-1 text-center pb-1 text-[10px] font-bold transition-all cursor-pointer ${
                          activeUploadTab === "file" ? "text-brand-blue border-b-2 border-brand-blue" : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        📁 노션자료 직접 동기화
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveUploadTab("link");
                        }}
                        className={`flex-1 text-center pb-1 text-[10px] font-bold transition-all cursor-pointer ${
                          activeUploadTab === "link" ? "text-brand-blue border-b-2 border-brand-blue" : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        🔗 외부 상세 제안 링크
                      </button>
                    </div>

                    {activeUploadTab === "file" ? (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDragOver(true);
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDragOver(false);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDragOver(false);
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            handleFileUpload(e.dataTransfer.files[0]);
                          }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          document.getElementById("notion-modal-file-input")?.click();
                        }}
                        className={`border-2 border-dashed rounded-xl p-3 text-center transition-all cursor-pointer ${
                          isDragOver
                            ? "border-brand-blue bg-blue-50/40"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/30"
                        }`}
                      >
                        <input
                          id="notion-modal-file-input"
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            e.stopPropagation();
                            if (e.target.files && e.target.files[0]) {
                              handleFileUpload(e.target.files[0]);
                            }
                          }}
                        />
                        <svg className="w-5 h-5 text-slate-400 mx-auto mb-1" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                        </svg>
                        <p className="text-[10px] font-bold text-slate-700">이곳에 노션용 PDF/소개서 드래그 혹은 클릭</p>
                        <p className="text-[8px] text-slate-400 mt-0.5">강사 기획자료를 핏픽 데이터베이스에 직접 연동합니다 (1.5MB 제한)</p>
                      </div>
                    ) : (
                      <div className="space-y-2 text-[10px]" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          placeholder="소개 자료 또는 강의 제목"
                          value={newLinkTitle}
                          onChange={(e) => setNewLinkTitle(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-brand-blue"
                        />
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder="🔗 외부 링크 URL (선택)"
                            value={newLinkUrl}
                            onChange={(e) => setNewLinkUrl(e.target.value)}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-brand-blue font-mono text-[9px]"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddLink();
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-brand-blue hover:bg-brand-blue-hover text-white font-bold active:scale-95 transition-all cursor-pointer shrink-0 text-[9px]"
                          >
                            등록
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={handleComplete}
                className="w-full py-3.5 bg-brand-blue text-white font-outfit font-bold rounded-2xl shadow-[0_4px_15px_rgba(49,130,246,0.18)] hover:bg-brand-blue-hover active:scale-[0.98] transition-all text-xs cursor-pointer"
              >
                검토 완료하고 나의 강사 풀에 추가하기
              </button>
            </div>
          )}

        </div>
      </div>
    </div>,
    document.body
  );
}

