import { avatarFor } from "../lib/avatar";

export interface PortfolioItem {
  title: string;
  type: "slide" | "pdf" | "link" | "video";
}

export interface Testimonial {
  quote: string;
  author: string; // 예: "삼성전자 디자인팀 이OO 책임"
}

export interface Instructor {
  id: string;
  name: string;
  role: string;
  avatar: string;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  availability: "즉시 가용" | "일정 협의" | "마감";
  tags: string[];
  bio: string;
  notionUrl: string;
  portfolioItems: PortfolioItem[];
  email: string;
  phone: string;

  // ── 신뢰신호(Trust signals) ─────────────────────────────
  // 기업담당자 강사선정 컨조인트 연구(KCI 2020) 검증 우선순위:
  // 강의경력(#1) > 기업재직경력(#2) > 강사료 > 성별.
  // 제안서가 "윗선 보고 시 리스크 없는 선택"임을 증명하는 핵심 근거.
  yearsTeaching?: number; // 강의 경력(연차) — 검증 #1
  sessionsCount?: number; // 누적 강의 횟수
  traineesCount?: number; // 누적 교육 인원
  careerHistory?: string[]; // 기업재직경력 — 검증 #2 (예: ["前 삼성전자 책임"])
  clientCompanies?: string[]; // 강의 진행 기업(고객사) — 사회적 증거
  testimonials?: Testimonial[]; // 실제 수강 후기
  sampleVideoUrl?: string; // 강의 샘플 영상 링크
}

