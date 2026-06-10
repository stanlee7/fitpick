"use client";

import React from "react";
import { track } from "../../lib/analytics";

export default function DownloadPage() {
  // 깃허브 릴리스의 정식 .exe (NSIS 설치 프로그램)
  const GITHUB_EXE_URL = "https://github.com/stanlee7/fitpick/releases/download/v0.3.0/FitPick_Setup_0.3.0.exe";

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* ───────── 상단 네비게이션 ───────── */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0064ff] text-white flex items-center justify-center font-outfit font-black text-sm shadow-sm">FP</div>
            <span className="font-outfit font-black text-base tracking-tight">FitPick</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono">v0.3</span>
          </a>
          <a
            href="/"
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            웹으로 바로 시작 →
          </a>
        </div>
      </header>

      {/* ───────── 히어로 ───────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f5f8ff] to-white">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[640px] h-[640px] bg-[#0064ff]/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-5 sm:px-8 pt-20 pb-16 text-center">
          <span className="inline-block text-[11px] font-bold tracking-wide text-[#0064ff] bg-[#0064ff]/8 px-3.5 py-1.5 rounded-full mb-6">
            데스크톱 앱 (Windows)
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.15] text-slate-900">
            FitPick을<br className="hidden sm:block" />
            <span className="text-[#0064ff]">내 PC에</span> 설치하세요.
          </h1>
          <p className="mt-6 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto">
            인터넷 없이도 강사풀을 관리하고, 데이터를 내 PC에만 보관하세요. 웹과 똑같은 신뢰신호 제안서·이력서 가져오기를 데스크톱에서 그대로.
          </p>

          <div className="mt-9 flex flex-col items-center gap-3">
            <a
              href={GITHUB_EXE_URL}
              onClick={() => track("app_download", { version: "0.3.0", platform: "win" })}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-[#0064ff] hover:bg-[#0053db] text-white text-sm font-bold shadow-[0_8px_24px_rgba(0,100,255,0.22)] active:scale-[0.98] transition-all cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Windows용 다운로드 (.exe)
            </a>
            <p className="text-[11px] text-slate-400 font-mono">FitPick_Setup_0.3.0.exe · NSIS 설치 프로그램 · 약 138MB</p>
            <a href="/" className="text-xs font-bold text-[#0064ff] hover:underline mt-1">설치 없이 웹으로 바로 쓰기 →</a>
          </div>
        </div>
      </section>

      {/* ───────── 왜 데스크톱? ───────── */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 py-20">
        <div className="text-center mb-12">
          <span className="text-[11px] font-bold text-[#0064ff] uppercase tracking-widest">Why desktop</span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight">데스크톱 앱의 장점</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: "📴", t: "오프라인에서도 동작", d: "인터넷 연결 없이도 강사풀 관리와 제안서 작성이 가능합니다." },
            { icon: "💻", t: "완전 로컬 저장", d: "강사 정보가 내 PC에만 저장됩니다. 클라우드 업로드 없이 내 손 안에." },
            { icon: "✨", t: "웹과 동일한 기능", d: "신뢰신호 제안서, 이력서 가져오기, 보낸 제안서 관리 — 웹과 똑같이." },
          ].map((c) => (
            <div key={c.t} className="rounded-3xl border border-slate-100 bg-slate-50/60 p-6">
              <div className="text-2xl mb-3">{c.icon}</div>
              <h3 className="text-sm font-bold text-slate-900">{c.t}</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── 기능 리캡 ───────── */}
      <section className="bg-[#f7f9fc] border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-20">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">데스크톱에서도 그대로</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: "🛡️", t: "신뢰신호 제안서", d: "경력·고객사·후기를 담아 기업 담당자가 윗선 보고에 바로 쓰는 제안서로." },
              { icon: "📑", t: "이력서로 강사 추가", d: "PDF·DOCX 이력서를 넣으면 강사 카드로. (AI 키 연결 시 자동 정리)" },
              { icon: "📨", t: "보낸 제안서 관리", d: "보낸 제안서의 상태·메모를 직접 기록해 파이프라인을 관리." },
            ].map((f) => (
              <div key={f.t} className="rounded-3xl bg-white border border-slate-100 p-6 shadow-sm">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="text-sm font-bold text-slate-900">{f.t}</h3>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── 설치 3단계 ───────── */}
      <section className="max-w-4xl mx-auto px-5 sm:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">설치는 3단계</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { n: "1", t: "다운로드", d: "위 버튼으로 설치 파일(.exe)을 내려받습니다." },
            { n: "2", t: "설치 실행", d: "내려받은 파일을 실행하면 자동으로 설치됩니다." },
            { n: "3", t: "바로 시작", d: "바탕화면의 핏픽 아이콘으로 실행해 강사풀을 시작하세요." },
          ].map((s) => (
            <div key={s.n} className="relative rounded-3xl bg-white border border-slate-100 p-7 shadow-sm">
              <div className="w-9 h-9 rounded-full bg-[#0064ff] text-white font-black flex items-center justify-center mb-4">{s.n}</div>
              <h3 className="text-base font-bold text-slate-900">{s.t}</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-[11px] text-slate-400 mt-8 leading-relaxed">
          ※ 설치 시 Windows의 &quot;알 수 없는 게시자&quot; 안내가 나오면 &quot;추가 정보 → 실행&quot;을 눌러주세요. (코드 서명 미적용 배포판)
        </p>
      </section>

      {/* ───────── 푸터 ───────── */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-6 h-6 rounded-lg bg-[#0064ff] text-white flex items-center justify-center font-outfit font-black text-[10px]">FP</div>
            <span className="text-[11px] font-mono">© 2026 FitPick — 강사 큐레이션 · 제안서 생성</span>
          </div>
          <a href="/" className="text-[11px] font-bold text-[#0064ff] hover:underline font-mono">웹으로 바로 시작 →</a>
        </div>
      </footer>
    </div>
  );
}
