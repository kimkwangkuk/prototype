import { forwardRef } from 'react';

const NumpadPopup = forwardRef(function NumpadPopup({ visible, value, onChange, onConfirm }, ref) {
  if (!visible) return null;

  const handleKey = (key) => {
    if (key === '←') {
      onChange?.((value || '').slice(0, -1));
    } else if (key === '확인') {
      onConfirm?.();
    } else {
      if ((value || '').length >= 10) return;
      onChange?.((value || '') + key);
    }
  };

  const KEYS = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '←', '0', '확인'];

  return (
    <div ref={ref} className="numpad-popup">
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
  );
});

export default NumpadPopup;
