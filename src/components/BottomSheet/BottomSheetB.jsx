import useTodoStore from '../../store/useTodoStore';
import { subjects } from '../../config';
import { formatTime, formatDuration } from '../../utils/timeUtils';
import CategoryPopup from './Popup/CategoryPopup';
import TimePopup from './Popup/TimePopup';

export default function BottomSheetB({ activePopup, setActivePopup }) {
  const data = useTodoStore(state => state.bottomSheetData);

  const selectedSubject = data.category
    ? subjects.find(s => s.id === data.category)
    : null;
  const categoryName = selectedSubject?.name || '할일';
  const categoryColor = selectedSubject?.color || '#ff7300';

  const dateText = '02.28';

  const timeText = (() => {
    if (data.time === 'none') return '시간 없음';
    if (!data.time) return '오후 3:00';
    return formatTime(data.time);
  })();

  const durationText = data.duration ? formatDuration(data.duration) : '지속시간';

  return (
    <>
      <div className="bottom-sheet-toolbar-new">
        <div className="toolbar-grabber">
          <div className="toolbar-grabber-bar" />
        </div>
        <div className="toolbar-glass-container">
          <button className="toolbar-icon-btn" onClick={() => setActivePopup('category')}>
            <div className="toolbar-icon" style={{ backgroundColor: categoryColor }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <line x1="5" y1="5" x2="19" y2="5"/>
                <line x1="5" y1="19" x2="19" y2="19"/>
              </svg>
            </div>
            <span className="toolbar-icon-text">{categoryName}</span>
          </button>

          <button className="toolbar-icon-btn" onClick={() => setActivePopup('time')}>
            <div className="toolbar-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
                <line x1="10" y1="16" x2="14" y2="16"/>
                <line x1="12" y1="14" x2="12" y2="18"/>
              </svg>
            </div>
            <span className="toolbar-icon-text">{dateText}</span>
          </button>

          <button className="toolbar-icon-btn" onClick={() => setActivePopup('time')}>
            <div className="toolbar-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <span className="toolbar-icon-text">{timeText}</span>
          </button>

          <button className="toolbar-icon-btn">
            <div className="toolbar-icon toolbar-icon-disabled">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <span className="toolbar-icon-text toolbar-icon-text-disabled">{durationText}</span>
          </button>
        </div>
      </div>

      <CategoryPopup
        visible={activePopup === 'category'}
        onClose={() => setActivePopup(null)}
      />

      <TimePopup
        visible={activePopup === 'time'}
        onClose={() => setActivePopup(null)}
      />
    </>
  );
}
