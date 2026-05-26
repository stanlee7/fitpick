"use strict";

import React, { useState } from "react";
import { Instructor, PortfolioItem } from "../data/mockInstructors";

interface InstructorCardProps {
  instructor: Instructor;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (updated: Instructor) => void;
  onDelete: (id: string) => void;
}

export default function InstructorCard({
  instructor,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}: InstructorCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Editable local state fields
  const [editedName, setEditedName] = useState(instructor.name);
  const [editedRole, setEditedRole] = useState(instructor.role);
  const [editedAvailability, setEditedAvailability] = useState(instructor.availability);
  const [editedHourlyRate, setEditedHourlyRate] = useState(instructor.hourlyRate);
  const [editedBio, setEditedBio] = useState(instructor.bio);
  const [editedEmail, setEditedEmail] = useState(instructor.email);
  const [editedPhone, setEditedPhone] = useState(instructor.phone);
  const [editedTagsInput, setEditedTagsInput] = useState(instructor.tags.join(", "));
  
  // New Editable fields
  const [editedRating, setEditedRating] = useState(instructor.rating);
  const [editedReviewCount, setEditedReviewCount] = useState(instructor.reviewCount);
  const [editedPortfolioItems, setEditedPortfolioItems] = useState<PortfolioItem[]>(instructor.portfolioItems);
  const [editedAvatar, setEditedAvatar] = useState(instructor.avatar);

  // Local state for adding portfolio item (link/file)
  const [activeUploadTab, setActiveUploadTab] = useState<"file" | "link">("file");
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // 1. 이미지 파일 검사
      if (!file.type.startsWith("image/")) {
        alert("🖼️ 이미지 파일만 업로드해 주세요!");
        return;
      }

      // 2. 용량 제한 검사 (1.5MB 이하)
      const maxSize = 1.5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert("⚠️ 용량 초과: 프로필 이미지의 용량이 너무 크면 브라우저 저장공간(localStorage) 한계로 인해 저장이 되지 않을 수 있습니다. 1.5MB 이하의 가벼운 이미지를 선택해 주세요!");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setEditedAvatar(event.target.result as string);
          alert("📸 프로필 사진이 성공적으로 변경 준비되었습니다!\n하단의 [💾 수정 완료 (저장)] 버튼을 누르시면 안전하게 로컬 DB에 저장됩니다.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Keep state in sync with updated props (especially when notion sync happens)
  React.useEffect(() => {
    setEditedName(instructor.name);
    setEditedRole(instructor.role);
    setEditedAvailability(instructor.availability);
    setEditedHourlyRate(instructor.hourlyRate);
    setEditedBio(instructor.bio);
    setEditedEmail(instructor.email);
    setEditedPhone(instructor.phone);
    setEditedTagsInput(instructor.tags.join(", "));
    setEditedRating(instructor.rating);
    setEditedReviewCount(instructor.reviewCount);
    setEditedPortfolioItems(instructor.portfolioItems);
    setEditedAvatar(instructor.avatar);
    
    // Clear adding-form local states
    setNewLinkTitle("");
    setNewLinkUrl("");
  }, [instructor]);

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

  const handleFileUpload = (file: File) => {
    const fileName = file.name;
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    
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

    setEditedPortfolioItems((prev) => [...prev, newItem]);
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

    setEditedPortfolioItems((prev) => [...prev, newItem]);
    setNewLinkTitle("");
    setNewLinkUrl("");
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editedName.trim()) {
      alert("강사 이름을 입력해 주세요.");
      return;
    }
    if (!editedRole.trim()) {
      alert("전문 분야를 입력해 주세요.");
      return;
    }

    const updatedTags = editedTagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const updatedInstructor: Instructor = {
      ...instructor,
      name: editedName.trim(),
      role: editedRole.trim(),
      availability: editedAvailability,
      hourlyRate: Number(editedHourlyRate) || 0,
      bio: editedBio.trim(),
      email: editedEmail.trim(),
      phone: editedPhone.trim(),
      tags: updatedTags,
      rating: Number(editedRating) || 0,
      reviewCount: Number(editedReviewCount) || 0,
      portfolioItems: editedPortfolioItems,
      avatar: editedAvatar,
    };

    onUpdate(updatedInstructor);
    setIsEditing(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Rollback changes to match current props
    setEditedName(instructor.name);
    setEditedRole(instructor.role);
    setEditedAvailability(instructor.availability);
    setEditedHourlyRate(instructor.hourlyRate);
    setEditedBio(instructor.bio);
    setEditedEmail(instructor.email);
    setEditedPhone(instructor.phone);
    setEditedTagsInput(instructor.tags.join(", "));
    setEditedRating(instructor.rating);
    setEditedReviewCount(instructor.reviewCount);
    setEditedPortfolioItems(instructor.portfolioItems);
    setEditedAvatar(instructor.avatar);
    setNewLinkTitle("");
    setNewLinkUrl("");
    setIsEditing(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`정말로 ${instructor.name} 강사 프로필을 삭제하시겠습니까?`)) {
      onDelete(instructor.id);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setIsOpen(true); // Open accordion automatically when editing for seamless field edits
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
      {!isEditing && (
        <div 
          onClick={() => onSelect(instructor.id)}
          className="absolute top-5 right-5 z-[2] cursor-pointer"
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
      )}

      {/* Main Info */}
      <div className="flex items-start gap-4">
        {/* Profile Avatar */}
        <div className="relative w-16 h-16 rounded-full overflow-hidden border border-slate-100 shrink-0 shadow-sm bg-slate-50 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={isEditing ? editedAvatar : instructor.avatar}
            alt={instructor.name}
            className="w-full h-full object-cover"
          />
          {isEditing && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                document.getElementById(`avatar-upload-${instructor.id}`)?.click();
              }}
              className="absolute inset-0 bg-black/50 hover:bg-black/60 transition-all flex flex-col items-center justify-center cursor-pointer text-white"
              title="프로필 사진 변경"
            >
              <svg className="w-4 h-4 mb-0.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
              <span className="text-[8px] font-bold tracking-tight">변경</span>
              <input
                id={`avatar-upload-${instructor.id}`}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Name, Role and Badges */}
        <div className="flex-1 pr-6">
          {isEditing ? (
            <div className="space-y-2">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">이름</label>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20"
                  placeholder="강사명"
                  required
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">가용 상태</label>
                <select
                  value={editedAvailability}
                  onChange={(e) => setEditedAvailability(e.target.value as Instructor["availability"])}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20"
                >
                  <option value="즉시 가용">즉시 가용</option>
                  <option value="일정 협의">일정 협의</option>
                  <option value="마감">마감</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">전문 분야 / 타이틀</label>
                <input
                  type="text"
                  value={editedRole}
                  onChange={(e) => setEditedRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-750 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20"
                  placeholder="전문 분야 (역할)"
                  required
                />
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* Keywords / Tags */}
      <div className="mt-4">
        {isEditing ? (
          <div>
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">태그 (쉼표로 구분)</label>
            <input
              type="text"
              value={editedTagsInput}
              onChange={(e) => setEditedTagsInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-750 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20"
              placeholder="예: 피그마, UX/UI, 웹개발"
            />
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {instructor.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/30"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Core Numbers (Rate & Rating) */}
      <div className="grid grid-cols-2 gap-4 mt-5 py-3 border-y border-slate-100 bg-slate-50/50 rounded-2xl px-2">
        <div className="text-center border-r border-slate-200/60 flex flex-col justify-center items-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">강사료 (시간당)</p>
          {isEditing ? (
            <div className="flex items-center gap-1 mt-1 justify-center max-w-[120px]">
              <span className="text-xs font-bold text-slate-500">₩</span>
              <input
                type="number"
                value={editedHourlyRate}
                onChange={(e) => setEditedHourlyRate(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 text-xs text-center font-bold text-slate-800 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20"
              />
            </div>
          ) : (
            <p className="text-sm font-bold text-slate-800 mt-0.5">
              ₩{instructor.hourlyRate.toLocaleString()}
            </p>
          )}
        </div>
        <div className="text-center flex flex-col justify-center items-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">수강생 평점</p>
          {isEditing ? (
            <div className="flex items-center gap-1 mt-1 justify-center max-w-[140px] text-xs">
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={editedRating}
                onChange={(e) => setEditedRating(Number(e.target.value))}
                className="w-12 bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-0.5 text-center font-bold text-slate-800 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20"
                title="평점 (0.0~5.0)"
              />
              <span className="text-slate-400 font-bold">/</span>
              <input
                type="number"
                min="0"
                value={editedReviewCount}
                onChange={(e) => setEditedReviewCount(Number(e.target.value))}
                className="w-14 bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-0.5 text-center font-semibold text-slate-700 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20"
                title="리뷰 수(건)"
              />
              <span className="text-[10px] text-slate-500 font-bold">건</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <svg className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-extrabold text-slate-800">{instructor.rating.toFixed(1)}</span>
              <span className="text-[10px] text-slate-400 font-medium">({instructor.reviewCount}건)</span>
            </div>
          )}
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
          isOpen 
            ? `${isEditing ? "max-h-[1500px]" : "max-h-[500px]"} opacity-100 mt-4 pt-4 border-t border-slate-100` 
            : "max-h-0 opacity-0"
        }`}
      >
        {/* Bio */}
        <div>
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">한 줄 소개</h4>
          {isEditing ? (
            <textarea
              value={editedBio}
              onChange={(e) => setEditedBio(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-750 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 resize-none leading-relaxed"
              rows={3}
              placeholder="강사 소개를 작성해 주세요."
            />
          ) : (
            <p className="text-slate-700 text-xs leading-relaxed font-normal">{instructor.bio}</p>
          )}
        </div>

        {/* Contact Info (For Internal Agency) */}
        <div className="mt-4 grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <div>
            <span className="text-[9px] font-semibold text-slate-400 uppercase">이메일</span>
            {isEditing ? (
              <input
                type="email"
                value={editedEmail}
                onChange={(e) => setEditedEmail(e.target.value)}
                className="w-full mt-0.5 bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-mono text-slate-700 focus:outline-none focus:border-brand-blue"
                placeholder="email@address.com"
              />
            ) : (
              <p className="text-slate-700 text-xs truncate font-mono">{instructor.email}</p>
            )}
          </div>
          <div>
            <span className="text-[9px] font-semibold text-slate-400 uppercase">연락처</span>
            {isEditing ? (
              <input
                type="text"
                value={editedPhone}
                onChange={(e) => setEditedPhone(e.target.value)}
                className="w-full mt-0.5 bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-mono text-slate-700 focus:outline-none focus:border-brand-blue"
                placeholder="010-0000-0000"
              />
            ) : (
              <p className="text-slate-700 text-xs font-mono">{instructor.phone}</p>
            )}
          </div>
        </div>

        {/* Portfolio & Curriculum Materials */}
        {!isEditing ? (
          <div className="mt-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">보유 강의 및 소개 자료</h4>
            <div className="space-y-1.5">
              {instructor.portfolioItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-775 hover:bg-slate-100/70 transition-colors"
                >
                  {getFileIcon(item.type)}
                  <span className="truncate flex-1 font-medium">{item.title}</span>
                </div>
              ))}
              {instructor.portfolioItems.length === 0 && (
                <p className="text-slate-400 text-xs italic text-center py-2 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">등록된 소개 자료가 없습니다.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">보유 강의 및 소개 자료 편집</h4>
            
            {/* 1. Editable portfolio list */}
            <div className="space-y-1.5 mb-4">
              {editedPortfolioItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-775"
                >
                  <div className="flex items-center truncate flex-1 mr-2">
                    {getFileIcon(item.type)}
                    <span className="truncate font-medium">{item.title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditedPortfolioItems((prev) => prev.filter((_, i) => i !== idx));
                    }}
                    className="p-1 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg active:scale-95 transition-all cursor-pointer shrink-0"
                    title="자료 삭제"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
              {editedPortfolioItems.length === 0 && (
                <p className="text-[11px] text-slate-400 italic py-2 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">등록된 소개 자료가 없습니다.</p>
              )}
            </div>

            {/* 2. Add New Portfolio Card */}
            <div className="border border-slate-200/60 rounded-2xl bg-white p-3 space-y-2.5 shadow-sm">
              <div className="flex border-b border-slate-100 pb-1.5 gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveUploadTab("file");
                  }}
                  className={`flex-1 text-center pb-1 text-xs font-bold transition-all cursor-pointer ${
                    activeUploadTab === "file" ? "text-brand-blue border-b-2 border-brand-blue" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  📁 파일 가상 업로드
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveUploadTab("link");
                  }}
                  className={`flex-1 text-center pb-1 text-xs font-bold transition-all cursor-pointer ${
                    activeUploadTab === "link" ? "text-brand-blue border-b-2 border-brand-blue" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  🔗 외부 링크 추가
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
                    document.getElementById(`file-input-${instructor.id}`)?.click();
                  }}
                  className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${
                    isDragOver
                      ? "border-brand-blue bg-blue-50/40"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/30"
                  }`}
                >
                  <input
                    id={`file-input-${instructor.id}`}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      e.stopPropagation();
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                  <svg className="w-7 h-7 text-slate-400 mx-auto mb-1.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                  </svg>
                  <p className="text-[11px] font-bold text-slate-700">이곳에 파일을 드래그하거나 클릭하여 선택</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">PDF, 슬라이드(PPTX), 강연 영상 등 자동 아이콘 매핑</p>
                </div>
              ) : (
                <div className="space-y-2 text-xs" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    placeholder="소개 자료 또는 강의 제목"
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20"
                  />
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="🔗 외부 링크 URL (선택)"
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddLink();
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-brand-blue hover:bg-brand-blue-hover text-white font-bold active:scale-95 transition-all cursor-pointer shrink-0"
                    >
                      등록
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Button Row */}
        <div className="mt-4 pt-1 flex flex-col gap-2">
          {isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                💾 수정 완료 (저장)
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition-all active:scale-95 cursor-pointer"
              >
                취소
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleEditClick}
                className="flex-1 flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                ✏️ 강사 정보 수정
              </button>
              <button
                onClick={handleDelete}
                className="px-3 flex items-center justify-center rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                title="프로필 삭제"
              >
                🗑️ 삭제
              </button>
            </div>
          )}

          {!isEditing && (
            <a
              href={instructor.notionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200/50 text-xs font-semibold text-slate-700 transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-slate-800" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.17 2.23C3 2.23 2 3.23 2 4.4v15.2C2 20.77 3 21.77 4.17 21.77h15.66C21 21.77 22 20.77 22 19.6V4.4c0-1.17-1-2.17-2.17-2.17H4.17zm11.75 3.32h2.23v12.9h-2.23V5.55zm-1.85 0v12.9H11.5L8.43 9.47v8.98H6.2V5.55h2.57l3.07 6.08V5.55h2.23z"/>
              </svg>
              노션 프로필 원본 열기
              <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

