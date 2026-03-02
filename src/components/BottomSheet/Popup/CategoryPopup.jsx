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
      <div className="popup-overlay" onMouseDown={(e) => e.preventDefault()} onTouchStart={(e) => e.preventDefault()} onTouchEnd={(e) => { e.preventDefault(); onClose(); }} onClick={onClose}></div>
      <div className="context-popup" data-popup="category" style={style}>
        <div className="popup-content">
          {subjects.map(s => (
            <button
              key={s.id}
              className="popup-item"
              onMouseDown={(e) => e.preventDefault()}
              onTouchStart={(e) => e.preventDefault()}
              onTouchEnd={(e) => { e.preventDefault(); handleSelect(s.id); }}
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
