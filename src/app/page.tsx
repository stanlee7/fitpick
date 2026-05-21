"use client";

import React, { useState } from "react";
import { mockInstructors, Instructor } from "../data/mockInstructors";
import InstructorCard from "../components/InstructorCard";
import NotionImport from "../components/NotionImport";
import CurationPanel from "../components/CurationPanel";

export default function Home() {
  const [instructors, setInstructors] = useState<Instructor[]>(mockInstructors);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("전체");
  const [showNotionModal, setShowNotionModal] = useState(false);

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

  // Import Notion Success Handler
  const handleImportSuccess = (newInstructor: Instructor) => {
    setInstructors((prev) => [newInstructor, ...prev]);
    setShowNotionModal(false);
  };

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
            📢 <strong>에이전시 잡일 끝!</strong> 강사 정보 동기화와 클라이언트 큐레이션 한 사이클을 단 <strong>30분</strong> 안에 해결하세요.
          </p>
        </div>

        <div>
          <button
            onClick={() => setShowNotionModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue border border-brand-blue/10 hover:bg-brand-blue-hover text-white font-semibold text-xs shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4.17 2.23C3 2.23 2 3.23 2 4.4v15.2C2 20.77 3 21.77 4.17 21.77h15.66C21 21.77 22 20.77 22 19.6V4.4c0-1.17-1-2.17-2.17-2.17H4.17zm11.75 3.32h2.23v12.9h-2.23V5.55zm-1.85 0v12.9H11.5L8.43 9.47v8.98H6.2V5.55h2.57l3.07 6.08V5.55h2.23z"/>
            </svg>
            노션 프로필 원클릭 연동
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

      {/* Notion Import Modal System */}
      {showNotionModal && (
        <NotionImport
          onClose={() => setShowNotionModal(false)}
          onImportSuccess={handleImportSuccess}
        />
      )}
    </div>
  );
}

