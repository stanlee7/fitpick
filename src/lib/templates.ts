// 제안서 디자인 템플릿 스타일 — 큐레이션 작성기(CurationPanel)와
// 공유 제안 페이지(/proposal)에서 공용으로 사용.

export type TemplateType = "neon" | "minimal" | "notion" | "gold";

export interface TemplateStyle {
  wrapper: string;
  card: string;
  headerBg: string;
  accentColor: string;
  badgeColor: string;
  button: string;
  title: string;
}

export function getTemplateStyles(type: TemplateType): TemplateStyle {
  switch (type) {
    case "neon":
      return {
        wrapper: "bg-[#f8f9fa] text-[#191f28] font-sans",
        card: "bg-white border border-[#3182f6]/20 shadow-[0_16px_40px_rgba(49,130,246,0.06)] rounded-[28px] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(49,130,246,0.1)] hover:scale-[1.01]",
        headerBg: "bg-gradient-to-r from-[#3182f6] via-indigo-500 to-purple-600 text-transparent bg-clip-text font-black",
        accentColor: "text-[#3182f6] font-extrabold tracking-wider",
        badgeColor: "bg-blue-50 text-[#3182f6] border-[#3182f6]/30",
        button: "bg-gradient-to-r from-[#3182f6] to-indigo-600 text-white font-bold hover:shadow-[0_4px_15px_rgba(49,130,246,0.3)] transform hover:-translate-y-0.5 active:translate-y-0 transition-all",
        title: "✨ Neon Light 테마",
      };
    case "minimal":
      return {
        wrapper: "bg-[#f4f6f8] text-[#191f28] font-sans",
        card: "bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.015)] rounded-[24px] transition-all duration-300 hover:shadow-[0_12px_30px_rgba(0,0,0,0.03)] hover:scale-[1.01]",
        headerBg: "text-slate-900 font-extrabold tracking-tight",
        accentColor: "text-slate-500 font-semibold uppercase tracking-widest",
        badgeColor: "bg-slate-50 text-slate-600 border-slate-200/60",
        button: "bg-[#191f28] hover:bg-[#191f28]/95 text-white font-semibold transform hover:-translate-y-0.5 active:translate-y-0 transition-all",
        title: "🕊️ Sleek Minimal 테마",
      };
    case "notion":
      return {
        wrapper: "bg-white text-[#191f28] font-sans",
        card: "bg-white border-2 border-slate-200 rounded-2xl shadow-none hover:bg-slate-50/10 transition-colors",
        headerBg: "text-slate-900 font-serif border-b-2 border-slate-200 pb-4 font-black",
        accentColor: "text-slate-700 font-mono font-bold",
        badgeColor: "bg-slate-100 text-slate-750 border-slate-350 rounded-md font-mono",
        button: "bg-white border-2 border-slate-300 text-slate-800 font-bold hover:bg-slate-50 active:bg-slate-100 transition-colors",
        title: "📓 Notion 표준 테마",
      };
    case "gold":
      return {
        wrapper: "bg-[#faf8f5] text-[#191f28] font-sans",
        card: "bg-white border border-amber-500/20 shadow-[0_16px_40px_rgba(217,119,6,0.04)] rounded-[30px] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(217,119,6,0.08)] hover:scale-[1.01]",
        headerBg: "bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 text-transparent bg-clip-text font-black",
        accentColor: "text-amber-600 font-extrabold tracking-wider",
        badgeColor: "bg-amber-50 text-amber-650 border-amber-200/50",
        button: "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold hover:shadow-[0_4px_15px_rgba(217,119,6,0.25)] transform hover:-translate-y-0.5 active:translate-y-0 transition-all",
        title: "👑 Premium Gold Light 테마",
      };
  }
}
