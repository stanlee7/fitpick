"use client";

import React from "react";

export default function DownloadPage() {
  // [💡 VIP 배포 팁] 파트너님의 깃허브 레포지토리 주소나 다운로드 주소에 맞춰 아래 URL을 원하는 CDN 주소로 변경하여 배포 가능합니다!
  const GITHUB_EXE_URL = "https://github.com/stanley-tam/fitpick/releases/download/v0.3.0/FitPick_Setup_0.3.0.exe";

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-between text-slate-900 font-sans relative overflow-hidden">
      {/* 백그라운드 비주얼 네온 라이트 효과 */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none"></div>

      {/* 글로벌 탑 헤더 네비게이션 배너 */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between border-b border-slate-200/40 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#3182f6] flex items-center justify-center shadow-sm">
            <span className="font-sans font-black text-white text-sm">FP</span>
          </div>
          <div>
            <h1 className="font-sans font-black text-base tracking-tight text-slate-900">핏픽 <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-650">v0.3.0</span></h1>
            <p className="text-[9px] text-slate-400 font-medium">Smart Instructor Curation System</p>
          </div>
        </div>
        <a
          href="/"
          className="text-xs font-bold text-slate-600 hover:text-[#3182f6] transition-colors"
        >
          대시보드로 돌아가기 →
        </a>
      </header>

      {/* 메인 히어로 다운로드 카드 섹션 */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 text-center flex flex-col items-center justify-center space-y-10 relative z-10">
        
        {/* 화려한 비주얼 바운스 링 */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[#3182f6]/10 animate-ping"></div>
          <div className="w-14 h-14 rounded-3xl bg-[#3182f6] flex items-center justify-center shadow-lg shadow-blue-500/25">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </div>
        </div>

        <div className="space-y-4">
          <span className="text-[10px] font-extrabold text-[#3182f6] tracking-widest uppercase bg-blue-50/80 border border-blue-200/50 px-3.5 py-1.5 rounded-full shadow-sm">
            ★ FITPICK 정식 데스크톱 클라이언트 배포
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-950 leading-tight">
            핏픽 (FitPick) 정식 버전 다운로드
          </h2>
          <p className="text-xs md:text-sm text-slate-500 font-semibold max-w-xl mx-auto leading-relaxed">
            CORS 통신 제한이 없는 강력한 데스크톱 네이티브 성능! <br />
            노션 원클릭 프로필 동기화 및 클라이언트 제안 열람 추적 기술을 한 몸에 누리세요.
          </p>
        </div>

        {/* 정식 다운로드 초고속 CDN 링크 버튼 */}
        <div className="space-y-4">
          <a
            href={GITHUB_EXE_URL}
            className="inline-flex items-center gap-3 px-10 py-5 bg-[#3182f6] hover:bg-[#1b64da] text-white font-bold rounded-3xl shadow-[0_12px_40px_rgba(49,130,246,0.22)] hover:shadow-[0_16px_50px_rgba(49,130,246,0.32)] transform hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all text-xs md:text-sm cursor-pointer"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
            </svg>
            핏픽 정식 앱 초고속 다운로드 (Windows .exe)
          </a>
          <p className="text-[9px] text-slate-400 font-mono font-semibold">
            파일명: FitPick Setup 0.3.0.exe (NSIS 설치 프로그램, 약 68MB)
          </p>
        </div>

        {/* 3대 핵심 상용 킬러 피처 배지 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 w-full max-w-3xl">
          <div className="bg-white/70 backdrop-blur-[2px] p-6 rounded-[28px] border border-slate-100 shadow-sm text-left space-y-2.5 transition-all duration-300 hover:scale-[1.02] hover:bg-white hover:shadow-md">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-sm">🔒</div>
            <h3 className="text-xs font-bold text-slate-900">로컬 암호화 보안 스토리지</h3>
            <p className="text-[10px] text-slate-500 leading-normal font-medium">강사의 연락처 및 민감 정보를 클라우드에 노출하지 않고, 오직 파트너님의 PC 내부 브라우저 저장소에만 안전하게 암호화 보존합니다.</p>
          </div>
          
          <div className="bg-white/70 backdrop-blur-[2px] p-6 rounded-[28px] border border-slate-100 shadow-sm text-left space-y-2.5 transition-all duration-300 hover:scale-[1.02] hover:bg-white hover:shadow-md">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-sm">⚡</div>
            <h3 className="text-xs font-bold text-slate-900">노션 1초 양방향 동기화</h3>
            <p className="text-[10px] text-slate-500 leading-normal font-medium">강사들이 건네준 Notion 프로필 주소를 넣는 즉시 인적사항과 소개서 파일, 강의 이력이 초고속 파싱되어 에이전시 데이터로 즉시 동기화됩니다.</p>
          </div>

          <div className="bg-white/70 backdrop-blur-[2px] p-6 rounded-[28px] border border-slate-100 shadow-sm text-left space-y-2.5 transition-all duration-300 hover:scale-[1.02] hover:bg-white hover:shadow-md">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-sm">👁️</div>
            <h3 className="text-xs font-bold text-slate-900">제안 열람 실시간 추적</h3>
            <p className="text-[10px] text-slate-500 leading-normal font-medium">클라이언트가 모바일이나 PC로 큐레이션 제안 링크를 열어보는 순간 즉각적인 알림 푸시를 수신하여 최적의 통화 영업 기회를 쟁취합니다.</p>
          </div>
        </div>

      </main>

      {/* 정식 글로벌 하단 정보 */}
      <footer className="w-full py-6 text-center border-t border-slate-200/40 bg-slate-50 text-[9px] text-slate-400 font-mono relative z-10">
        © 2026 FitPick Inc. Smart Agency Instructor Curation Solution. All rights reserved.
      </footer>
    </div>
  );
}
