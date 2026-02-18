import { useState, useEffect } from 'react';
import useTodoStore from '../../store/useTodoStore';
import { subjects } from '../../config';
import { useDebounce } from '../../hooks/useDebounce';
import { formatTime, formatDuration } from '../../utils/timeUtils';
import { CornerDownLeft, Clock, Pencil } from 'lucide-react';
import CategoryPopup from './Popup/CategoryPopup';
import TimePopup from './Popup/TimePopup';

export default function BottomSheetB({ activePopup, setActivePopup }) {
  const data = useTodoStore(state => state.bottomSheetData);
  const originalData = useTodoStore(state => state.originalBottomSheetData);
  const updateBottomSheetField = useTodoStore(state => state.updateBottomSheetField);
  const saveBottomSheet = useTodoStore(state => state.saveBottomSheet);

  const [textInput, setTextInput] = useState(data.text);

  // Debounce: 300ms 후 store 업데이트
  const debouncedText = useDebounce(textInput, 300);

  useEffect(() => {
    updateBottomSheetField('text', debouncedText);
  }, [debouncedText]);

  const handleTextChange = (e) => {
    setTextInput(e.target.value);
  };

  const selectedSubject = data.category
    ? subjects.find(s => s.id === data.category)
    : null;
  const categoryName = selectedSubject?.name || '과목';
  const categoryColor = selectedSubject?.color || null;

  const timeText = (() => {
    if (data.time === 'none') return '시간 없음';
    if (!data.time) return '시간';
    const start = formatTime(data.time);
    if (!data.duration) return start;
    const [h, m] = data.time.split(':').map(Number);
    const totalMins = h * 60 + m + data.duration;
    const endH = Math.floor(totalMins / 60) % 24;
    const endM = totalMins % 60;
    const endStr = `${String(endH).padStart(2,'0')}:${String(endM).padStart(2,'0')}`;
    return `${start} ~ ${formatTime(endStr)}`;
  })();

  const isSaveDisabled = !textInput.trim();

  // 최초 생성인지 수정인지 판단
  const isNewTodo = originalData && !originalData.text.trim();

  return (
    <>
      <div className="bottom-sheet-text-input-wrapper">
        <input
          type="text"
          className="bottom-sheet-text-input"
          placeholder="할 일 입력..."
          value={textInput}
          onChange={handleTextChange}
          autoFocus
        />
      </div>

      <div className="bottom-sheet-toolbar">
        <div className="toolbar-left">
          <button className="toolbar-btn" onClick={() => setActivePopup('category')}>
            {categoryColor && <span className="color-chip" style={{ backgroundColor: categoryColor }}></span>}
            <span className="toolbar-btn-text">{categoryName}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <button className="toolbar-btn" onClick={() => setActivePopup('time')}>
            <Clock size={12} strokeWidth={2} className="toolbar-btn-icon" />
            <span className="toolbar-btn-text">{timeText}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </div>
        <button
          className={`toolbar-save-btn${isSaveDisabled ? ' disabled' : ''}`}
          onClick={saveBottomSheet}
          disabled={isSaveDisabled}
        >
          {isNewTodo ? (
            <CornerDownLeft size={20} strokeWidth={2.5} />
          ) : (
            <Pencil size={18} strokeWidth={2.5} />
          )}
        </button>
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
