import useTodoStore from '../../store/useTodoStore';
import { subjects } from '../../config';
import { formatTime, formatDuration } from '../../utils/timeUtils';

const dateLabels = { today: '오늘', repeat: '반복', date: '날짜' };

export default function DetailSheet({ animate, dragY, isDraggingRef, handleGrabTouchStart, handleGrabTouchMove, handleGrabTouchEnd }) {
  const data = useTodoStore(state => state.bottomSheetData);
  const openEditFromDetail = useTodoStore(state => state.openEditFromDetail);
  const deleteTodoFromDetail = useTodoStore(state => state.deleteTodoFromDetail);

  const subject = subjects.find(s => s.id === data.category);
  const dateText = dateLabels[data.date] || '오늘';
  const timeText = data.time && data.time !== 'none' ? formatTime(data.time) : null;
  const durationText = data.duration && data.duration !== 'none' ? formatDuration(data.duration) : null;

  const sheetStyle = dragY > 0 ? {
    transform: `translateX(-50%) translateY(${dragY}px)`,
    transition: isDraggingRef.current ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  } : undefined;

  const handleEdit = () => {
    openEditFromDetail();
    // 편집 모드로 전환 후 input 포커스 (iOS 키보드 호출)
    setTimeout(() => {
      const input = document.querySelector(`[data-todo-id="${data.todoId}"] input`);
      if (input) {
        input.removeAttribute('readonly');
        input.focus();
      }
    }, 50);
  };

  return (
    <div className={`bottom-sheet detail-sheet${animate ? ' visible' : ''}`} style={sheetStyle}>
      <div
        className="toolbar-grabber"
        onTouchStart={handleGrabTouchStart}
        onTouchMove={handleGrabTouchMove}
        onTouchEnd={handleGrabTouchEnd}
      >
        <div className="toolbar-grabber-bar" />
      </div>

      <div className="detail-sheet-body">
        {/* 할일 텍스트 */}
        <p className="detail-sheet-text">{data.text || '(제목 없음)'}</p>

        {/* 메타 정보 */}
        <div className="detail-sheet-meta">
          {subject && (
            <div className="detail-sheet-meta-row">
              <div className="detail-meta-dot" style={{ backgroundColor: subject.color }} />
              <span className="detail-meta-label">{subject.name}</span>
            </div>
          )}
          <div className="detail-sheet-meta-row">
            <svg className="detail-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
              <line x1="10" y1="16" x2="14" y2="16"/>
              <line x1="12" y1="14" x2="12" y2="18"/>
            </svg>
            <span className="detail-meta-label">{dateText}</span>
          </div>
          {timeText && (
            <div className="detail-sheet-meta-row">
              <svg className="detail-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span className="detail-meta-label">{timeText}</span>
            </div>
          )}
          {durationText && (
            <div className="detail-sheet-meta-row">
              <svg className="detail-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="10" x2="14" y1="2" y2="2"/>
                <line x1="12" x2="15" y1="14" y2="11"/>
                <circle cx="12" cy="14" r="8"/>
              </svg>
              <span className="detail-meta-label">{durationText}</span>
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div className="detail-sheet-actions">
          <button className="detail-action-btn detail-action-delete" onClick={() => deleteTodoFromDetail(data.todoId)}>
            삭제
          </button>
          <button className="detail-action-btn detail-action-edit" onClick={handleEdit}>
            편집
          </button>
        </div>
      </div>
    </div>
  );
}
