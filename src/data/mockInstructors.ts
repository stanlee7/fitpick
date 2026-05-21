export interface PortfolioItem {
  title: string;
  type: "slide" | "pdf" | "link" | "video";
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
}

export const mockInstructors: Instructor[] = [
  {
    id: "inst-1",
    name: "김민우",
    role: "UX/UI 서비스 디자인 & 피그마 실무 마스터",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
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
    ]
  },
  {
    id: "inst-2",
    name: "이지혜",
    role: "Next.js & React 모던 프론트엔드 실무 개발",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
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
    ]
  },
  {
    id: "inst-3",
    name: "박태영",
    role: "스타트업 스케일업 & B2B 비즈니스 세일즈",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
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
    ]
  },
  {
    id: "inst-4",
    name: "최윤아",
    role: "데이터 기반 그로스 마케팅 & 퍼포먼스 전략",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=256&q=80",
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
    ]
  }
];
