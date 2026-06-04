"use client";

import React, { useState, useRef } from "react";
import { mockInstructors } from "../data/mockInstructors";
import { FEEDBACK_URL, track } from "../lib/analytics";

interface IntroViewProps {
  onStart: () => void;
  onImport?: (data: any[]) => void;
}

export default function IntroView({ onStart, onImport }: IntroViewProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 드래그 관련 이벤트 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // 백업 파일 분석 및 복구 로직
  const processFile = (file: File) => {
    if (!file.name.endsWith(".json")) {
      alert("❌ 확장자 오류: 백업 파일은 오직 .json 형식만 지원합니다.");
      return;
    }

    const reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          const isValid = parsed.every(
            (item) => item && typeof item === "object" && "id" in item && "name" in item
          );
          if (isValid) {
            if (onImport) {
              onImport(parsed);
              alert(`💾 로컬 백업 감지 완료!\n총 ${parsed.length}명의 강사 DB가 안전하게 복구되었습니다.`);
            } else {
              onStart();
            }
          } else {
            alert("❌ 형식 불일치: 핏픽 백업 규격과 맞지 않는 파일입니다.");
          }
        } else {
          alert("❌ 형식 불일치: 백업 파일 데이터가 배열 형식이 아닙니다.");
        }
      } catch (err) {
        alert("❌ 복구 실패: JSON 백업 파일이 손상되었습니다.");
      }
    };
  };

  // 빈 데이터베이스로 깨끗하게 즉시 시작
  const handleCleanStart = () => {
    if (onImport) {
      onImport([]); // 공백 데이터셋 주입
    } else {
      onStart();
    }
  };

  // 4인 데모 데이터셋을 안전하게 미리 채워서 기동
  const handleQuickDemoStart = () => {
    if (onImport) {
      onImport(mockInstructors);
    } else {
      onStart();
    }
  };

  return (
    <div className="relative min-h-screen bg-[#f2f5f9] text-slate-800 flex flex-col justify-between overflow-x-hidden font-sans select-none pb-8">
      
      {/* 1. 토스 블루 그라데이션 및 부드러운 구체 백그라운드 배너 데코 */}
      <div className="absolute top-0 left-0 w-full h-[290px] bg-gradient-to-r from-[#0052e6] via-[#0062ff] to-[#3b86ff] overflow-hidden z-0 shadow-sm">
        
        {/* 장식용 화사하고 미니멀한 원형 블롭 */}
        <div className="absolute top-[15%] left-[8%] w-14 h-14 bg-white/10 rounded-2xl rotate-12 blur-[1px]"></div>
        <div className="absolute bottom-[25%] right-[12%] w-24 h-24 bg-white/10 rounded-full blur-[2px]"></div>
        <div className="absolute top-[30%] right-[30%] w-32 h-32 bg-white/5 rounded-[40px] rotate-45 blur-[4px]"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-40 h-40 bg-white/5 rounded-full blur-[6px]"></div>
        
        {/* 슬림 타이틀 로고바 */}
        <div className="w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between relative z-10 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white text-[#0064ff] flex items-center justify-center shadow-lg font-outfit font-black text-sm">
              FP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-outfit font-black text-base tracking-wider">FitPick Studio</span>
                <span className="text-[9px] font-black tracking-widest px-2 py-0.5 rounded bg-white/15 border border-white/20 text-white uppercase font-mono">v0.3.0 Desktop</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 bg-white/15 border border-white/10 rounded-full px-3.5 py-1 text-[10px] font-bold text-white font-mono shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            On-Device Active
          </div>
        </div>
      </div>

      {/* 2. 메인: 토글 스위치를 완전히 제거한 직관적인 웰컴 카드 (랜딩 디자인 최적화) */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 flex flex-col justify-center relative z-10 mt-[110px]">
        
        <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100/80 rounded-[32px] w-full p-8 sm:p-10 space-y-8 transition-all hover:shadow-[0_25px_60px_rgba(0,0,0,0.07)]">
          
          {/* 타이틀 및 소개 */}
          <div className="text-center space-y-2.5">
            <div className="inline-block text-[9px] tracking-widest font-black uppercase text-[#0064ff] bg-[#0064ff]/8 px-3.5 py-1 rounded-full">
              ✨ Welcome to FitPick
            </div>
            <h2 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight">
              핏픽 스튜디오 시작하기
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              에이전시 강사 정보 수집과 스마트 클라이언트 큐레이션을 가장 직관적이고 아름답게 설계해 보세요.
            </p>
          </div>

          {/* 3. 토글 버튼을 걷어내고, 미니멀하고 고급스러운 3대 핵심 안심/기능 배지 장착 */}
          <div className="grid grid-cols-3 gap-3.5 py-2 border-t border-b border-slate-100/80">
            
            {/* 배지 A: 로컬 보안 */}
            <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-[#f8fafc]/80 border border-slate-100">
              <span className="text-lg mb-1">🔒</span>
              <span className="text-[11px] font-bold text-slate-800">100% 로컬 보안</span>
              <span className="text-[9px] text-slate-400 mt-0.5 leading-tight">기기 내부 격리 저장</span>
            </div>

            {/* 배지 B: 초고속 큐레이션 */}
            <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-[#f8fafc]/80 border border-slate-100">
              <span className="text-lg mb-1">⚡</span>
              <span className="text-[11px] font-bold text-slate-800">쾌속 매칭 엔진</span>
              <span className="text-[9px] text-slate-400 mt-0.5 leading-tight">단 30분 만에 추천</span>
            </div>

            {/* 배지 C: 노션 호환 */}
            <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-[#f8fafc]/80 border border-slate-100">
              <span className="text-lg mb-1">📊</span>
              <span className="text-[11px] font-bold text-slate-800">쉬운 백업/엑셀</span>
              <span className="text-[9px] text-slate-400 mt-0.5 leading-tight">클릭 한 번으로 내보내기</span>
            </div>

          </div>

          {/* 4. 직관적이고 매끄러운 2버튼 액션 시스템 */}
          <div className="space-y-3.5 pt-1">
            
            {/* 메인 버튼: 새 작업 영역으로 깨끗하게 시작하기 */}
            <button
              type="button"
              onClick={handleCleanStart}
              className="w-full flex items-center justify-center py-4 px-6 rounded-2xl bg-[#0064ff] hover:bg-[#0053db] active:bg-[#0047bd] text-white font-bold text-sm tracking-wide shadow-[0_6px_20px_rgba(0,100,255,0.18)] hover:shadow-[0_8px_25px_rgba(0,100,255,0.25)] transition-all active:scale-[0.98] cursor-pointer"
            >
              <span>새 작업 영역으로 시작하기</span>
            </button>

            {/* 서브 버튼: 기본 데모 강사 데이터셋 채워서 시작하기 */}
            <button
              type="button"
              onClick={handleQuickDemoStart}
              className="w-full flex flex-col items-center justify-center py-3.5 px-6 rounded-2xl bg-[#f2f4f8] hover:bg-[#e8ebf0] active:bg-[#dce0e7] text-slate-700 font-bold text-xs tracking-wide transition-all active:scale-[0.98] cursor-pointer border border-transparent shadow-sm"
            >
              <span>기본 데모 강사 데이터 채워서 시작하기</span>
              <span className="text-[9px] text-slate-500 font-normal mt-0.5">대시보드 기동 시 강사 4명 데이터 풀 자동 충전</span>
            </button>

          </div>

          {/* 구분선 */}
          <div className="flex items-center gap-3 text-slate-300">
            <div className="h-[1px] bg-slate-100 flex-1"></div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 font-mono">OR</span>
            <div className="h-[1px] bg-slate-100 flex-1"></div>
          </div>

          {/* 5. 백업 파일 로더 드롭존 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1 text-slate-700">
              <span className="text-xs">💾</span>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">이전 백업 데이터 가져오기</h3>
            </div>

            {/* 부드러운 은회색 점선 드롭존 */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`py-5 px-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                isDragging
                  ? "border-[#0064ff] bg-[#0064ff]/5 shadow-[0_0_15px_rgba(0,100,255,0.06)]"
                  : "border-slate-200 bg-[#fafbfc] hover:border-slate-300 hover:bg-[#f4f6fa]"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              
              <svg className="w-8 h-8 text-slate-400 mb-1.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
              </svg>
              <p className="text-xs font-bold text-slate-700">여기에 백업 파일(.json) 드래그 또는 클릭</p>
              <p className="text-[10px] text-slate-400 mt-0.5">안전하게 PC 로컬 DB로 즉시 복원됩니다.</p>
            </div>
          </div>

        </div>
      </main>

      {/* 6. 미니멀 푸터 */}
      <footer className="w-full max-w-5xl mx-auto px-6 py-6 border-t border-slate-200/60 text-center relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans mt-12">
        <span className="text-[10px] text-slate-400 font-mono">
          © 2026 FitPick Enterprise. All rights reserved.
        </span>
        <div className="flex items-center gap-4 text-[10px] text-slate-400 font-mono">
          <span className="hover:text-slate-600 transition-colors">로컬 격리 검증 완료</span>
          <span>•</span>
          <span className="hover:text-slate-600 transition-colors">B2B 무상 세일즈 배포판</span>
          {FEEDBACK_URL && (
            <>
              <span>•</span>
              <a
                href={FEEDBACK_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("feedback_click", { location: "intro_footer" })}
                className="font-bold text-[#0064ff] hover:underline"
              >
                💬 피드백 주기 →
              </a>
            </>
          )}
        </div>
      </footer>

    </div>
  );
}
