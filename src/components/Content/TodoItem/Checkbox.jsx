import { useRef, useEffect } from 'react';

export default function Checkbox({ status, color, onClick }) {
  const prevStatusRef = useRef(null);
  const isStatusChange = prevStatusRef.current !== null && prevStatusRef.current !== status;

  useEffect(() => {
    prevStatusRef.current = status;
  });

  const animClass = isStatusChange ? 'cb-icon-enter' : '';

  let icon;

  switch (status) {
    case 'empty':
      icon = <div key="empty" className={`cb-empty ${animClass}`} />;
      break;

    case 'progress':
      icon = (
        <div key="progress" className={`cb-progress ${animClass}`}>
          <div className="cb-progress-fill" style={{ background: color }} />
        </div>
      );
      break;

    case 'done':
      icon = (
        <div key="done" className={`cb-done ${animClass}`} style={{ borderColor: color }} />
      );
      break;

    case 'skip':
      icon = (
        <div key="skip" className={`cb-skip ${animClass}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
            <polygon points="12,4 22,20 2,20"/>
          </svg>
        </div>
      );
      break;

    case 'cancel':
      icon = (
        <div key="cancel" className={`cb-cancel ${animClass}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
            <line x1="5" y1="5" x2="19" y2="19"/>
            <line x1="19" y1="5" x2="5" y2="19"/>
          </svg>
        </div>
      );
      break;

    default:
      icon = <div key="empty" className={`cb-empty ${animClass}`} />;
  }

  return (
    <div className="todo-checkbox" onClick={onClick}>
      {icon}
    </div>
  );
}
