import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { GA_ID } from "../lib/analytics";
import AnalyticsTracker from "../components/AnalyticsTracker";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "핏픽 (FitPick) | 스마트 에이전시를 위한 강사 큐레이션 플랫폼",
  description: "강사 정보 수집부터 클라이언트 제안서 큐레이션까지 단 30분 만에 해결! 매출 누수를 방지하는 작은 교육 에이전시 및 1인 강사 풀 전용 스마트 솔루션",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}

        {/* GA4 — NEXT_PUBLIC_GA_ID 가 설정된 빌드에서만 로드 */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
            <AnalyticsTracker />
          </>
        )}
      </body>
    </html>
  );
}

