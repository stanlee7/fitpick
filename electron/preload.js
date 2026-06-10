// 핏픽(FitPick) Electron Preload Script
// contextIsolation + sandbox 하에서 렌더러에 안전한 데스크톱 전용 API만 노출한다.

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("fitpickDesktop", {
  isDesktop: true,
  appVersion: "0.4.0",
  // 노션 API 직접 연동(데스크톱 한정 — 메인 프로세스가 CORS 없이 호출)
  // opts: { token, databaseId } → { headers: string[], rows: string[][] }
  notionQuery: (opts) => ipcRenderer.invoke("notion:query", opts),
});
