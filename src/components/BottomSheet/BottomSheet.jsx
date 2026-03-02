import { useState, useEffect, useRef } from 'react';
import useTodoStore from '../../store/useTodoStore';
import BottomSheetB from './BottomSheetB';
import DetailSheet from './DetailSheet';
import StatusSection from './StatusSection';

export default function BottomSheet() {
  const visible = useTodoStore(state => state.bottomSheetVisible);
  const mode = useTodoStore(state => state.bottomSheetMode);
  const data = useTodoStore(state => state.bottomSheetData);
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

  useEffect(() => {
    if (visible) {
      // 10ms 후 애니메이션 시작 (CSS transition을 위해)
      setTimeout(() => setAnimate(true), 10);

      // 신규 할일(빈 텍스트)만 스크롤: 기존 할일 편집 시 스크롤하면 iOS 키보드가 닫힘
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

  if (!visible) return null;

  const handleOverlayClick = () => {
    if (activePopup) {
      setActivePopup(null);
    } else if (mode === 'detail') {
      closeBottomSheet();
    } else {
      closeBottomSheet();
    }
  };

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
    if (dragY > 80) {
      // 인풋 포커스 해제 → 키보드 즉시 내림
      document.activeElement?.blur();
      // 임계값 초과: 화면 아래로 슬라이드 후 저장하며 닫기
      setDragY(window.innerHeight);
      setTimeout(() => closeBottomSheetWithSave(), 280);
    } else {
      // 임계값 미달: 원위치로 스냅
      setDragY(0);
    }
  };

  // 드래그 중 인라인 스타일로 transform 오버라이드
  const sheetStyle = dragY > 0 ? {
    transform: `translateX(-50%) translateY(${dragY}px)`,
    transition: isDraggingRef.current ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  } : undefined;

  return (
    <>
      <div
        className="bottom-sheet-overlay"
        onClick={mode === 'status-only' || mode === 'detail' ? handleOverlayClick : undefined}
        style={{
          pointerEvents: mode === 'status-only' || mode === 'detail' ? 'auto' : 'none',
          backgroundColor: mode === 'detail' ? 'rgba(0,0,0,0.2)' : undefined,
        }}
      ></div>
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
