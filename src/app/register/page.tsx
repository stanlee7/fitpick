"use client";

// 공개 강사 등록 페이지 (구 agentl-pool.vercel.app/instructor 흡수).
// 큐레이터가 이 링크를 강사에게 공유 → 신청은 Supabase로 → 대시보드 "등록 신청함"에서 가져오기.

import React, { useState, useMemo, FormEvent } from "react";
import { submitRegistration } from "../../lib/registry";
import { track } from "../../lib/analytics";
import { encodeProposal, getShareBase, SharedProposal } from "../../lib/proposal";
import { mockInstructors } from "../../data/mockInstructors";

const REGIONS = ["서울", "경기·인천", "충청", "강원", "전라", "경상", "제주", "온라인(전국)"];
const SPECIALTIES = [
  "프롬프트 엔지니어링",
  "업무 자동화",
  "이미지·영상 생성",
  "바이브 코딩",
  "AI 리터러시",
  "데이터·분석",
  "챗봇·에이전트 구축",
];
const TARGETS = ["기업 임직원", "공공기관", "대학·대학생", "초중고", "일반·시니어"];

const emailValid = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const urlValid = (v: string) => {
  try {
    new URL(v);
    return true;
  } catch {
    return false;
  }
};

/** "이렇게 제안됩니다" 샘플 — 데모 강사 1명으로 실제 /proposal 링크를 만든다 */
function buildSampleProposalUrl(): string {
  const demo = mockInstructors[0];
  const proposal: SharedProposal = {
    client: "(주)샘플기업",
    title: "AI 실무 교육 강사 제안 (샘플)",
    note: "등록 강사님의 프로필이 이렇게 경력·고객사·후기가 담긴 제안서로 기업 담당자에게 전달됩니다.",
    template: "minimal",
    instructors: [
      {
        name: demo.name,
        role: demo.role,
        bio: demo.bio,
        rating: demo.rating,
        reviewCount: demo.reviewCount,
        availability: demo.availability,
        materials: demo.portfolioItems.map((p) => ({ title: p.title, type: p.type })),
        yearsTeaching: demo.yearsTeaching,
        sessionsCount: demo.sessionsCount,
        traineesCount: demo.traineesCount,
        careerHistory: demo.careerHistory,
        clientCompanies: demo.clientCompanies,
        testimonials: demo.testimonials,
      },
    ],
  };
  return `${getShareBase()}/proposal#p=${encodeProposal(proposal)}`;
}

const STEPS = [
  { n: "1", title: "1분 등록", desc: "이메일과 전문 분야만 있으면 됩니다." },
  { n: "2", title: "큐레이터 확인", desc: "프로필을 확인하고 경력·후기를 함께 보강합니다." },
  { n: "3", title: "신뢰 제안서로 제안", desc: "분야가 맞는 의뢰가 오면 기업 담당자에게 직접 제안됩니다." },
];

