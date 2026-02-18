import useTodoStore from '../../../store/useTodoStore';

export default function TimePopup({ visible, onClose }) {
  const data = useTodoStore(state => state.bottomSheetData);
  const updateBottomSheetField = useTodoStore(state => state.updateBottomSheetField);

  if (!visible) return null;

  const handleTimeChange = (e) => {
    updateBottomSheetField('time', e.target.value);
    onClose();
  };

  return (
    <>
      <div className="popup-overlay" onClick={onClose}></div>
      <div className="context-popup" data-popup="time">
        <div className="popup-header">
          <h4 className="popup-title">시작 시간</h4>
          <button className="popup-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="popup-content">
          <input
            type="time"
            className="popup-time-input"
            value={data.time || ''}
            onChange={handleTimeChange}
            autoFocus
          />
        </div>
      </div>
    </>
  );
}
