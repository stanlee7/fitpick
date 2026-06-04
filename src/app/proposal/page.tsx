"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getTemplateStyles } from "../../lib/templates";
import { decodeProposal, SharedProposal } from "../../lib/proposal";
import { avatarFor } from "../../lib/avatar";
import { track } from "../../lib/analytics";

function availabilityLabel(status: string): string {
  return status || "일정 협의";
}

export default function ProposalPage() {
  const [proposal, setProposal] = useState<SharedProposal | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const hash = window.location.hash; // "#p=...."
    const idx = hash.indexOf("p=");
    if (idx >= 0) {
      // encodeProposal 이 한 번 인코딩한 문자열을 그대로 디코딩(이중 디코딩 방지)
      setProposal(decodeProposal(hash.slice(idx + 2)));
    }
    setLoaded(true);
    track("proposal_view");
  }, []);

  // 정적 셸/하이드레이션 전엔 빈 화면
  if (!loaded) return null;

  // 잘못되었거나 비어있는 링크
  if (!proposal || proposal.instructors.length === 0) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-3xl bg-white border border-slate-200 flex items-center justify-center mb-5 shadow-sm">
          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-lg font-extrabold text-slate-900">제안서를 불러올 수 없습니다</h1>
        <p className="text-xs text-slate-500 mt-2 max-w-sm leading-relaxed">
          링크가 손상되었거나 만료되었을 수 있어요. 제안서를 보내주신 담당자에게 새 링크를 요청해 주세요.
        </p>
        <Link href="/" className="mt-6 text-xs font-bold text-[#3182f6] hover:underline">
          FitPick 홈으로 →
        </Link>
      </div>
    );
  }

  const style = getTemplateStyles(proposal.template);

  return (
    <div className={`min-h-screen ${style.wrapper}`}>
      <div className="max-w-3xl mx-auto px-6 md:px-10 py-12 md:py-16 space-y-8">

        {/* Header */}
        <div className="text-center space-y-3.5 pb-6 border-b border-slate-200/60">
          <span className={`text-[10px] tracking-widest font-bold uppercase ${style.accentColor}`}>
            ★ FITPICK 큐레이션 강사 제안서
          </span>
          <h1 className={`text-2xl md:text-4xl font-outfit font-black leading-tight ${style.headerBg}`}>
            {proposal.client} 추천 강사 리스트
          </h1>
          <p className="text-xs md:text-sm text-text-slate font-medium max-w-lg mx-auto">
            의뢰 주제: <strong className="text-slate-800">{proposal.title}</strong>
          </p>
        </div>

        {/* Agency Comment */}
        <div className={`p-6 ${style.card} leading-relaxed space-y-3.5`}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-brand-blue-light border border-brand-blue/20 flex items-center justify-center text-[10px] text-brand-blue font-bold">
              ✍
            </div>
            <span className="text-xs font-extrabold text-slate-800">에이전시 종합 제안 소견</span>
          </div>
          <p className="text-xs md:text-sm text-slate-700 font-normal whitespace-pre-wrap pl-8 leading-relaxed">
            {proposal.note ||
              "의뢰하신 분야의 핵심 성공 요인을 완벽히 충족하며, 검증된 경력과 훌륭한 강의 피드백을 축적한 최고의 전문가들을 엄선하여 추천드립니다."}
          </p>
        </div>

        {/* Instructors */}
        <div className="space-y-6">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 mb-2">
            추천 강사 리스트 ({proposal.instructors.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {proposal.instructors.map((inst, i) => (
              <div key={i} className={`p-6 ${style.card} space-y-4`}>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-100 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={avatarFor(inst.name)} alt={inst.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-outfit font-bold text-base text-slate-900">{inst.name} 강사</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${style.badgeColor}`}>
                        {availabilityLabel(inst.availability)}
                      </span>
                    </div>
                    <p className="text-xs text-text-slate font-normal leading-snug mt-1">{inst.role}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-650 font-normal leading-relaxed min-h-[50px]">{inst.bio}</p>

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

                {inst.materials.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                      📋 제안 및 강의 계획 자료
                    </span>
                    {inst.materials.map((m, idx) => (
                      <div
                        key={idx}
                        className="flex items-center p-2.5 rounded-xl bg-slate-50 border border-slate-150 text-xs text-text-slate"
                      >
                        <svg className="w-3.5 h-3.5 text-brand-blue mr-2 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        <span className="truncate flex-1 font-mono text-[10px] font-medium">{m.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-slate-200/60 space-y-2">
          <p className="text-xs text-text-slate font-medium">
            상세 일정·견적 조율이 필요하시면 본 제안서를 보내드린 담당자에게 회신해 주세요.
          </p>
          <Link href="/" className="inline-block text-[10px] text-text-muted font-mono hover:text-slate-600">
            ⚡ FitPick 으로 작성된 큐레이션 제안서
          </Link>
        </div>

      </div>
    </div>
  );
}
