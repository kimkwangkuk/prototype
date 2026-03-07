import { forwardRef, useState } from 'react';

const ROW1 = ['q','w','e','r','t','y','u','i','o','p'];
const ROW2 = ['a','s','d','f','g','h','j','k','l'];
const ROW3 = ['z','x','c','v','b','n','m'];

const KeypadPopup = forwardRef(function KeypadPopup({ visible, value, onChange, onConfirm }, ref) {
  const [caps, setCaps] = useState(false);

  if (!visible) return null;

  const display = (ch) => caps ? ch.toUpperCase() : ch;

  const btnProps = (key) => ({
    onMouseDown: (e) => e.preventDefault(),
    onTouchStart: (e) => e.preventDefault(),
    onTouchEnd: (e) => { e.preventDefault(); handleKey(key); },
    onClick: () => handleKey(key),
  });

  const handleKey = (key) => {
    if (key === 'BACK') {
      onChange?.((value || '').slice(0, -1));
    } else if (key === 'ENTER') {
      onConfirm?.();
    } else if (key === 'SHIFT') {
      setCaps(c => !c);
    } else if (key === 'SPACE') {
      onChange?.((value || '') + ' ');
    } else {
      onChange?.((value || '') + display(key));
    }
  };

  return (
    <div ref={ref} className="keypad-popup">
      {/* 1행: Q–P */}
      <div className="keypad-row">
        {ROW1.map(ch => (
          <button key={ch} className="keypad-key" {...btnProps(ch)}>
            {display(ch)}
          </button>
        ))}
      </div>

      {/* 2행: A–L (중앙 정렬) */}
      <div className="keypad-row keypad-row-mid">
        {ROW2.map(ch => (
          <button key={ch} className="keypad-key" {...btnProps(ch)}>
            {display(ch)}
          </button>
        ))}
      </div>

      {/* 3행: Shift / Z–M / Backspace */}
      <div className="keypad-row">
        <button className={`keypad-key keypad-key-mod${caps ? ' keypad-key-caps' : ''}`} {...btnProps('SHIFT')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="17 11 12 6 7 11"/><line x1="12" y1="6" x2="12" y2="18"/>
          </svg>
        </button>
        {ROW3.map(ch => (
          <button key={ch} className="keypad-key" {...btnProps(ch)}>
            {display(ch)}
          </button>
        ))}
        <button className="keypad-key keypad-key-mod" {...btnProps('BACK')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12H3M10 5l-7 7 7 7"/>
          </svg>
        </button>
      </div>

      {/* 4행: Space / 확인 */}
      <div className="keypad-row keypad-row-bottom">
        <button className="keypad-key keypad-key-space" {...btnProps('SPACE')}>
          space
        </button>
        <button className="keypad-key keypad-key-confirm" {...btnProps('ENTER')}>
          확인
        </button>
      </div>
    </div>
  );
});

export default KeypadPopup;