const FAQS = [
  {
    q: "비용이 있나요?",
    a: "현재 등록과 매칭 모두 무료로 운영 중입니다. 유료 전환 시에는 등록된 이메일로 사전에 안내드립니다.",
  },
  {
    q: "등록하면 언제 연락이 오나요?",
    a: "상시 대기가 아니라, 강사님 분야와 맞는 기업·공공기관 교육 의뢰가 들어왔을 때 이메일로 연락드립니다.",
  },
  {
    q: "제 정보는 어떻게 쓰이나요?",
    a: "큐레이터의 강사 풀 관리에만 사용하고, 기업에는 제안서 형태로 필요한 경우에만 전달합니다. 광고·제3자 제공은 없습니다.",
  },
];

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [headline, setHeadline] = useState("");
  const [regions, setRegions] = useState<string[]>([]);
  const [specs, setSpecs] = useState<string[]>([]);
  const [targets, setTargets] = useState<string[]>([]);

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const sampleUrl = useMemo(buildSampleProposalUrl, []);

  const emailErr = submitted && !emailValid(email);
  const urlErr = submitted && profileUrl.trim().length > 0 && !urlValid(profileUrl.trim());

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!emailValid(email)) return;
    if (profileUrl.trim() && !urlValid(profileUrl.trim())) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitRegistration({
        name: name.trim() || null,
        email: email.trim(),
        linkedin_url: profileUrl.trim(),
        regions,
        specialties: specs,
        target_audiences: targets,
        headline: headline.trim() || null,
      });
      setDone(true);
      track("instructor_register_submit", { specialties: specs.length });
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "전송 중 오류가 발생했습니다.");
    }
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen text-slate-900 pb-16">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-blue/5 blur-[120px] pointer-events-none"></div>

      <header className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between border-b border-slate-200/60 relative z-10">
        <a href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-blue flex items-center justify-center shadow-sm">
            <span className="font-outfit font-black text-white text-base">FP</span>
          </div>
          <div>
            <h1 className="font-outfit font-black text-xl tracking-tight text-slate-900">핏픽</h1>
            <p className="text-[10px] text-text-muted font-normal">Smart Instructor Curation System</p>
          </div>
        </a>
      </header>

      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 mt-10 relative z-10">
        {/* ── 히어로 ── */}
        <div className="text-center mb-8">
          <span className="inline-block text-[11px] font-bold px-3 py-1 rounded-full bg-brand-blue-light border border-brand-blue/15 text-brand-blue mb-3">
            AI 강사 풀 등록 · 무료 · 1분 소요
          </span>
          <h2 className="text-2xl sm:text-3xl font-outfit font-extrabold text-slate-900 leading-snug">
            기업 교육 의뢰,
            <br className="sm:hidden" /> <span className="text-brand-blue">경력이 보이는 제안서</span>로 연결받으세요
          </h2>
          <p className="text-xs sm:text-sm text-text-slate mt-3 leading-relaxed max-w-lg mx-auto">
            프롬프트 엔지니어링 · 업무 자동화 · AI 리터러시 등 분야별 강사 풀을 운영합니다.
            지금은 초기 풀 구성 단계라, <strong>일찍 등록한 강사일수록 매칭 우선순위가 높습니다.</strong>
          </p>
        </div>

        {/* ── 등록 후 3단계 ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-8">
          {STEPS.map((s) => (
            <div key={s.n} className="glass-panel rounded-2xl p-4 flex sm:block items-start gap-3">
              <span className="w-7 h-7 shrink-0 rounded-full bg-brand-blue-light border border-brand-blue/20 text-brand-blue text-xs font-black flex items-center justify-center sm:mb-2">
                {s.n}
              </span>
              <div>
                <p className="text-xs font-bold text-slate-800">{s.title}</p>
                <p className="text-[11px] text-text-slate mt-0.5 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {!done ? (
          <form onSubmit={handleSubmit} noValidate className="glass-panel p-6 sm:p-8 rounded-[32px] shadow-sm space-y-5">
            <div>
              <label htmlFor="name" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                이름 <span className="text-slate-300 normal-case">(선택)</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 김민우"
                autoComplete="name"
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-brand-blue"
              />
            </div>

            <div>
              <label htmlFor="email" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                이메일 <span className="text-rose-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-brand-blue ${
                  emailErr ? "border-rose-300" : "border-slate-200"
                }`}
              />
              {emailErr && <p className="text-[11px] text-rose-500 mt-1">이메일을 정확히 입력해 주세요.</p>}
            </div>

            <div>
              <label htmlFor="profile" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                프로필 URL <span className="text-slate-300 normal-case">(LinkedIn·블로그·포트폴리오 등, 선택)</span>
              </label>
              <input
                id="profile"
                type="url"
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-brand-blue ${
                  urlErr ? "border-rose-300" : "border-slate-200"
                }`}
              />
              {urlErr && <p className="text-[11px] text-rose-500 mt-1">URL 형식(https://...)으로 입력해 주세요.</p>}
            </div>

            <hr className="border-slate-100" />

            <PillField label="활동 지역" options={REGIONS} selected={regions} onToggle={(v) => toggle(regions, setRegions, v)} />
            <PillField label="AI 전문 분야" options={SPECIALTIES} selected={specs} onToggle={(v) => toggle(specs, setSpecs, v)} />
            <PillField label="주요 강의 대상" options={TARGETS} selected={targets} onToggle={(v) => toggle(targets, setTargets, v)} />

            <hr className="border-slate-100" />

            <div>
              <label htmlFor="headline" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                한 줄 소개 <span className="text-slate-300 normal-case">(선택)</span>
              </label>
              <input
                id="headline"
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="예: 제조업 AI 교육, 300회+ 기업 강의"
                maxLength={60}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-brand-blue"
              />
            </div>

            <div className="pt-1 space-y-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-2xl bg-brand-blue hover:bg-brand-blue-hover text-white text-sm font-bold shadow-sm active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? "등록 중..." : "무료로 등록 신청하기"}
              </button>
              {submitError && (
                <p className="text-[11px] text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 leading-relaxed text-center">
                  {submitError}
                </p>
              )}
              <p className="text-[10px] text-text-muted text-center leading-relaxed">
                제출하신 정보는 큐레이터의 강사 풀 관리에만 사용되며, 확인 후 연락드립니다.
              </p>
            </div>
          </form>
        ) : (
          <div className="glass-panel p-8 rounded-[32px] shadow-sm text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h3 className="text-lg font-outfit font-extrabold text-slate-900">등록 신청이 접수되었습니다</h3>
            <p className="text-xs text-text-slate leading-relaxed">
              큐레이터가 프로필을 확인한 뒤 <strong>{email}</strong>(으)로 연락드릴게요.
            </p>
            <div className="text-left max-w-sm mx-auto bg-slate-50/60 border border-slate-100 rounded-2xl p-4 space-y-1.5">
              <SummaryRow k="이름" v={name || "(미입력)"} />
              <SummaryRow k="활동 지역" v={regions.length ? regions.join(", ") : "미선택"} />
              <SummaryRow k="전문 분야" v={specs.length ? specs.join(", ") : "미선택"} />
              <SummaryRow k="강의 대상" v={targets.length ? targets.join(", ") : "미선택"} />
            </div>
          </div>
        )}

        {/* ── 제안서 샘플: 등록하면 이렇게 제안됩니다 ── */}
        <div className="mt-8 glass-panel rounded-[28px] p-6 sm:p-7 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-base">📄</span>
            <h3 className="text-sm font-outfit font-extrabold text-slate-900">강사님은 이런 모습으로 기업에 전달됩니다</h3>
          </div>
          <p className="text-xs text-text-slate leading-relaxed">
            단순 프로필 나열이 아니라, <strong>강의 경력 · 기업 재직 경력 · 진행 고객사 · 수강 후기</strong>까지 담긴
            제안서로 기업 담당자에게 제안됩니다. 담당자가 윗선 보고에 그대로 쓸 수 있는 형태라 채택률이 다릅니다.
          </p>
          <a
            href={sampleUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("register_sample_proposal_view")}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue hover:underline"
          >
            샘플 제안서 미리보기 →
          </a>
        </div>

        {/* ── 운영자 ── */}
        <div className="mt-4 glass-panel rounded-[28px] p-6 sm:p-7 flex items-start gap-3">
          <span className="text-base mt-0.5">👨‍🏫</span>
          <div>
            <h3 className="text-sm font-outfit font-extrabold text-slate-900">현직 AI 강사가 직접 운영합니다</h3>
            <p className="text-xs text-text-slate leading-relaxed mt-1.5">
              기업·공공기관에서 AI 교육을 진행하는 현직 강사가 큐레이터로서 직접 강사 풀을 관리하고 제안합니다.
              강사 입장에서 무엇이 아쉬운지 알기에, 프로필을 파는 게 아니라 <strong>맞는 의뢰에만</strong> 연결합니다.{" "}
              <a
                href="https://stanlee-ai-instructor.vercel.app?from=register"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-blue font-bold hover:underline"
              >
                운영자 소개 보기 →
              </a>
            </p>
          </div>
        </div>

        {/* ── FAQ ── */}
        <div className="mt-4 glass-panel rounded-[28px] p-6 sm:p-7 space-y-4">
          <h3 className="text-sm font-outfit font-extrabold text-slate-900">자주 묻는 질문</h3>
          {FAQS.map((f) => (
            <div key={f.q}>
              <p className="text-xs font-bold text-slate-800">Q. {f.q}</p>
              <p className="text-xs text-text-slate leading-relaxed mt-1">{f.a}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function PillField({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
        {label} <span className="text-slate-300 normal-case">(복수 선택)</span>
      </span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const on = selected.includes(opt);
          return (
            <button
              type="button"
              key={opt}
              aria-pressed={on}
              onClick={() => onToggle(opt)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                on
                  ? "bg-brand-blue-light border-brand-blue/25 text-brand-blue font-bold"
                  : "bg-white border-slate-200 text-text-slate hover:bg-slate-50"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SummaryRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="w-16 shrink-0 text-slate-400 font-semibold">{k}</span>
      <span className="text-slate-700">{v}</span>
    </div>
  );
}
