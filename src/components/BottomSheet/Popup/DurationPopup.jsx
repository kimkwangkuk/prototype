import { useState, useEffect } from 'react';
import Picker from 'react-mobile-picker';
import useTodoStore from '../../../store/useTodoStore';

const PRESETS = [
  { value: '10',  label: '10분' },
  { value: '20',  label: '20분' },
  { value: '30',  label: '30분' },
  { value: '40',  label: '40분' },
  { value: '50',  label: '50분' },
  { value: '60',  label: '1시간' },
  { value: '90',  label: '1시간 30분' },
  { value: '120', label: '2시간' },
  { value: '150', label: '2시간 30분' },
  { value: '180', label: '3시간' },
];

const DEFAULT_VALUE = '30';

function minutesToPickerValue(totalMins) {
  if (!totalMins || totalMins === 'none') return { duration: DEFAULT_VALUE };
  const match = PRESETS.find(p => p.value === String(totalMins));
  return { duration: match ? match.value : DEFAULT_VALUE };
}

export default function DurationPopup({ visible, onClose, style }) {
  const data = useTodoStore(state => state.bottomSheetData);
  const updateBottomSheetField = useTodoStore(state => state.updateBottomSheetField);

  const [pickerValue, setPickerValue] = useState(() => minutesToPickerValue(data.duration));

  useEffect(() => {
    if (visible) {
      const initial = minutesToPickerValue(data.duration);
      setPickerValue(initial);
      if (!data.duration || data.duration === 'none') {
        updateBottomSheetField('duration', Number(initial.duration));
      }
    }
  }, [visible]);

  if (!visible) return null;

  const handleChange = (val) => {
    setPickerValue(val);
    updateBottomSheetField('duration', Number(val.duration));
  };

  const handleClear = () => {
    updateBottomSheetField('duration', 'none');
    onClose();
  };

  return (
    <>
      <div className="popup-overlay" onMouseDown={(e) => e.preventDefault()} onTouchStart={(e) => e.preventDefault()} onTouchEnd={(e) => { e.preventDefault(); onClose(); }} onClick={onClose}></div>
      <div className="context-popup" data-popup="duration" style={style}>
        <div className="popup-content">
          <div className="drum-picker-wrapper">
            <Picker value={pickerValue} onChange={handleChange} wheelMode="natural" height={180} itemHeight={44}>
              <Picker.Column name="duration">
                {PRESETS.map(({ value, label }) => (
                  <Picker.Item key={value} value={value}>
                    {({ selected }) => <span className={selected ? 'drum-item selected' : 'drum-item'}>{label}</span>}
                  </Picker.Item>
                ))}
              </Picker.Column>
            </Picker>
          </div>
        </div>
        <div className="popup-footer">
          <button className="popup-clear-btn" onMouseDown={(e) => e.preventDefault()} onTouchStart={(e) => e.preventDefault()} onTouchEnd={(e) => { e.preventDefault(); handleClear(); }} onClick={handleClear}>없음</button>
        </div>
      </div>
    </>
  );
}
