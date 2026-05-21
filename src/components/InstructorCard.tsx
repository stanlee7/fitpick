"use strict";

import React, { useState } from "react";
import { Instructor } from "../data/mockInstructors";

interface InstructorCardProps {
  instructor: Instructor;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export default function InstructorCard({
  instructor,
  isSelected,
  onSelect,
}: InstructorCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Availability color mapping
  const getAvailabilityStyle = (status: Instructor["availability"]) => {
    switch (status) {
      case "즉시 가용":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "일정 협의":
        return "bg-blue-50 text-brand-blue border-blue-100";
      case "마감":
        return "bg-slate-100 text-slate-500 border-slate-200";
      default:
        return "bg-slate-100 text-slate-500 border-slate-200";
    }
  };

  // Portfolio icon mapping
  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return (
          <svg className="w-4 h-4 text-rose-500 mr-2 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case "slide":
        return (
          <svg className="w-4 h-4 text-amber-500 mr-2 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21h8M12 17V21M3 4h18M4 4h16v12H4V4z" />
          </svg>
        );
      case "video":
        return (
          <svg className="w-4 h-4 text-sky-500 mr-2 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-emerald-500 mr-2 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        );
    }
  };

  return (
    <div
      className={`glass-panel glass-panel-hover p-6 relative transition-all duration-350 ${
        isSelected 
          ? "border-brand-blue/50 shadow-[0_8px_30px_rgba(49,130,246,0.08)] ring-2 ring-brand-blue/20" 
          : "border-slate-100"
      }`}
    >
      {/* Selection Button/Overlay */}
      <div 
        onClick={() => onSelect(instructor.id)}
        className="absolute top-5 right-5 z-10 cursor-pointer"
      >
        <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
          isSelected 
            ? "bg-brand-blue border-brand-blue text-white shadow-sm" 
            : "border-slate-300 bg-white hover:border-brand-blue/50"
        }`}>
          {isSelected && (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>

      {/* Main Info */}
      <div className="flex items-start gap-4">
        {/* Profile Avatar */}
        <div className="relative w-16 h-16 rounded-full overflow-hidden border border-slate-100 shrink-0 shadow-sm bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={instructor.avatar}
            alt={instructor.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Name, Role and Badges */}
        <div className="flex-1 pr-6">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-outfit font-bold text-lg text-slate-900">{instructor.name}</h3>
            
            {/* Availability Badge */}
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getAvailabilityStyle(instructor.availability)}`}>
              {instructor.availability}
            </span>

            {/* Notion Status Sync */}
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] bg-slate-50 text-slate-600 border border-slate-200/60 font-medium">
              <svg className="w-3 h-3 text-slate-800" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.17 2.23C3 2.23 2 3.23 2 4.4v15.2C2 20.77 3 21.77 4.17 21.77h15.66C21 21.77 22 20.77 22 19.6V4.4c0-1.17-1-2.17-2.17-2.17H4.17zm11.75 3.32h2.23v12.9h-2.23V5.55zm-1.85 0v12.9H11.5L8.43 9.47v8.98H6.2V5.55h2.57l3.07 6.08V5.55h2.23z"/>
              </svg>
              연동 완료
            </span>
          </div>
          <p className="text-slate-500 text-xs font-normal leading-relaxed">{instructor.role}</p>
        </div>
      </div>

      {/* Keywords / Tags */}
      <div className="flex flex-wrap gap-1.5 mt-4">
        {instructor.tags.map((tag) => (
          <span
            key={tag}
            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/30"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Core Numbers (Rate & Rating) */}
      <div className="grid grid-cols-2 gap-4 mt-5 py-3 border-y border-slate-100 bg-slate-50/50 rounded-2xl px-2">
        <div className="text-center border-r border-slate-200/60">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">강사료 (시간당)</p>
          <p className="text-sm font-bold text-slate-800 mt-0.5">
            ₩{instructor.hourlyRate.toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">수강생 평점</p>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            <svg className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-extrabold text-slate-800">{instructor.rating.toFixed(1)}</span>
            <span className="text-[10px] text-slate-400 font-medium">({instructor.reviewCount}건)</span>
          </div>
        </div>
      </div>

      {/* Accordion Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between mt-4 text-xs font-semibold text-brand-blue hover:text-brand-blue-hover transition-colors"
      >
        <span>{isOpen ? "상세 정보 및 자료 닫기" : "상세 정보 및 자료 보기"}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Accordion Content */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          isOpen ? "max-h-96 opacity-100 mt-4 pt-4 border-t border-slate-100" : "max-h-0 opacity-0"
        }`}
      >
        {/* Bio */}
        <div>
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">한 줄 소개</h4>
          <p className="text-slate-700 text-xs leading-relaxed font-normal">{instructor.bio}</p>
        </div>

        {/* Contact Info (For Internal Agency) */}
        <div className="mt-4 grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <div>
            <span className="text-[9px] font-semibold text-slate-400 uppercase">이메일</span>
            <p className="text-slate-700 text-xs truncate font-mono">{instructor.email}</p>
          </div>
          <div>
            <span className="text-[9px] font-semibold text-slate-400 uppercase">연락처</span>
            <p className="text-slate-700 text-xs font-mono">{instructor.phone}</p>
          </div>
        </div>

        {/* Portfolio & Curriculum Materials */}
        <div className="mt-4">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">보유 강의 및 소개 자료</h4>
          <div className="space-y-1.5">
            {instructor.portfolioItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 hover:bg-slate-100/70 transition-colors"
              >
                {getFileIcon(item.type)}
                <span className="truncate flex-1 font-medium">{item.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notion Link */}
        <div className="mt-4 pt-1">
          <a
            href={instructor.notionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200/50 text-xs font-semibold text-slate-700 transition-colors"
          >
            <svg className="w-3.5 h-3.5 text-slate-800" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4.17 2.23C3 2.23 2 3.23 2 4.4v15.2C2 20.77 3 21.77 4.17 21.77h15.66C21 21.77 22 20.77 22 19.6V4.4c0-1.17-1-2.17-2.17-2.17H4.17zm11.75 3.32h2.23v12.9h-2.23V5.55zm-1.85 0v12.9H11.5L8.43 9.47v8.98H6.2V5.55h2.57l3.07 6.08V5.55h2.23z"/>
            </svg>
            노션 프로필 원본 열기
            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

