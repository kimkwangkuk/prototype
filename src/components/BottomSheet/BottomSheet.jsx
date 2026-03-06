import { useState, useEffect, useRef } from 'react';
import useTodoStore from '../../store/useTodoStore';
import BottomSheetB from './BottomSheetB';
import DetailSheet from './DetailSheet';
import StatusSection from './StatusSection';

export default function BottomSheet() {
  const visible = useTodoStore(state => state.bottomSheetVisible);
  const mode = useTodoStore(state => state.bottomSheetMode);
  const originalData = useTodoStore(state => state.originalBottomSheetData);
  const editingTodoId = useTodoStore(state => state.editingTodoId);
  const closeBottomSheet = useTodoStore(state => state.closeBottomSheet);
  const closeBottomSheetWithSave = useTodoStore(state => state.closeBottomSheetWithSave);
  const [animate, setAnimate] = useState(false);
  const [activePopup, setActivePopup] = useState(null);

  // 그래버 드래그 상태
  const [dragY, setDragY] = useState(0);
  const isDraggingRef = useRef(false);
  const touchStartYRef = useRef(0);

  // 오버레이 터치 처리 (스크롤 통과 + 탭 감지)
  const overlayRef = useRef(null);
  const overlayTouchRef = useRef(null);
  const handleOverlayClickRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setTimeout(() => setAnimate(true), 10);

      const isNewTodo = originalData && !originalData.text.trim();
      if (editingTodoId && mode !== 'status-only' && isNewTodo) {
        setTimeout(() => {
          const todoItem = document.querySelector(`[data-todo-id="${editingTodoId}"]`);
          if (todoItem) {
            const rect = todoItem.getBoundingClientRect();
            const offset = window.innerHeight * 0.4;
            const contentEl = document.getElementById('content');
            if (contentEl && rect.top > offset) {
              contentEl.scrollBy({ top: rect.top - offset, behavior: 'smooth' });
            }
          }
        }, 150);
      }
    } else {
      setAnimate(false);
      setDragY(0);
    }
  }, [visible]);

  // 바텀시트가 닫힐 때 팝업 상태도 초기화
  useEffect(() => {
    if (!visible) setActivePopup(null);
  }, [visible]);

  // 오버레이 non-passive 터치 이벤트: 스크롤은 콘텐츠로 전달, 탭만 닫기
  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;
    const findScrollTarget = (x, y) => {
      // 일뷰: #content
      const contentEl = document.getElementById('content');
      if (contentEl) return contentEl;
      // 주뷰: 터치 위치 아래의 .week-day-col-todos
      const cols = document.querySelectorAll('.week-day-col-todos');
      for (const col of cols) {
        const rect = col.getBoundingClientRect();
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
          return col;
        }
      }
      return null;
    };
    const onTouchStart = (e) => {
      e.preventDefault(); // iOS가 touchstart 시점에 focused input을 blur하는 것 방지
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      overlayTouchRef.current = { startY: y, lastY: y, moved: false, scrollTarget: findScrollTarget(x, y) };
    };
    const onTouchMove = (e) => {
      if (!overlayTouchRef.current) return;
      const dy = e.touches[0].clientY - overlayTouchRef.current.lastY;
      if (Math.abs(e.touches[0].clientY - overlayTouchRef.current.startY) > 5) {
        overlayTouchRef.current.moved = true;
      }
      const { scrollTarget } = overlayTouchRef.current;
      if (scrollTarget) scrollTarget.scrollTop -= dy;
      overlayTouchRef.current.lastY = e.touches[0].clientY;
      e.preventDefault();
    };
    const onTouchEnd = (e) => {
      if (overlayTouchRef.current && !overlayTouchRef.current.moved) {
        e.preventDefault(); // 이후 click 이벤트 이중 발생 방지
        handleOverlayClickRef.current?.();
      }
      overlayTouchRef.current = null;
    };
    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: false });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [visible]);

  if (!visible) return null;

  const handleOverlayClick = () => {
    if (activePopup) {
      setActivePopup(null);
      if (mode === 'full') {
        document.activeElement?.blur();
        closeBottomSheetWithSave();
      }
    } else if (mode === 'detail') {
      closeBottomSheet();
    } else if (mode === 'full') {
      document.activeElement?.blur();
      closeBottomSheetWithSave();
    } else {
      closeBottomSheet();
    }
  };
  handleOverlayClickRef.current = handleOverlayClick;

  // 그래버 터치 핸들러
  const handleGrabTouchStart = (e) => {
    isDraggingRef.current = true;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleGrabTouchMove = (e) => {
    if (!isDraggingRef.current) return;
    const dy = Math.max(0, e.touches[0].clientY - touchStartYRef.current);
    setDragY(dy);
  };

  const handleGrabTouchEnd = () => {
    isDraggingRef.current = false;
    if (dragY < 5) {
      document.activeElement?.blur();
      setDragY(window.innerHeight);
      setTimeout(() => closeBottomSheetWithSave(), 280);
    } else if (dragY > 80) {
      document.activeElement?.blur();
      setDragY(window.innerHeight);
      setTimeout(() => closeBottomSheetWithSave(), 280);
    } else {
      setDragY(0);
    }
  };

  const sheetStyle = dragY > 0 ? {
    transform: `translateX(-50%) translateY(${dragY}px)`,
    transition: isDraggingRef.current ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  } : undefined;

  return (
    <>
      <div
        ref={overlayRef}
        className="bottom-sheet-overlay"
        onClick={handleOverlayClick}
        style={{
          backgroundColor: mode === 'detail' ? 'rgba(0,0,0,0.2)' : undefined,
        }}
      ></div>
      {mode === 'full' && <div className="bottom-sheet-bg-gradient" />}
      {mode === 'detail' ? (
        <DetailSheet
          animate={animate}
          dragY={dragY}
          isDraggingRef={isDraggingRef}
          handleGrabTouchStart={handleGrabTouchStart}
          handleGrabTouchMove={handleGrabTouchMove}
          handleGrabTouchEnd={handleGrabTouchEnd}
        />
      ) : mode === 'status-only' ? (
        <div className={`bottom-sheet${animate ? ' visible' : ''}`} style={sheetStyle}>
          <div className="bottom-sheet-status-only">
            <div className="bottom-sheet-header">
              <h3 className="bottom-sheet-title">상태 변경</h3>
              <button className="btn-close" onClick={closeBottomSheet}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <StatusSection />
          </div>
        </div>
      ) : (
        <BottomSheetB
          activePopup={activePopup}
          setActivePopup={setActivePopup}
          animate={animate}
          dragY={dragY}
          isDraggingRef={isDraggingRef}
          handleGrabTouchStart={handleGrabTouchStart}
          handleGrabTouchMove={handleGrabTouchMove}
          handleGrabTouchEnd={handleGrabTouchEnd}
        />
      )}
    </>
  );
}
