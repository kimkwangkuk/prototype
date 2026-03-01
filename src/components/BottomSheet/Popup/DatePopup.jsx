import useTodoStore from '../../../store/useTodoStore';

const DATE_OPTIONS = [
  { value: 'today', label: '오늘' },
  { value: 'repeat', label: '반복' },
  { value: 'date', label: '날짜' },
];

export default function DatePopup({ visible, onClose, style }) {
  const data = useTodoStore(state => state.bottomSheetData);
  const updateBottomSheetField = useTodoStore(state => state.updateBottomSheetField);

  if (!visible) return null;

  const handleSelect = (value) => {
    updateBottomSheetField('date', value);
    onClose();
  };

  return (
    <>
      <div className="popup-overlay" onClick={onClose}></div>
      <div className="context-popup" data-popup="date" style={style}>
        <div className="popup-header">
          <h4 className="popup-title">날짜</h4>
          <button className="popup-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="popup-content">
          {DATE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className="popup-item"
              onClick={() => handleSelect(opt.value)}
            >
              <span>{opt.label}</span>
              {data.date === opt.value && (
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
