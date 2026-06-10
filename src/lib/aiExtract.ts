// 이력서/소개서 자유 텍스트 → 구조화된 강사 프로필.
// 브라우저에서 Anthropic API를 직접 호출(서버 없음). 사용자 본인 키를 로컬에 저장하고
// anthropic-dangerous-direct-browser-access 헤더로 직접 호출. 키가 없으면 휴리스틱 폴백.

// 모델: 이력서 구조화 파싱은 비용/속도 균형이 좋은 Sonnet으로 충분.
// 최고 정확도가 필요하면 "claude-opus-4-8", 최저비용은 "claude-haiku-4-5"로 교체.
const MODEL = "claude-sonnet-4-6";
const API_URL = "https://api.anthropic.com/v1/messages";
const KEY_STORAGE = "fitpick_anthropic_key";

export interface ExtractedProfile {
  name?: string;
  role?: string;
  bio?: string;
  yearsTeaching?: number;
  sessionsCount?: number;
  traineesCount?: number;
  careerHistory?: string[];
  clientCompanies?: string[];
  testimonials?: { quote: string; author: string }[];
  tags?: string[];
}

// ── API 키 로컬 저장 ─────────────────────────────
export function getApiKey(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(KEY_STORAGE) || "";
  } catch {
    return "";
  }
}
export function setApiKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    if (key.trim()) localStorage.setItem(KEY_STORAGE, key.trim());
    else localStorage.removeItem(KEY_STORAGE);
  } catch {
    /* ignore */
  }
}
export function hasApiKey(): boolean {
  return !!getApiKey();
}

// ── 구조화 출력용 tool 스키마 (강제 tool_choice) ─────────────────────────────
const PROFILE_TOOL = {
  name: "save_instructor_profile",
  description: "이력서/소개서에서 추출한 강사 프로필 정보를 구조화하여 저장한다.",
  input_schema: {
    type: "object",
    properties: {
      name: { type: "string", description: "강사 이름" },
      role: { type: "string", description: "전문 분야 / 한 줄 타이틀 (예: 'UX/UI 서비스 디자인 강사')" },
      bio: { type: "string", description: "1~2문장 자기소개 요약" },
      yearsTeaching: { type: "integer", description: "강의 경력 연차(숫자만). 불명확하면 생략" },
      sessionsCount: { type: "integer", description: "누적 강의 횟수(숫자만). 불명확하면 생략" },
      traineesCount: { type: "integer", description: "누적 교육 인원(숫자만). 불명확하면 생략" },
      careerHistory: {
        type: "array",
        items: { type: "string" },
        description: "기업 재직/실무 경력. 짧은 표현으로 (예: '前 삼성전자 책임', '現 토스 PO')",
      },
      clientCompanies: {
        type: "array",
        items: { type: "string" },
        description: "강의를 진행한 고객사/기업명 목록",
      },
      testimonials: {
        type: "array",
        items: {
          type: "object",
          properties: {
            quote: { type: "string", description: "후기 내용" },
            author: { type: "string", description: "후기 작성자/소속" },
          },
          required: ["quote", "author"],
        },
        description: "수강 후기. 본문에 있을 때만",
      },
      tags: {
        type: "array",
        items: { type: "string" },
        description: "전문 분야 핵심 키워드 3~6개 (예: 'UX/UI', '피그마')",
      },
    },
    required: [],
  },
} as const;

const SYSTEM_PROMPT = `당신은 한국어 강사 이력서·소개서에서 핵심 정보를 정확히 뽑아 구조화하는 전문가입니다.
입력으로 자유 형식의 이력서/강사 소개서 텍스트가 주어집니다. 반드시 save_instructor_profile 도구를 호출해 결과를 반환하세요.

규칙:
- 텍스트에 실제로 있는 정보만 채웁니다. 추측하거나 지어내지 마세요. 정보가 없는 필드는 생략합니다.
- yearsTeaching/sessionsCount/traineesCount는 숫자만(예: "8년차"→8, "약 6,500명"→6500). 명확한 근거가 없으면 생략.
- careerHistory는 재직 경력을 짧게(예: "前 삼성전자 책임 디자이너"). 학력은 제외.
- clientCompanies는 실제 강의/프로젝트를 진행한 기업명만.
- testimonials는 인용된 후기가 있을 때만. 없으면 생략.
- role은 강사의 전문 분야를 한 줄로. bio는 1~2문장 요약.
- tags는 분야 키워드 3~6개.`;

// ── Claude 호출 (fetch, 강제 tool use, 프롬프트 캐싱) ─────────────────────────────
async function extractWithClaude(text: string, apiKey: string): Promise<ExtractedProfile> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1500,
      // 안정적인 프리픽스(system+tool)에 캐시 브레이크포인트 → 여러 이력서 연속 파싱 시 비용 절감.
      // 렌더 순서가 tools → system 이라, system 블록의 cache_control 이 tools+system 을 함께 캐시.
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      tools: [PROFILE_TOOL],
      tool_choice: { type: "tool", name: "save_instructor_profile" },
      messages: [
        {
          role: "user",
          content: `다음 강사 이력서/소개서에서 정보를 추출해 주세요.\n\n---\n${text.slice(0, 24000)}\n---`,
        },
      ],
    }),
  });

  if (!res.ok) {
    let detail = "";
    try {
      const j = await res.json();
      detail = j?.error?.message || "";
    } catch {
      /* ignore */
    }
    const err = new Error(detail || `Anthropic API ${res.status}`);
    (err as { status?: number }).status = res.status;
    throw err;
  }

  const data = await res.json();
  const toolBlock = Array.isArray(data?.content)
    ? data.content.find((b: { type?: string }) => b.type === "tool_use")
    : null;
  if (!toolBlock?.input) throw new Error("구조화 결과를 받지 못했습니다.");
  return toolBlock.input as ExtractedProfile;
}

// ── 휴리스틱 폴백 (키 없을 때) ─────────────────────────────
function extractHeuristic(text: string): ExtractedProfile {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  // 첫 줄을 이름 후보로 (너무 길면 제외)
  const nameGuess = lines[0] && lines[0].length <= 12 ? lines[0] : undefined;
  return {
    name: nameGuess,
    bio: text.trim().slice(0, 400),
    tags: [],
  };
}

export interface ExtractResult {
  profile: ExtractedProfile;
  usedAi: boolean;
}

/** 텍스트 → 구조화 프로필. 키 있으면 Claude, 없으면 휴리스틱. */
export async function extractProfile(text: string): Promise<ExtractResult> {
  const key = getApiKey();
  if (!key) {
    return { profile: extractHeuristic(text), usedAi: false };
  }
  const profile = await extractWithClaude(text, key);
  return { profile, usedAi: true };
}
