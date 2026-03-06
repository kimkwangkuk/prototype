import { useState, useEffect } from 'react';
import useTodoStore from '../../../store/useTodoStore';

export default function NumpadPopup({ visible, onClose }) {
  const data = useTodoStore(state => state.bottomSheetData);
  const updateBottomSheetField = useTodoStore(state => state.updateBottomSheetField);
  const [value, setValue] = useState('');

  useEffect(() => {
    if (visible) {
      const d = data.duration;
      setValue(d && d !== 'none' ? String(d) : '');
    }
  }, [visible]);

  if (!visible) return null;

  const handleKey = (key) => {
    if (key === '←') {
      setValue(v => v.slice(0, -1));
    } else if (key === '확인') {
      updateBottomSheetField('duration', value ? Number(value) : 'none');
      onClose();
    } else if (key === '없음') {
      updateBottomSheetField('duration', 'none');
      onClose();
    } else {
      if (value.length >= 3) return;
      setValue(v => v + key);
    }
  };

  const KEYS = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '없음', '0', '확인'];

  return (
    <>
      <div className="numpad-overlay" onClick={onClose} />
      <div className="numpad-popup">
        <div className="numpad-display-row">
          <input
            type="text"
            inputMode="none"
            readOnly
            value={value}
            placeholder="0"
            className="numpad-display-input"
          />
          <span className="numpad-display-unit">분</span>
          <button
            className="numpad-backspace"
            onMouseDown={(e) => e.preventDefault()}
            onTouchStart={(e) => e.preventDefault()}
            onTouchEnd={(e) => { e.preventDefault(); handleKey('←'); }}
            onClick={() => handleKey('←')}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12H3M10 5l-7 7 7 7"/>
            </svg>
          </button>
        </div>
        <div className="numpad-grid">
          {KEYS.map(key => (
            <button
              key={key}
              className={`numpad-key${key === '확인' ? ' numpad-key-confirm' : ''}${key === '없음' ? ' numpad-key-clear' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onTouchStart={(e) => e.preventDefault()}
              onTouchEnd={(e) => { e.preventDefault(); handleKey(key); }}
              onClick={() => handleKey(key)}
            >
              {key}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
