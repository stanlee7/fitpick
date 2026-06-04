// FitPick 측정(Analytics) 유틸 — GA4 이벤트 전송 + 환경변수 노출
//
// - NEXT_PUBLIC_GA_ID       : GA4 측정 ID (G-XXXXXXXXXX). 없으면 추적 비활성.
// - NEXT_PUBLIC_FEEDBACK_URL: 구글폼 등 피드백 URL. 없으면 피드백 버튼 숨김.
//
// NEXT_PUBLIC_ 접두 변수는 빌드 시 정적으로 치환됩니다(정적 export OK).

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
export const FEEDBACK_URL = process.env.NEXT_PUBLIC_FEEDBACK_URL;

type EventParams = Record<string, string | number | boolean | undefined>;

/**
 * GA4로 커스텀 이벤트를 보냅니다. gtag가 아직 안 떴거나 GA_ID가 없으면 조용히 무시.
 */
export function track(event: string, params?: EventParams): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", event, params ?? {});
}

/**
 * URL의 유입 채널 꼬리표(?from= 또는 utm_source)를 읽어 반환.
 * 한 번 들어온 값은 localStorage에 기억하여 재방문/내부 이동에도 유지.
 */
export function resolveSource(): string {
  if (typeof window === "undefined") return "direct";
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("from") || params.get("utm_source");
    if (fromUrl) {
      localStorage.setItem("fitpick_source", fromUrl);
      return fromUrl;
    }
    return localStorage.getItem("fitpick_source") || "direct";
  } catch {
    return "direct";
  }
}
