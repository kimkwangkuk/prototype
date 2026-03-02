import { useState, useEffect } from 'react';
import Picker from 'react-mobile-picker';
import useTodoStore from '../../../store/useTodoStore';

// 10분 단위 144개 슬롯 생성 (00:00 ~ 23:50)
const timeSlots = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 10) {
    const hh = String(h).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    timeSlots.push(`${hh}:${mm}`);
  }
}

function formatLabel(slot) {
  const [h, m] = slot.split(':').map(Number);
  const isPM = h >= 12;
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${isPM ? '오후' : '오전'} ${h12}:${String(m).padStart(2, '0')}`;
}

function snapToSlot(timeStr) {
  if (!timeStr || timeStr === 'none') return '08:00';
  const [h, m] = timeStr.split(':').map(Number);
  const snapped = Math.round(m / 10) * 10;
  const mm = snapped >= 60 ? 0 : snapped;
  const hh = snapped >= 60 ? (h + 1) % 24 : h;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export default function TimePopup({ visible, onClose, style }) {
  const data = useTodoStore(state => state.bottomSheetData);
  const updateBottomSheetField = useTodoStore(state => state.updateBottomSheetField);

  const [timeValue, setTimeValue] = useState(() => ({ time: snapToSlot(data.time) }));

  useEffect(() => {
    if (visible) {
      const slot = snapToSlot(data.time);
      setTimeValue({ time: slot });
      if (!data.time || data.time === '') {
        updateBottomSheetField('time', slot);
      }
    }
  }, [visible]);

  if (!visible) return null;

  const handleTimeChange = (val) => {
    setTimeValue(val);
    updateBottomSheetField('time', val.time);
  };

  const handleClearTime = () => {
    updateBottomSheetField('time', 'none');
    onClose();
  };

  return (
    <>
      <div className="popup-overlay" onMouseDown={(e) => e.preventDefault()} onTouchStart={(e) => e.preventDefault()} onTouchEnd={(e) => { e.preventDefault(); onClose(); }} onClick={onClose}></div>
      <div className="context-popup" data-popup="time" style={style}>
        <div className="popup-content">
          <div className="drum-picker-wrapper">
            <Picker value={timeValue} onChange={handleTimeChange} wheelMode="natural" height={180} itemHeight={44}>
              <Picker.Column name="time">
                {timeSlots.map(v => (
                  <Picker.Item key={v} value={v}>
                    {({ selected }) => <span className={selected ? 'drum-item selected' : 'drum-item'}>{formatLabel(v)}</span>}
                  </Picker.Item>
                ))}
              </Picker.Column>
            </Picker>
          </div>
        </div>
        <div className="popup-footer">
          <button className="popup-clear-btn" onMouseDown={(e) => e.preventDefault()} onTouchStart={(e) => e.preventDefault()} onTouchEnd={(e) => { e.preventDefault(); handleClearTime(); }} onClick={handleClearTime}>
            없음
          </button>
        </div>
      </div>
    </>
  );
}
