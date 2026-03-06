import { useState, useEffect } from 'react';

export default function NumpadPopup({ visible, value: initialValue, unit = '분', onConfirm, onClose }) {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (visible) {
      setValue(initialValue != null && initialValue !== '' ? String(initialValue) : '');
    }
  }, [visible]);

  if (!visible) return null;

  const handleKey = (key) => {
    if (key === '←') {
      setValue(v => v.slice(0, -1));
    } else if (key === '확인') {
      onConfirm(value ? Number(value) : null);
      onClose();
    } else {
      if (value.length >= 4) return;
      setValue(v => v + key);
    }
  };

  const KEYS = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '←', '0', '확인'];

  return (
    <>
      <div className="numpad-overlay" onClick={onClose} />
      <div className="numpad-popup">
        <div className="numpad-display-row">
          <span className="numpad-display-value">{value || '0'}</span>
          <span className="numpad-display-unit">{unit}</span>
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
              className={`numpad-key${key === '확인' ? ' numpad-key-confirm' : ''}${key === '←' ? ' numpad-key-back' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onTouchStart={(e) => e.preventDefault()}
              onTouchEnd={(e) => { e.preventDefault(); handleKey(key); }}
              onClick={() => handleKey(key)}
            >
              {key === '←' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12H3M10 5l-7 7 7 7"/>
                </svg>
              ) : key}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
