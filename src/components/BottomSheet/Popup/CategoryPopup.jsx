import useTodoStore from '../../../store/useTodoStore';
import { subjects } from '../../../config';

export default function CategoryPopup({ visible, onClose, style }) {
  const data = useTodoStore(state => state.bottomSheetData);
  const updateBottomSheetField = useTodoStore(state => state.updateBottomSheetField);

  if (!visible) return null;

  const handleSelect = (categoryId) => {
    updateBottomSheetField('category', categoryId);
    onClose();
  };

  return (
    <>
      <div className="popup-overlay" onClick={onClose}></div>
      <div className="context-popup" data-popup="category" style={style}>
        <div className="popup-header">
          <h4 className="popup-title">과목 선택</h4>
          <button className="popup-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="popup-content">
          {subjects.map(s => (
            <button
              key={s.id}
              className="popup-item"
              onClick={() => handleSelect(s.id)}
            >
              <div className="popup-item-color" style={{ background: s.color }}></div>
              <span>{s.name}</span>
              {data.category === s.id && (
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
