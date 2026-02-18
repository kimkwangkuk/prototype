export default function Checkbox({ status, color, onClick }) {
  const renderIcon = () => {
    switch (status) {
      case 'empty':
        return <div className="cb-empty"></div>;

      case 'progress':
        return (
          <div className="cb-progress">
            <div className="cb-progress-fill" style={{ background: color }}></div>
          </div>
        );

      case 'done':
        return <div className="cb-done" style={{ borderColor: color }}></div>;

      case 'skip':
        return (
          <div className="cb-skip">
            <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
              <polygon points="12,4 22,20 2,20"/>
            </svg>
          </div>
        );

      case 'cancel':
        return (
          <div className="cb-cancel">
            <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
              <line x1="5" y1="5" x2="19" y2="19"/>
              <line x1="19" y1="5" x2="5" y2="19"/>
            </svg>
          </div>
        );

      default:
        return <div className="cb-empty"></div>;
    }
  };

  return (
    <div className="todo-checkbox" onClick={onClick}>
      {renderIcon()}
    </div>
  );
}
