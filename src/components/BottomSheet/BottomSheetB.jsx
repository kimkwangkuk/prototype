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
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.66675 5.5L8.00008 10.8333L13.3334 5.5" stroke="black" strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round"/>
          </svg>
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
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g transform="translate(1, 1.5)">
                  <path d="M17 0C19.7614 0 22 2.23858 22 5V16C22 18.7614 19.7614 21 17 21H5C2.23858 21 0 18.7614 0 16V5C0 2.23858 2.23858 0 5 0H17ZM2 16C2 17.6569 3.34315 19 5 19H17C18.6569 19 20 17.6569 20 16V7.22461H2V16ZM5 2C3.34315 2 2 3.34315 2 5V5.22461H20V5C20 3.34315 18.6569 2 17 2H5Z" fill="currentColor" fillOpacity="0.86"/>
                </g>
                <line x1="6" y1="12.5" x2="6.01" y2="12.5" stroke="currentColor" strokeOpacity="0.86" strokeWidth="2" strokeLinecap="round"/>
                <line x1="10" y1="12.5" x2="10.01" y2="12.5" stroke="currentColor" strokeOpacity="0.86" strokeWidth="2" strokeLinecap="round"/>
                <line x1="14" y1="12.5" x2="14.01" y2="12.5" stroke="currentColor" strokeOpacity="0.86" strokeWidth="2" strokeLinecap="round"/>
                <line x1="18" y1="12.5" x2="18.01" y2="12.5" stroke="currentColor" strokeOpacity="0.86" strokeWidth="2" strokeLinecap="round"/>
                <line x1="6" y1="16.5" x2="6.01" y2="16.5" stroke="currentColor" strokeOpacity="0.86" strokeWidth="2" strokeLinecap="round"/>
                <line x1="10" y1="16.5" x2="10.01" y2="16.5" stroke="currentColor" strokeOpacity="0.86" strokeWidth="2" strokeLinecap="round"/>
                <line x1="14" y1="16.5" x2="14.01" y2="16.5" stroke="currentColor" strokeOpacity="0.86" strokeWidth="2" strokeLinecap="round"/>
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
