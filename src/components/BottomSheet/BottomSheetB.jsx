import { useState } from 'react';
import useTodoStore from '../../store/useTodoStore';
import { subjects } from '../../config';
import { formatTime, formatDuration } from '../../utils/timeUtils';
import CategoryPopup from './Popup/CategoryPopup';
import DatePopup from './Popup/DatePopup';
import TimePopup from './Popup/TimePopup';
import DurationPopup from './Popup/DurationPopup';

export default function BottomSheetB({
  activePopup,
  setActivePopup,
  animate,
  dragY,
  isDraggingRef,
  handleGrabTouchStart,
  handleGrabTouchMove,
  handleGrabTouchEnd
}) {
  const data = useTodoStore(state => state.bottomSheetData);
  const editingTodoId = useTodoStore(state => state.editingTodoId);
  const [popupStyle, setPopupStyle] = useState({});

  // iOS: touchstart preventDefault → blur 방지, click 억제됨 → touchend에서 처리
  // Desktop: mousedown preventDefault → blur 방지, click에서 처리
  const toolbarBtnProps = (name) => ({
    onMouseDown: (e) => e.preventDefault(),
    onTouchStart: (e) => e.preventDefault(),
    onTouchEnd: (e) => { e.preventDefault(); openPopup(e, name); },
    onClick: (e) => openPopup(e, name),
  });

  const openPopup = (e, name) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // --app-height: 시작 시 설정된 고정 레이아웃 뷰포트 높이 (키보드 열려도 불변)
    // iOS에서 window.innerHeight는 키보드 시 줄어들어 사용 불가
    const appHeight = parseFloat(
      document.documentElement.style.getPropertyValue('--app-height')
    ) || window.innerHeight;
    const offsetTop = window.visualViewport?.offsetTop ?? 0;
    const bottom = appHeight - (offsetTop + rect.top) + 8;
    setPopupStyle({ bottom: `${bottom}px` });
    setActivePopup(name);
  };

  const closePopup = () => {
    setActivePopup(null);
    if (editingTodoId) {
      const input = document.querySelector(`[data-todo-id="${editingTodoId}"] input`);
      input?.focus();
    }
  };

  const selectedSubject = data.category
    ? subjects.find(s => s.id === data.category)
    : null;
  const categoryName = selectedSubject?.name || '과목';
  const categoryColor = selectedSubject?.color;
  const categoryDisabled = !data.category;

  const dateLabels = { today: '오늘', repeat: '반복', date: '날짜' };
  const dateText = dateLabels[data.date] || '오늘';
  const dateDisabled = false;

  const timeNone = data.time === 'none';
  const timeDisabled = !data.time;
  const timeText = timeNone ? '없음' : (timeDisabled ? '시작 시간' : formatTime(data.time));

  const durationNone = data.duration === 'none';
  const durationDisabled = !data.duration && !durationNone;
  const durationText = durationNone ? '없음' : (durationDisabled ? '지속시간' : formatDuration(data.duration));

  const sheetStyle = dragY > 0 ? {
    transform: `translateX(-50%) translateY(${dragY}px)`,
    transition: isDraggingRef.current ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  } : undefined;

  return (
    <>
      <div
        className={`bottom-sheet bottom-sheet-toolbar-new${animate ? ' visible' : ''}`}
        style={sheetStyle}
      >
        <div className="toolbar-surface" />
        <div
          className="toolbar-grabber"
          onTouchStart={handleGrabTouchStart}
          onTouchMove={handleGrabTouchMove}
          onTouchEnd={handleGrabTouchEnd}
        >
          <div className="toolbar-grabber-bar" />
        </div>
        <div className="toolbar-buttons-container">
          <button className="toolbar-icon-btn" {...toolbarBtnProps('category')}>
            <div className={`toolbar-icon${categoryDisabled ? ' toolbar-icon-disabled' : ''}`}>
              <div className="toolbar-category-square" style={{ backgroundColor: categoryDisabled ? undefined : categoryColor }} />
            </div>
            <span className={`toolbar-icon-text${categoryDisabled ? ' toolbar-icon-text-disabled' : ''}`}>{categoryName}</span>
          </button>

          <button className="toolbar-icon-btn" {...toolbarBtnProps('date')}>
            <div className={`toolbar-icon${dateDisabled ? ' toolbar-icon-disabled' : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
                <line x1="10" y1="16" x2="14" y2="16"/>
                <line x1="12" y1="14" x2="12" y2="18"/>
              </svg>
            </div>
            <span className={`toolbar-icon-text${dateDisabled ? ' toolbar-icon-text-disabled' : ''}`}>{dateText}</span>
          </button>

          <button className="toolbar-icon-btn" {...toolbarBtnProps('time')}>
            <div className={`toolbar-icon${timeDisabled ? ' toolbar-icon-disabled' : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <span className={`toolbar-icon-text${timeDisabled ? ' toolbar-icon-text-disabled' : ''}${timeNone ? ' toolbar-icon-text-none' : ''}`}>{timeText}</span>
          </button>

          <button className="toolbar-icon-btn" {...toolbarBtnProps('duration')}>
            <div className={`toolbar-icon${durationDisabled ? ' toolbar-icon-disabled' : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="10" x2="14" y1="2" y2="2"/>
                <line x1="12" x2="15" y1="14" y2="11"/>
                <circle cx="12" cy="14" r="8"/>
              </svg>
            </div>
            <span className={`toolbar-icon-text${durationDisabled ? ' toolbar-icon-text-disabled' : ''}${durationNone || timeNone ? ' toolbar-icon-text-none' : ''}`}>{durationText}</span>
          </button>
        </div>
      </div>

      <CategoryPopup
        visible={activePopup === 'category'}
        onClose={closePopup}
        style={popupStyle}
      />

      <DatePopup
        visible={activePopup === 'date'}
        onClose={closePopup}
        style={popupStyle}
      />

      <TimePopup
        visible={activePopup === 'time'}
        onClose={closePopup}
        style={popupStyle}
      />

      <DurationPopup
        visible={activePopup === 'duration'}
        onClose={closePopup}
        style={popupStyle}
      />
    </>
  );
}
