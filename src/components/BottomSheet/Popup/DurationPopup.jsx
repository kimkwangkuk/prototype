import useTodoStore from '../../../store/useTodoStore';

export default function DurationPopup({ visible, onClose }) {
  const data = useTodoStore(state => state.bottomSheetData);
  const updateBottomSheetField = useTodoStore(state => state.updateBottomSheetField);

  if (!visible) return null;

  const durations = [
    { value: 30, label: '30분' },
    { value: 60, label: '1시간' },
    { value: 90, label: '1시간 30분' },
    { value: 120, label: '2시간' },
  ];

  const handleSelect = (duration) => {
    updateBottomSheetField('duration', duration);
    onClose();
  };

  return (
    <>
      <div className="popup-overlay" onClick={onClose}></div>
      <div className="context-popup" data-popup="duration">
        <div className="popup-header">
          <h4 className="popup-title">지속 시간</h4>
          <button className="popup-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="popup-content">
          {durations.map(d => (
            <button
              key={d.value}
              className="popup-item"
              onClick={() => handleSelect(d.value)}
            >
              <span>{d.label}</span>
              {data.duration === d.value && (
                <svg className="popup-item-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
