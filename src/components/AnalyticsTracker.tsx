"use client";

import { useEffect } from "react";
import { track, resolveSource } from "../lib/analytics";

/**
 * 방문 시 유입 채널(?from=/utm_source)을 한 번 기록합니다.
 * 화면에는 아무것도 렌더링하지 않음. GA4 스크립트는 layout.tsx에서 로드됩니다.
 */
export default function AnalyticsTracker() {
  useEffect(() => {
    const source = resolveSource();
    // gtag 로드가 약간 늦을 수 있어 다음 틱에 전송
    const id = window.setTimeout(() => {
      track("visit_source", { source });
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  return null;
}
