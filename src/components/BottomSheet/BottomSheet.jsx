import { useState, useEffect } from 'react';
import useTodoStore from '../../store/useTodoStore';
import BottomSheetB from './BottomSheetB';
import StatusSection from './StatusSection';

export default function BottomSheet() {
  const visible = useTodoStore(state => state.bottomSheetVisible);
  const mode = useTodoStore(state => state.bottomSheetMode);
  const data = useTodoStore(state => state.bottomSheetData);
  const editingTodoId = useTodoStore(state => state.editingTodoId);
  const closeBottomSheet = useTodoStore(state => state.closeBottomSheet);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (visible) {
      // 10ms 후 애니메이션 시작 (CSS transition을 위해)
      setTimeout(() => setAnimate(true), 10);

      // 편집 중인 할일을 바텀시트 위쪽으로 스크롤 (원본과 동일한 타이밍)
      if (editingTodoId && mode !== 'status-only') {
        setTimeout(() => {
          const todoItem = document.querySelector(`[data-todo-id="${editingTodoId}"]`);
          if (todoItem) {
            const rect = todoItem.getBoundingClientRect();
            const offset = window.innerHeight * 0.25; // 상단 25% 위치
            const contentEl = document.getElementById('content');
            if (contentEl) {
              contentEl.scrollBy({
                top: rect.top - offset,
                behavior: 'smooth'
              });
            }
          }
        }, 10);
      }
    } else {
      setAnimate(false);
    }
  }, [visible, editingTodoId, mode]);

  if (!visible) return null;

  const handleOverlayClick = () => {
    closeBottomSheet();
  };

  return (
    <>
      <div
        className="bottom-sheet-overlay"
        onClick={handleOverlayClick}
        style={{ pointerEvents: 'auto' }}
      ></div>
      <div className={`bottom-sheet${animate ? ' visible' : ''}`}>
        {mode === 'status-only' ? (
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
        ) : (
          <BottomSheetB />
        )}
      </div>
    </>
  );
}
