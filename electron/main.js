const { app, BrowserWindow, shell } = require("electron");
const path = require("path");

let mainWindow;

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
