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

// 키보드 등장/해제 시 fixed 요소(네비바, 바텀시트) 위치 보정
// resize만 사용: 콘텐츠 영역이 키보드 위까지만 차지하므로
// iOS가 visualViewport를 scroll시킬 필요가 없어 scroll 이벤트 불필요
function updateViewportOffset() {
  const vv = window.visualViewport;
  if (!vv) return;
  const offsetTop = vv.offsetTop;
  const offsetBottom = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
  document.documentElement.style.setProperty('--vv-offset-top', `${offsetTop}px`);
  document.documentElement.style.setProperty('--vv-offset-bottom', `${offsetBottom}px`);
  // 팝업이 키보드(악세사리 포함) 위에 정확히 뜨도록 vv.height 직접 노출
  document.documentElement.style.setProperty('--vv-height', `${vv.height}px`);
  // 키패드 열림 여부를 body 클래스로 노출 → CSS에서 탭바 숨김 처리
  document.body.classList.toggle('keyboard-open', offsetBottom > 0);
}
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', updateViewportOffset);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
