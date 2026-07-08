"use client";

import React, { useState, useEffect } from "react";
import { mockInstructors, Instructor } from "../data/mockInstructors";
import InstructorCard from "../components/InstructorCard";
import NotionApiImport from "../components/NotionApiImport";
import ResumeImport from "../components/ResumeImport";
import CsvImport from "../components/CsvImport";
import RegistrationImport from "../components/RegistrationImport";
import CurationPanel from "../components/CurationPanel";
import IntroView from "../components/IntroView";
import PipelineBoard from "../components/PipelineBoard";
import { track, FEEDBACK_URL } from "../lib/analytics";

export default function Home() {
  const [viewMode, setViewMode] = useState<"intro" | "dashboard">("intro");
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("전체");
  const [showNotionModal, setShowNotionModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  // Hydrate data from localStorage (Local-First Security spec)
  useEffect(() => {
    const localData = localStorage.getItem("fitpick_instructors");
    if (localData) {
      try {
        setInstructors(JSON.parse(localData));
      } catch (e) {
        setInstructors(mockInstructors);
        localStorage.setItem("fitpick_instructors", JSON.stringify(mockInstructors));
      }
    } else {
      setInstructors(mockInstructors);
      localStorage.setItem("fitpick_instructors", JSON.stringify(mockInstructors));
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage on any state changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("fitpick_instructors", JSON.stringify(instructors));
    }
  }, [instructors, isHydrated]);

  // Toggle selection for curation
  const handleSelectInstructor = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        // Allow up to 3 instructors for premium tight curation
        if (prev.length >= 3) {
          alert("효과적인 큐레이션을 위해 최대 3명의 강사만 매칭하는 것을 추천합니다!");
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  // Clear selections
  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Update Instructor
  const handleUpdateInstructor = (updatedInst: Instructor) => {
    setInstructors((prev) =>
      prev.map((inst) => (inst.id === updatedInst.id ? updatedInst : inst))
    );
  };

  // Delete Instructor
  const handleDeleteInstructor = (id: string) => {
    setInstructors((prev) => prev.filter((inst) => inst.id !== id));
    setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
  };

  // PC 로컬 JSON 백업 파일 다운로드 (Export JSON)
  const handleExportJSON = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(instructors, null, 2));
      const downloadAnchor = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `fitpick_instructors_backup_${date}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      alert("백업 파일 생성 중 오류가 발생했습니다.");
    }
  };

  // 엑셀 호환 CSV 파일 다운로드 (한글 BOM 헤더 장착)
  const handleExportCSV = () => {
    try {
      const headers = ["이름", "역할", "만족도평점", "누적매칭", "가용일정", "연락처(이메일)", "연락처(전화번호)", "핵심태그", "자기소개"];
      const rows = instructors.map((inst) => [
        inst.name,
        inst.role,
        inst.rating.toFixed(1),
        inst.reviewCount,
        inst.availability,
        inst.email || "",
        inst.phone || "",
        inst.tags.join(" | "),
        inst.bio.replace(/\n/g, " "),
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")),
      ].join("\n");

      // UTF-8 BOM (\uFEFF)을 씌워 Excel에서 한글 깨짐 원천 차단
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);
      link.setAttribute("href", url);
      link.setAttribute("download", `fitpick_instructors_excel_${date}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      alert("CSV 변환 작업 중 오류가 발생했습니다.");
    }
  };

  // PC 백업 JSON 파일 로드 (Import JSON)
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            // 유효성 최소 검증 (id와 name이 완비된 강사 데이터 구조인지 확인)
            const isValid = parsed.every(
              (item) => item && typeof item === "object" && "id" in item && "name" in item
            );
            if (isValid) {
              setInstructors(parsed);
              alert(`💾 백업 파일 복구 성공!\n총 ${parsed.length}명의 강사 정보가 파트너님의 PC 브라우저 로컬 DB에 안전하게 동기화되었습니다!`);
            } else {
              alert("❌ 복구 실패: 백업 파일 내 일부 강사 필수 식별 정보(ID, 이름)가 유실되어 있습니다.");
            }
          } else {
            alert("❌ 복구 실패: 백업 파일의 최상위 데이터가 올바른 리스트(배열) 형식이 아닙니다.");
          }
        } catch (err) {
          alert("❌ 복구 실패: 올바른 JSON 포맷의 백업 파일이 아닙니다.");
        }
      };
    }
  };

  // 데모 초기화 리셋 스펙
  const handleResetMockData = () => {
    if (
      window.confirm(
        "⚠️ 로컬 DB 초기화 경고\n현재 저장된 모든 강사 데이터가 즉시 삭제되며, 핏픽 최초의 4명 데모 데이터셋으로 복원됩니다. 계속하시겠습니까?"
      )
    ) {
      setInstructors(mockInstructors);
      localStorage.setItem("fitpick_instructors", JSON.stringify(mockInstructors));
      setSelectedIds([]);
      alert("🔄 로컬 강사 풀이 기본 데모 데이터셋으로 성공적으로 초기화되었습니다.");
    }
  };

  // Intro Screen Render (Sales pitch)
  if (viewMode === "intro") {
    return (
      <IntroView
        onStart={() => setViewMode("dashboard")}
        onImport={(importedData) => {
          setInstructors(importedData);
          setViewMode("dashboard");
        }}
      />
    );
  }

  // Filtered Instructors
  const filteredInstructors = instructors.filter((inst) => {
    const matchesSearch =
      inst.name.includes(searchQuery) ||
      inst.role.includes(searchQuery) ||
      inst.tags.some((t) => t.includes(searchQuery));

    const matchesStatus =
      statusFilter === "전체" || inst.availability === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const selectedInstructors = instructors.filter((inst) =>
    selectedIds.includes(inst.id)
  );

  return (
    <div className="flex flex-col min-h-screen text-slate-900 pb-16">
      {/* Dynamic Background Light Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-blue/5 blur-[120px] pointer-events-none"></div>

      {/* Global Header */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between border-b border-slate-200/60 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-blue flex items-center justify-center shadow-sm">
            <span className="font-outfit font-black text-white text-base">FP</span>
          </div>
          <div>
            <h1 className="font-outfit font-black text-xl tracking-tight text-slate-900 flex items-center gap-1.5">
              핏픽 <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600">v0.1</span>
            </h1>
            <p className="text-[10px] text-text-muted font-normal">Smart Instructor Curation System</p>
          </div>
        </div>

        {/* Tagline for 1Page defining core problem */}
        <div className="hidden md:block text-center max-w-md">
          <p className="text-xs text-text-slate bg-brand-blue-light border border-brand-blue/10 rounded-2xl px-4 py-2 leading-relaxed">
            📢 강사를 고르면 <strong>경력·고객사·후기까지 담긴 신뢰 제안서</strong>가 완성됩니다. 기업 담당자가 윗선 보고에 바로 쓰도록.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowResumeModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue border border-brand-blue/10 hover:bg-brand-blue-hover text-white font-semibold text-xs shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            이력서 추가
          </button>
          <button
            onClick={() => setShowCsvModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
            </svg>
            CSV 일괄
          </button>
          <button
            onClick={() => setShowNotionModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 text-slate-800" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4.17 2.23C3 2.23 2 3.23 2 4.4v15.2C2 20.77 3 21.77 4.17 21.77h15.66C21 21.77 22 20.77 22 19.6V4.4c0-1.17-1-2.17-2.17-2.17H4.17zm11.75 3.32h2.23v12.9h-2.23V5.55zm-1.85 0v12.9H11.5L8.43 9.47v8.98H6.2V5.55h2.57l3.07 6.08V5.55h2.23z"/>
            </svg>
            노션 연동
          </button>
          <button
            onClick={() => setShowRegistrationModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.981l7.5-4.039a2.25 2.25 0 012.134 0l7.5 4.039a2.25 2.25 0 011.183 1.98V19.5z" />
            </svg>
            등록 신청함
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Side: Instructor Pool Management (65% width on desktop) */}
        <section className="lg:col-span-8 space-y-6">
          
          {/* Dashboard Title & Stats Overview */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-outfit font-extrabold text-slate-900">나의 강사 풀 데이터베이스</h2>
              <p className="text-xs text-text-slate mt-1">등록된 강사 풀을 필터링하고 의뢰서에 맞춘 인재를 고르세요.</p>
            </div>
            
            {/* Short stat badge */}
            <div className="flex items-center gap-3">
              <div className="glass-panel px-4 py-2 rounded-2xl text-center">
                <span className="text-[10px] text-text-muted uppercase tracking-wider block font-semibold">총 강사 수</span>
                <span className="text-base font-bold text-slate-800 font-mono">{instructors.length}명</span>
              </div>
              <div className="glass-panel px-4 py-2 rounded-2xl text-center">
                <span className="text-[10px] text-text-muted uppercase tracking-wider block font-semibold">큐레이션 대기</span>
                <span className="text-base font-bold text-brand-blue font-mono">{selectedIds.length}명</span>
              </div>
            </div>
          </div>
          {/* PC 로컬 백업 및 보안 관리 센터 */}
          <div className="glass-panel p-5 rounded-[28px] border-slate-200/50 bg-gradient-to-br from-indigo-50/20 via-white/50 to-blue-50/20 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base">💾</span>
                <div>
                  <h3 className="text-xs font-bold text-slate-800">데이터 백업 / 내보내기</h3>
                  <p className="text-[10px] text-text-slate leading-normal">
                    강사 풀을 백업 파일(.json)이나 엑셀(.csv)로 내보내 안전하게 보관하세요.
                  </p>
                </div>
              </div>
              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200/60 text-slate-500 uppercase font-mono">
                💾 Backup
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {/* 백업 파일 내보내기 */}
              <button
                type="button"
                onClick={handleExportJSON}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-700 active:scale-95 transition-all cursor-pointer shadow-sm font-sans"
              >
                📥 백업 다운로드 (.json)
              </button>

              {/* 백업 파일 불러오기 */}
              <label className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-700 active:scale-95 transition-all cursor-pointer shadow-sm relative font-sans">
                📤 백업 파일 로드 (.json)
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>

              {/* 엑셀 CSV 추출 */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-brand-blue-light border border-brand-blue/20 hover:bg-brand-blue-light/80 text-[11px] font-bold text-brand-blue active:scale-95 transition-all cursor-pointer shadow-sm font-sans"
              >
                📊 엑셀 내보내기 (.csv)
              </button>

              {/* 데모 데이터 리셋 */}
              <button
                type="button"
                onClick={handleResetMockData}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-50 border border-rose-100 hover:bg-rose-100/60 text-[11px] font-bold text-rose-600 active:scale-95 transition-all cursor-pointer shadow-sm font-sans"
              >
                🔄 데모 기본값 리셋
              </button>
            </div>
          </div>

          {/* 배정 파이프라인: 의뢰접수→정산까지 로컬 추적 */}
          <PipelineBoard />

          {/* Search, Filter Bar Container */}
          <div className="glass-panel p-4 rounded-[24px] border-slate-200/40 space-y-3">
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="강사 이름, 전문 분야, 핵심 키워드로 즉시 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-800 focus:outline-none placeholder:text-slate-400"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-text-slate hover:text-brand-blue underline font-semibold"
                >
                  지우기
                </button>
              )}
            </div>

            {/* Filter Tabs & Quick Action */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap gap-1">
                {["전체", "즉시 가용", "일정 협의", "마감"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      statusFilter === filter
                        ? "bg-brand-blue-light border-brand-blue/20 text-brand-blue font-bold"
                        : "bg-white border-slate-200 text-text-slate hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              
              <span className="text-[10px] text-text-muted font-mono font-semibold">
                검색 결과: <strong>{filteredInstructors.length}</strong>건
              </span>
            </div>
          </div>

          {/* Instructor Cards Grid */}
          {filteredInstructors.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border border-slate-200 rounded-[28px] bg-white shadow-sm">
              <svg className="w-12 h-12 text-slate-300 mb-3 animate-pulse" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-sm font-semibold text-slate-800">일치하는 강사가 없습니다</h3>
              <p className="text-xs text-text-slate mt-1 max-w-xs leading-relaxed">
                검색어나 필터링 옵션을 조정하거나, 상단의 <strong>[노션 프로필 원클릭 연동]</strong> 버튼을 통해 신규 강사를 등록해 보세요!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredInstructors.map((inst) => (
                <InstructorCard
                  key={inst.id}
                  instructor={inst}
                  isSelected={selectedIds.includes(inst.id)}
                  onSelect={handleSelectInstructor}
                  onUpdate={handleUpdateInstructor}
                  onDelete={handleDeleteInstructor}
                />
              ))}
            </div>
          )}

        </section>

        {/* Right Side: Smart Curation Builder (35% width on desktop) */}
        <section className="lg:col-span-4 lg:sticky lg:top-8 h-fit">
          <div className="glass-panel p-6 rounded-[32px] shadow-sm relative overflow-hidden">
            {/* Background design line in panel */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue-light rounded-full blur-xl pointer-events-none"></div>

            <CurationPanel
              selectedInstructors={selectedInstructors}
              onClearSelection={handleClearSelection}
            />
          </div>
        </section>

      </main>

      {/* Feedback link (NEXT_PUBLIC_FEEDBACK_URL 설정 시에만 노출) */}
      {FEEDBACK_URL && (
        <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-200/60 flex items-center justify-center relative z-10">
          <a
            href={FEEDBACK_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("feedback_click", { location: "dashboard_footer" })}
            className="flex items-center gap-1.5 text-xs font-semibold text-brand-blue hover:underline"
          >
            💬 핏픽을 써보고 한 줄 피드백 남기기 →
          </a>
        </footer>
      )}

      {/* Notion API Import (desktop) / guide (web) */}
      {showNotionModal && (
        <NotionApiImport
          onClose={() => setShowNotionModal(false)}
          onImportSuccess={(insts) => {
            setInstructors((prev) => [...insts, ...prev]);
            track("instructor_added", { method: "notion_api", count: insts.length });
          }}
        />
      )}

      {/* Resume/Profile Import Modal */}
      {showResumeModal && (
        <ResumeImport
          onClose={() => setShowResumeModal(false)}
          onImportSuccess={(inst) => {
            setInstructors((prev) => [inst, ...prev]);
            track("instructor_added", { method: "resume" });
          }}
        />
      )}

      {/* Registration inbox (구 AgentL 강사풀 신청 가져오기) */}
      {showRegistrationModal && (
        <RegistrationImport
          existingInstructors={instructors}
          onClose={() => setShowRegistrationModal(false)}
          onImportSuccess={(insts) => {
            setInstructors((prev) => [...insts, ...prev]);
            track("instructor_added", { method: "registration", count: insts.length });
          }}
        />
      )}

      {/* CSV Bulk Import Modal */}
      {showCsvModal && (
        <CsvImport
          onClose={() => setShowCsvModal(false)}
          onImportSuccess={(insts) => {
            setInstructors((prev) => [...insts, ...prev]);
            track("instructor_added", { method: "csv", count: insts.length });
          }}
        />
      )}
    </div>
  );
}

