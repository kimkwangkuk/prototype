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
function updateViewportOffset() {
  const vv = window.visualViewport;
  if (!vv) return;
  // 실제 키보드 높이 = window.innerHeight - vv.height
  // vv.offsetTop을 빼지 않음: body { overflow: hidden }이므로 레이아웃 스크롤이
  // 발생하지 않는데도 iOS가 vv.offsetTop을 임의로 증가시키는 경우가 있어
  // 빼면 offsetBottom이 과소계산(0이 되기도 함) → 바텀시트가 키보드보다 낮게 위치하거나
  // keyboard-open이 잘못 제거되어 탭바가 노출되는 문제 발생
  const offsetBottom = Math.max(0, window.innerHeight - vv.height);
  document.documentElement.style.setProperty('--vv-offset-top', `${vv.offsetTop}px`);
  document.documentElement.style.setProperty('--vv-offset-bottom', `${offsetBottom}px`);
  document.documentElement.style.setProperty('--vv-height', `${vv.height}px`);
  // 키보드가 완전히 닫혔을 때만 keyboard-open 제거
  // 기존 offsetBottom === 0 조건은 vv.offsetTop이 크면 키보드가 열려 있어도
  // 0이 되어 keyboard-open을 잘못 제거하는 문제가 있었음
  if (vv.height >= window.innerHeight) {
    document.body.classList.remove('keyboard-open');
  }
}
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', updateViewportOffset);
}

// 인풋 포커스 즉시 탭바 숨김 (resize 이벤트보다 빠르게 반응)
document.addEventListener('focusin', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    document.body.classList.add('keyboard-open');
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
