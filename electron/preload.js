// 핏픽(FitPick) Electron Preload Script
// 현재는 온디바이스 로컬 브라우저 보안 규격을 전면 적용하므로 샌드박스로 가동합니다.
// 향후 PC 네이티브 파일 탐색기 연동이나 시스템 다이얼로그 호출 필요 시 이곳에 노출할 API를 증설합니다.

const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("fitpickDesktop", {
  isDesktop: true,
  appVersion: "0.3.0",
});
