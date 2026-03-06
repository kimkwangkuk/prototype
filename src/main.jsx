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
  window.visualViewport.addEventListener('scroll', updateViewportOffset);
}

// iOS Safari는 overflow:hidden 상태에서도 인풋 포커스 시 window를 강제 스크롤함.
// vv.offsetTop이 커져 앱 레이아웃 전체가 위로 밀리는 현상 → 즉시 (0,0)으로 복구.
window.addEventListener('scroll', () => {
  if (window.scrollX !== 0 || window.scrollY !== 0) {
    window.scrollTo(0, 0);
  }
}, { passive: true });

// 인풋 포커스 즉시 탭바 숨김 + 키보드 열린 후 가시 영역 중앙으로 스크롤
document.addEventListener('focusin', (e) => {
  const el = e.target;
  if (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') return;
  // inputMode="none" 또는 readOnly 인풋은 OS 키보드가 뜨지 않으므로 keyboard-open 제외
  if (el.inputMode === 'none' || el.readOnly) return;
  document.body.classList.add('keyboard-open');

  // 바텀시트 인풋은 시트 자체가 키보드 위에 위치하므로 스크롤 불필요
  if (el.closest('.bottom-sheet')) return;

  // 키보드 애니메이션(~300ms) 완료 후 포커스 위치 계산
  setTimeout(() => {
    const vv = window.visualViewport;
    if (!vv || !document.contains(el)) return;
    const keyboardHeight = window.innerHeight - vv.height;
    if (keyboardHeight < 100) return; // 키보드가 충분히 열리지 않았으면 스킵

    // 가시 영역: 헤더 하단 ~ 키보드 상단
    const headerBottom = document.querySelector('.header')?.getBoundingClientRect().bottom ?? 0;
    const visibleCenter = headerBottom + (vv.height - headerBottom) / 2;

    const rect = el.getBoundingClientRect();
    const inputCenter = rect.top + rect.height / 2;
    const delta = inputCenter - visibleCenter;
    if (Math.abs(delta) < 20) return;

    // 가장 바깥쪽 스크롤 가능한 조상으로 스크롤 (내부 스크롤 컨테이너 전체를 이동)
    let outermost = null;
    let cur = el.parentElement;
    while (cur && cur !== document.body) {
      const oy = window.getComputedStyle(cur).overflowY;
      if (oy === 'auto' || oy === 'scroll') outermost = cur;
      cur = cur.parentElement;
    }
    outermost?.scrollBy({ top: delta, behavior: 'smooth' });
  }, 350);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
