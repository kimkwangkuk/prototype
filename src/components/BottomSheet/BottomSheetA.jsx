import { useState } from 'react';
import useTodoStore from '../../store/useTodoStore';
import { subjects } from '../../config';
import { formatTime, formatDuration } from '../../utils/timeUtils';
import StatusSection from './StatusSection';

export default function BottomSheetA() {
  const data = useTodoStore(state => state.bottomSheetData);
  const updateBottomSheetField = useTodoStore(state => state.updateBottomSheetField);
  const saveBottomSheet = useTodoStore(state => state.saveBottomSheet);
  const closeBottomSheet = useTodoStore(state => state.closeBottomSheet);

  const [textInput, setTextInput] = useState(data.text);

  const handleTextChange = (e) => {
    setTextInput(e.target.value);
    updateBottomSheetField('text', e.target.value);
  };

  const handleCategorySelect = (categoryId) => {
    updateBottomSheetField('category', categoryId);
  };

  const handleTimeChange = (e) => {
    updateBottomSheetField('time', e.target.value);
  };

  const handleDurationSelect = (minutes) => {
    updateBottomSheetField('duration', minutes);
  };

  const durations = [
    { value: 30, label: '30분' },
    { value: 60, label: '1시간' },
    { value: 90, label: '1시간 30분' },
    { value: 120, label: '2시간' },
  ];

  const isSaveDisabled = !textInput.trim();

  return (
    <>
      <div className="bottom-sheet-header">
        <h3 className="bottom-sheet-title">상세 설정</h3>
        <button className="btn-close" onClick={closeBottomSheet}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div className="bottom-sheet-content">
        <div className="bottom-sheet-section">
          <div className="section-label">할 일</div>
          <input
            type="text"
            className="section-input"
            placeholder="할 일 입력..."
            value={textInput}
            onChange={handleTextChange}
            autoFocus
          />
        </div>

        <StatusSection />

        <div className="bottom-sheet-section">
          <div className="section-label">과목</div>
          <div className="category-list">
            {subjects.map(s => (
              <button
                key={s.id}
                className={`category-chip${data.category === s.id ? ' active' : ''}`}
                onClick={() => handleCategorySelect(s.id)}
              >
                <div className="category-chip-color" style={{ background: s.color }}></div>
                <span>{s.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bottom-sheet-section">
          <div className="section-label">시간 설정</div>
          <div className="time-row">
            <input
              type="time"
              className="time-input"
              value={data.time || ''}
              onChange={handleTimeChange}
            />
          </div>
        </div>

        <div className="bottom-sheet-section">
          <div className="section-label">지속 시간</div>
          <div className="duration-list">
            {durations.map(d => (
              <button
                key={d.value}
                className={`duration-chip${data.duration === d.value ? ' active' : ''}`}
                onClick={() => handleDurationSelect(d.value)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bottom-sheet-footer">
        <button
          className={`btn-save${isSaveDisabled ? ' disabled' : ''}`}
          onClick={saveBottomSheet}
          disabled={isSaveDisabled}
        >
          저장
        </button>
      </div>
    </>
  );
}
