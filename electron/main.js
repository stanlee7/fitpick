const { app, BrowserWindow } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 920,
    minWidth: 1024,
    minHeight: 768,
    title: "핏픽 (FitPick) - 스마트 에이전시 큐레이션 엔진",
    icon: path.join(__dirname, "../public/favicon.ico"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, "preload.js"), // 필요 시 확장 가능
    },
    // macOS의 둥근 모서리와 다크모드 윈도우 지원
    backgroundColor: "#020617", 
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
