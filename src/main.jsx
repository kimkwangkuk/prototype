import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// 키보드가 열려도 앱 레이아웃 높이가 변하지 않도록 고정
// orientation 변경 시에만 업데이트
function setAppHeight() {
  document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
}
setAppHeight();
window.addEventListener('orientationchange', () => setTimeout(setAppHeight, 150));

// 키보드 등장 시 fixed 요소(네비바, 바텀시트)가 밀리지 않도록 visualViewport 보정
function updateViewportOffset() {
  const vv = window.visualViewport;
  if (!vv) return;
  const offsetTop = vv.offsetTop;
  const offsetBottom = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
  document.documentElement.style.setProperty('--vv-offset-top', `${offsetTop}px`);
  document.documentElement.style.setProperty('--vv-offset-bottom', `${offsetBottom}px`);
}
if (window.visualViewport) {
  // scroll 이벤트 제거: 스크롤마다 CSS 변수 업데이트 시 fixed 요소와 충돌 → 더럭거림
  // resize만 사용: 키보드 열기/닫기 시에만 업데이트, 스크롤 중엔 iOS 네이티브 동작에 위임
  window.visualViewport.addEventListener('resize', updateViewportOffset);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
