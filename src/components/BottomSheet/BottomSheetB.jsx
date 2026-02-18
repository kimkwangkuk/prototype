import { useState, useEffect } from 'react';
import useTodoStore from '../../store/useTodoStore';
import { subjects } from '../../config';
import { useDebounce } from '../../hooks/useDebounce';
import { formatTime, formatDuration } from '../../utils/timeUtils';
import { CornerDownLeft } from 'lucide-react';
import CategoryPopup from './Popup/CategoryPopup';
import TimePopup from './Popup/TimePopup';
import DurationPopup from './Popup/DurationPopup';

export default function BottomSheetB() {
  const data = useTodoStore(state => state.bottomSheetData);
  const originalData = useTodoStore(state => state.originalBottomSheetData);
  const updateBottomSheetField = useTodoStore(state => state.updateBottomSheetField);
  const saveBottomSheet = useTodoStore(state => state.saveBottomSheet);

  const [textInput, setTextInput] = useState(data.text);
  const [activePopup, setActivePopup] = useState(null);

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

  const timeText = data.time ? formatTime(data.time) : '시작 시간';
  const durationText = data.duration ? formatDuration(data.duration) : '지속 시간';

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
            <span className="toolbar-btn-text">{timeText}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <button className="toolbar-btn" onClick={() => setActivePopup('duration')}>
            <span className="toolbar-btn-text">{durationText}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </div>
        <button
          className={`toolbar-save-btn${isSaveDisabled ? ' disabled' : ''}${!isNewTodo ? ' with-text' : ''}`}
          onClick={saveBottomSheet}
          disabled={isSaveDisabled}
        >
          {isNewTodo ? (
            <CornerDownLeft size={20} strokeWidth={2.5} />
          ) : (
            <span>수정</span>
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

      <DurationPopup
        visible={activePopup === 'duration'}
        onClose={() => setActivePopup(null)}
      />
    </>
  );
}