export const mockInstructors: Instructor[] = [
  {
    id: "inst-1",
    name: "김민우",
    role: "UX/UI 서비스 디자인 & 피그마 실무 마스터",
    avatar: avatarFor("김민우"),
    hourlyRate: 150000,
    rating: 4.9,
    reviewCount: 24,
    availability: "즉시 가용",
    tags: ["UX/UI", "피그마", "서비스기획", "디자이너출신"],
    bio: "대기업 및 스타트업에서 8년간 서비스 디자인을 리드해 왔습니다. 단순 툴 사용법이 아닌 비즈니스 가치를 높이는 실무 디자인 설계 및 워크숍 강의를 제공합니다.",
    notionUrl: "https://notion.so/minwoo-design-profile",
    email: "minwoo.design@fitpick.co.kr",
    phone: "010-1234-5678",
    portfolioItems: [
      { title: "2026 UX/UI 실무 디자인 강의 커리큘럼.pdf", type: "pdf" },
      { title: "피그마 활용 프로토타이핑 가이드북.slide", type: "slide" },
      { title: "삼성전자 신입 디자이너 대상 강의 포트폴리오", type: "link" }
    ],
    yearsTeaching: 8,
    sessionsCount: 210,
    traineesCount: 6500,
    careerHistory: ["前 삼성전자 책임 디자이너", "前 우아한형제들 프로덕트 디자이너"],
    clientCompanies: ["삼성전자", "우아한형제들", "당근마켓", "신한카드"],
    testimonials: [
      {
        quote: "툴 교육을 넘어 실제 팀의 협업 프로세스 자체가 바뀌었습니다. 강의 후 디자인 QA 시간이 눈에 띄게 줄었어요.",
        author: "삼성전자 디자인팀 이OO 책임"
      }
    ],
    sampleVideoUrl: "https://youtu.be/dQw4w9WgXcQ"
  },
  {
    id: "inst-2",
    name: "이지혜",
    role: "Next.js & React 모던 프론트엔드 실무 개발",
    avatar: avatarFor("이지혜"),
    hourlyRate: 180000,
    rating: 4.8,
    reviewCount: 18,
    availability: "일정 협의",
    tags: ["React", "Next.js", "TypeScript", "웹개발"],
    bio: "현업 프론트엔드 테크 리드로 재직 중이며, 복잡한 웹 애플리케이션 아키텍처와 성능 최적화 강의에 특화되어 있습니다. 비개발자도 이해하기 쉬운 코딩 워크숍을 설계합니다.",
    notionUrl: "https://notion.so/jihye-dev-portfolio",
    email: "jihye.dev@fitpick.co.kr",
    phone: "010-8765-4321",
    portfolioItems: [
      { title: "초급자를 위한 React 실무 입문.pdf", type: "pdf" },
      { title: "Next.js 15 App Router 실무 마스터 클래스.slide", type: "slide" }
    ],
    yearsTeaching: 6,
    sessionsCount: 140,
    traineesCount: 3800,
    careerHistory: ["現 토스 프론트엔드 테크리드", "前 네이버 FE 개발자"],
    clientCompanies: ["토스", "네이버", "카카오페이", "LG CNS"],
    testimonials: [
      {
        quote: "비개발 직군 임직원도 끝까지 따라올 수 있는 난이도 설계가 인상적이었습니다. 현업 적용 사례가 풍부했어요.",
        author: "카카오페이 교육담당 박OO 매니저"
      }
    ],
    sampleVideoUrl: "https://youtu.be/dQw4w9WgXcQ"
  },
  {
    id: "inst-3",
    name: "박태영",
    role: "스타트업 스케일업 & B2B 비즈니스 세일즈",
    avatar: avatarFor("박태영"),
    hourlyRate: 200000,
    rating: 5.0,
    reviewCount: 32,
    availability: "즉시 가용",
    tags: ["스타트업", "B2B세일즈", "비즈니스전략", "스케일업"],
    bio: "스타트업 공동창업 및 스케일업 경험을 보유한 B2B 세일즈 전문가입니다. 실제 계약 전환을 이끄는 영업 파이프라인 설계 및 피칭 노하우를 명쾌하게 전달합니다.",
    notionUrl: "https://notion.so/taeyoung-biz-hub",
    email: "taeyoung.biz@fitpick.co.kr",
    phone: "010-5555-9999",
    portfolioItems: [
      { title: "B2B 제안서 작성 공식 및 템플릿 패키지.slide", type: "slide" },
      { title: "B2B 세일즈 강연 소개 영상.video", type: "video" }
    ],
    yearsTeaching: 10,
    sessionsCount: 320,
    traineesCount: 9000,
    careerHistory: ["前 스타트업 공동창업 / COO", "前 오라클 B2B 세일즈"],
    clientCompanies: ["현대자동차", "SK텔레콤", "배달의민족", "롯데벤처스"],
    testimonials: [
      {
        quote: "이론이 아니라 실제 영업 파이프라인을 그 자리에서 같이 뜯어봤습니다. 분기 만에 전환율이 올랐어요.",
        author: "SK텔레콤 영업기획팀 정OO 팀장"
      }
    ],
    sampleVideoUrl: "https://youtu.be/dQw4w9WgXcQ"
  },
  {
    id: "inst-4",
    name: "최윤아",
    role: "데이터 기반 그로스 마케팅 & 퍼포먼스 전략",
    avatar: avatarFor("최윤아"),
    hourlyRate: 160000,
    rating: 4.7,
    reviewCount: 15,
    availability: "마감",
    tags: ["그로스마케팅", "GA4", "퍼포먼스광고", "데이터분석"],
    bio: "무작정 쓰는 마케팅 예산은 가라! GA4 데이터 분석에 근거한 정량적 마케팅 최적화 이론과 구글 애드 실무 세팅 실습 과정을 운영합니다.",
    notionUrl: "https://notion.so/yoona-growth-marketing",
    email: "yoona.growth@fitpick.co.kr",
    phone: "010-2222-3333",
    portfolioItems: [
      { title: "GA4 데이터 수집 및 분석 가이드라인.pdf", type: "pdf" },
      { title: "성공하는 그로스 마케팅 워크북.slide", type: "slide" }
    ],
    yearsTeaching: 5,
    sessionsCount: 90,
    traineesCount: 2400,
    careerHistory: ["前 쿠팡 그로스 마케터", "前 구글 애드 공식 파트너 컨설턴트"],
    clientCompanies: ["쿠팡", "무신사", "마켓컬리", "야놀자"],
    testimonials: [
      {
        quote: "감으로 쓰던 광고 예산을 데이터로 검증해 집행하게 됐습니다. 실습 위주라 바로 적용 가능했어요.",
        author: "무신사 퍼포먼스마케팅팀 최OO"
      }
    ],
    sampleVideoUrl: "https://youtu.be/dQw4w9WgXcQ"
  }
];
