const { app, BrowserWindow, shell, ipcMain } = require("electron");
const path = require("path");

let mainWindow;

// ───────── 노션 API 직접 연동 (메인 프로세스 = CORS 없음) ─────────
const NOTION_VERSION = "2022-06-28";

async function notionApi(token, method, pathStr, body) {
  const res = await fetch(`https://api.notion.com/v1${pathStr}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data && data.message ? data.message : `Notion API ${res.status}`);
  }
  return data;
}

// 노션 속성 값 → 평문 문자열
function notionValue(prop) {
  if (!prop || !prop.type) return "";
  const t = prop.type;
  const v = prop[t];
  switch (t) {
    case "title":
    case "rich_text":
      return (v || []).map((x) => x.plain_text || "").join("");
    case "number":
      return v == null ? "" : String(v);
    case "select":
    case "status":
      return v && v.name ? v.name : "";
    case "multi_select":
      return (v || []).map((x) => x.name).join(", ");
    case "people":
      return (v || []).map((x) => x.name || "").join(", ");
    case "files":
      return (v || []).map((x) => x.name || "").join(", ");
    case "email":
    case "phone_number":
    case "url":
      return v || "";
    case "checkbox":
      return v ? "Y" : "";
    case "date":
      return v && v.start ? v.start : "";
    case "formula":
      return v ? notionValue({ type: v.type, [v.type]: v[v.type] }) : "";
    case "rollup":
      if (v && v.type === "array") return (v.array || []).map((a) => notionValue(a)).join(", ");
      return v && v[v.type] != null ? String(v[v.type]) : "";
    default:
      return "";
  }
}

async function notionQueryDatabase(token, databaseId) {
  const db = await notionApi(token, "GET", `/databases/${databaseId}`);
  const headers = Object.keys(db.properties || {});
  const rows = [];
  let cursor;
  do {
    const body = cursor ? { page_size: 100, start_cursor: cursor } : { page_size: 100 };
    const page = await notionApi(token, "POST", `/databases/${databaseId}/query`, body);
    for (const result of page.results || []) {
      const props = result.properties || {};
      rows.push(headers.map((h) => notionValue(props[h])));
    }
    cursor = page.has_more ? page.next_cursor : undefined;
  } while (cursor);
  return { headers, rows };
}

ipcMain.handle("notion:query", async (_e, opts) => {
  const token = opts && opts.token;
  const databaseId = opts && opts.databaseId;
  if (!token || !databaseId) throw new Error("토큰과 데이터베이스 ID가 필요합니다.");
  return await notionQueryDatabase(token, databaseId);
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 920,
    minWidth: 1024,
    minHeight: 768,
    title: "핏픽 (FitPick) - 스마트 에이전시 큐레이션 엔진",
    // public/은 패키지에 포함되지 않으므로, Next가 out/으로 복사한 favicon을 사용
    icon: path.join(__dirname, "../out/favicon.ico"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, "preload.js"), // 필요 시 확장 가능
    },
    // macOS의 둥근 모서리와 다크모드 윈도우 지원
    backgroundColor: "#020617",
  });

  // 외부 링크(target="_blank" / window.open)는 앱 안이 아니라 시스템 기본 브라우저로 열기
  // (노션 원본 열기, 피드백 폼, 포트폴리오 외부 링크 등)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url) || url.startsWith("mailto:")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  // 앱 내부 문서에서 외부 사이트로의 직접 이동도 시스템 브라우저로 위임 (file:// 내부 이동은 허용)
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith("file://")) {
      event.preventDefault();
      if (/^https?:\/\//.test(url)) {
        shell.openExternal(url);
      }
    }
  });

  // 개발자 도구 및 상단 메뉴바 설정
  const isDev = process.env.NODE_ENV === "development";
  
  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    // 빌드된 정적 out 리소스를 로드
    mainWindow.loadFile(path.join(__dirname, "../out/index.html"));
    mainWindow.setMenuBarVisibility(false); // 상단 기본 메뉴바 숨겨서 모던하고 매끈하게 연출
  }

  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", function () {
  // macOS의 일반적인 생명주기 관리
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});
