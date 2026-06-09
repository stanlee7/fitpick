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

  const handleCleanStart = () => {
    track("app_start", { mode: "clean" });
    if (onImport) onImport([]);
    else onStart();
  };

  const handleQuickDemoStart = () => {
    track("app_start", { mode: "demo" });
    if (onImport) onImport(mockInstructors);
    else onStart();
  };

  const goToStart = () => {
    document.getElementById("start")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* ───────── 상단 네비게이션 ───────── */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0064ff] text-white flex items-center justify-center font-outfit font-black text-sm shadow-sm">
              FP
            </div>
            <span className="font-outfit font-black text-base tracking-tight">FitPick</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono">v0.3</span>
          </div>
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-500">
            <a href="#how" className="hover:text-slate-900 transition-colors">동작 방식</a>
            <a href="#trust" className="hover:text-slate-900 transition-colors">신뢰 제안서</a>
            <a href="#features" className="hover:text-slate-900 transition-colors">기능</a>
            <a href="#who" className="hover:text-slate-900 transition-colors">대상</a>
          </nav>
          <button
            onClick={goToStart}
            className="px-4 py-2 rounded-xl bg-[#0064ff] hover:bg-[#0053db] text-white text-xs font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            무료로 시작하기
          </button>
        </div>
      </header>

      {/* ───────── 히어로 ───────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f5f8ff] to-white">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[640px] h-[640px] bg-[#0064ff]/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-5 sm:px-8 pt-20 pb-16 text-center">
          <span className="inline-block text-[11px] font-bold tracking-wide text-[#0064ff] bg-[#0064ff]/8 px-3.5 py-1.5 rounded-full mb-6">
            교육 에이전시·1인 강사 큐레이터를 위한 도구
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.15] text-slate-900">
            강사 제안, 이제<br className="hidden sm:block" />
            <span className="text-[#0064ff]">신뢰</span>로 설득하세요.
          </h1>
          <p className="mt-6 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto">
            강사풀을 관리하고, 강의경력·고객사·후기까지 담은 <strong className="text-slate-800">신뢰 제안서</strong>를 몇 분 만에 만들어 공유하세요. 기업 담당자가 윗선 보고에 그대로 쓰는 제안서로.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleQuickDemoStart}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#0064ff] hover:bg-[#0053db] text-white text-sm font-bold shadow-[0_8px_24px_rgba(0,100,255,0.22)] active:scale-[0.98] transition-all cursor-pointer"
            >
              데모로 바로 둘러보기 →
            </button>
            <button
              onClick={goToStart}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold transition-all active:scale-[0.98] cursor-pointer"
            >
              새 작업 영역 시작
            </button>
          </div>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-slate-400 font-medium">
            <span>✓ 설치 불필요 · 웹에서 바로</span>
            <span>✓ 로그인 없이 시작</span>
            <span>✓ 내 PC에 안전 저장</span>
          </div>
        </div>
      </section>

      {/* ───────── 문제 공감 ───────── */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">이런 고민, 익숙하시죠?</h2>
          <p className="mt-3 text-sm text-slate-500">강사를 추천해도, 결국 기업이 안 믿으면 계약은 멀어집니다.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: "🗂️", t: "강사 정보가 엑셀·노션에 흩어짐", d: "누가 무슨 강의를 했는지 찾는 데만 한참, 제안할 때마다 처음부터 다시." },
            { icon: "📄", t: "제안서를 매번 새로 만듦", d: "PPT·메일로 손수 정리. 시간은 시간대로, 퀄리티는 들쭉날쭉." },
            { icon: "🤝", t: "기업은 검증 안 된 강사를 못 믿음", d: "담당자는 윗선 보고가 걸려 '경력·후기·진행 기업' 같은 근거를 원합니다." },
          ].map((p) => (
            <div key={p.t} className="rounded-3xl border border-slate-100 bg-slate-50/60 p-6">
              <div className="text-2xl mb-3">{p.icon}</div>
              <h3 className="text-sm font-bold text-slate-900">{p.t}</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── 동작 3단계 ───────── */}
      <section id="how" className="bg-[#f7f9fc] border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-20">
          <div className="text-center mb-14">
            <span className="text-[11px] font-bold text-[#0064ff] uppercase tracking-widest">How it works</span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight">3단계면 끝납니다</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: "1", t: "강사풀 등록", d: "강의경력·기업재직·고객사·후기·샘플영상까지 한 곳에. 노션 링크나 백업 파일로 한 번에 가져오기." },
              { n: "2", t: "의뢰에 맞게 큐레이션", d: "주제·일정에 맞는 강사를 골라 큐레이션 보드에 담고, 추천 코멘트 초안까지 자동으로." },
              { n: "3", t: "신뢰 제안서 링크 공유", d: "신뢰신호가 담긴 제안서 링크를 복사해 기업 담당자에게 바로 전달. PDF 저장도 한 번에." },
            ].map((s) => (
              <div key={s.n} className="relative rounded-3xl bg-white border border-slate-100 p-7 shadow-sm">
                <div className="w-9 h-9 rounded-full bg-[#0064ff] text-white font-black flex items-center justify-center mb-4">{s.n}</div>
                <h3 className="text-base font-bold text-slate-900">{s.t}</h3>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── 신뢰신호(핵심 차별점) ───────── */}
      <section id="trust" className="max-w-5xl mx-auto px-5 sm:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-[11px] font-bold text-[#0064ff] uppercase tracking-widest">핵심 차별점</span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight leading-snug">
              제안서가<br />
              <span className="text-[#0064ff]">검증된 신뢰</span>를 증명합니다
            </h2>
            <p className="mt-4 text-sm text-slate-600 leading-relaxed">
              기업 담당자가 강사를 고를 때 가장 중요하게 보는 건 가격보다 <strong className="text-slate-800">검증된 트랙레코드</strong>입니다. FitPick 제안서는 그 근거를 한눈에 담습니다.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                ["강의 경력·실적", "연차 · 누적 강의 횟수 · 교육 인원"],
                ["기업 재직 경력", "어디서 무엇을 했는지 실무 이력"],
                ["강의 진행 기업", "실제로 강의한 고객사 = 강력한 사회적 증거"],
                ["실제 수강 후기", "현장의 목소리로 설득력 보강"],
              ].map(([t, d]) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-[#0064ff]/10 text-[#0064ff] text-[11px] font-black flex items-center justify-center shrink-0">✓</span>
                  <span className="text-sm text-slate-700"><strong className="text-slate-900">{t}</strong> <span className="text-slate-400">— {d}</span></span>
                </li>
              ))}
            </ul>
          </div>

          {/* 샘플 제안서 카드 비주얼 */}
          <div className="rounded-[28px] border border-slate-150 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0064ff] to-[#3b86ff] text-white flex items-center justify-center font-black text-lg shrink-0">김</div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900">김민우 강사</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 font-semibold">즉시 가용</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">UX/UI 서비스 디자인 & 피그마 실무 마스터</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 py-3 my-4 border-y border-slate-100 bg-slate-50/60 px-2 rounded-2xl text-center">
              <div className="border-r border-slate-200/60">
                <span className="text-[9px] text-slate-400 font-bold block">강의 경력</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5">8년차</p>
              </div>
              <div className="border-r border-slate-200/60">
                <span className="text-[9px] text-slate-400 font-bold block">누적 강의</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5">210회</p>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-bold block">교육 인원</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5">6,500명</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">강의 진행 기업</p>
            <div className="flex flex-wrap gap-1 mb-4">
              {["삼성전자", "우아한형제들", "당근마켓", "신한카드"].map((c) => (
                <span key={c} className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-semibold">{c}</span>
              ))}
            </div>
            <div className="rounded-2xl bg-[#0064ff]/[0.05] border border-[#0064ff]/10 p-3">
              <p className="text-[11px] text-slate-700 italic leading-relaxed">“툴 교육을 넘어 팀의 협업 프로세스 자체가 바뀌었습니다.”</p>
              <p className="text-[9px] text-slate-400 font-semibold text-right mt-1">— 삼성전자 디자인팀 이OO 책임</p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── 기능 그리드 ───────── */}
      <section id="features" className="bg-[#f7f9fc] border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-20">
          <div className="text-center mb-14">
            <span className="text-[11px] font-bold text-[#0064ff] uppercase tracking-widest">Features</span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight">큐레이터를 위한 모든 것</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: "🛡️", t: "신뢰신호 제안서", d: "경력·고객사·후기·샘플영상을 한 장에 담아 설득력 있는 제안서로." },
              { icon: "⚡", t: "빠른 큐레이션", d: "강사를 골라 담으면 추천 코멘트 초안까지 자동으로 완성." },
              { icon: "🔗", t: "공유 링크 전달", d: "제안서를 URL 한 번으로 전달. PDF 저장·인쇄도 지원." },
              { icon: "💾", t: "백업 / 엑셀", d: "강사 풀을 백업 파일·엑셀로 내보내 안전하게 보관." },
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

      {/* ───────── 대상 ───────── */}
      <section id="who" className="max-w-5xl mx-auto px-5 sm:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">이런 분께 딱 맞습니다</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { t: "교육 에이전시", d: "여러 강사를 관리하며 기업에 맞춤 제안을 보내야 하는 팀." },
            { t: "1인 강사 큐레이터", d: "혼자서 강사 풀을 운영하며 빠르게 제안서를 내야 하는 분." },
            { t: "기업교육 매칭 담당", d: "강사 후보를 정리해 의사결정자에게 설득력 있게 전달해야 하는 분." },
          ].map((w) => (
            <div key={w.t} className="rounded-3xl border border-slate-100 p-6">
              <h3 className="text-sm font-bold text-[#0064ff]">{w.t}</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">{w.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── 시작 섹션 ───────── */}
      <section id="start" className="bg-gradient-to-b from-white to-[#f5f8ff]">
        <div className="max-w-lg mx-auto px-5 sm:px-8 py-20">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">지금 무료로 시작하세요</h2>
            <p className="mt-3 text-sm text-slate-500">설치·로그인 없이 바로. 데이터는 내 브라우저에 저장됩니다.</p>
          </div>

          <div className="bg-white border border-slate-100 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-7 sm:p-9 space-y-4">
            <button
              onClick={handleCleanStart}
              className="w-full py-4 rounded-2xl bg-[#0064ff] hover:bg-[#0053db] text-white text-sm font-bold shadow-[0_6px_20px_rgba(0,100,255,0.18)] active:scale-[0.98] transition-all cursor-pointer"
            >
              새 작업 영역으로 시작하기
            </button>
            <button
              onClick={handleQuickDemoStart}
              className="w-full py-3.5 rounded-2xl bg-[#f2f4f8] hover:bg-[#e8ebf0] text-slate-700 text-xs font-bold transition-all active:scale-[0.98] cursor-pointer flex flex-col items-center"
            >
              <span>기본 데모 강사 데이터로 둘러보기</span>
              <span className="text-[9px] text-slate-500 font-normal mt-0.5">강사 4명 데이터 풀 자동 충전</span>
            </button>

            <div className="flex items-center gap-3 text-slate-300 py-1">
              <div className="h-px bg-slate-100 flex-1" />
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 font-mono">OR</span>
              <div className="h-px bg-slate-100 flex-1" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1 text-slate-500">
                <span className="text-xs">💾</span>
                <h3 className="text-[11px] font-bold uppercase tracking-wider">이전 백업 데이터 가져오기</h3>
              </div>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`py-6 px-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-[#0064ff] bg-[#0064ff]/5"
                    : "border-slate-200 bg-[#fafbfc] hover:border-slate-300 hover:bg-[#f4f6fa]"
                }`}
              >
                <input type="file" ref={fileInputRef} accept=".json" onChange={handleFileChange} className="hidden" />
                <svg className="w-7 h-7 text-slate-400 mb-1.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                </svg>
                <p className="text-xs font-bold text-slate-700">백업 파일(.json) 드래그 또는 클릭</p>
                <p className="text-[10px] text-slate-400 mt-0.5">백업 파일에서 강사 풀을 즉시 복원합니다.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── 푸터 ───────── */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-6 h-6 rounded-lg bg-[#0064ff] text-white flex items-center justify-center font-outfit font-black text-[10px]">FP</div>
            <span className="text-[11px] font-mono">© 2026 FitPick — 강사 큐레이션 · 제안서 생성</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
            <span>B2B 무상 세일즈 배포판</span>
            {FEEDBACK_URL && (
              <>
                <span>•</span>
                <a
                  href={FEEDBACK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("feedback_click", { location: "landing_footer" })}
                  className="font-bold text-[#0064ff] hover:underline"
                >
                  💬 피드백 주기 →
                </a>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
