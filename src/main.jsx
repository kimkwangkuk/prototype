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
// rAF로 프레임당 1회만 업데이트 → scroll 이벤트가 연속 발생해도 CSS 변수 갱신은 한 번만
let vvTicking = false;
function updateViewportOffset() {
  if (vvTicking) return;
  vvTicking = true;
  requestAnimationFrame(() => {
    const vv = window.visualViewport;
    if (vv) {
      const offsetTop = vv.offsetTop;
      const offsetBottom = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      document.documentElement.style.setProperty('--vv-offset-top', `${offsetTop}px`);
      document.documentElement.style.setProperty('--vv-offset-bottom', `${offsetBottom}px`);
    }
    vvTicking = false;
  });
}
if (window.visualViewport) {
  window.visualViewport.addEventListener('scroll', updateViewportOffset);
  window.visualViewport.addEventListener('resize', updateViewportOffset);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
