import { useState, useEffect } from 'react';
import Picker from 'react-mobile-picker';
import useTodoStore from '../../../store/useTodoStore';

const durationHours = ['0', '1', '2', '3', '4'];
const durationMins = ['00', '15', '30', '45'];

function durationToPicker(totalMins) {
  if (!totalMins) return { dHour: '0', dMinute: '30' };
  const h = Math.min(Math.floor(totalMins / 60), 4);
  const m = totalMins % 60;
  const snapM = durationMins.reduce((prev, cur) =>
    Math.abs(Number(cur) - m) < Math.abs(Number(prev) - m) ? cur : prev
  );
  return { dHour: String(h), dMinute: snapM };
}

function pickerToDuration({ dHour, dMinute }) {
  return Number(dHour) * 60 + Number(dMinute);
}

export default function DurationPopup({ visible, onClose, style }) {
  const data = useTodoStore(state => state.bottomSheetData);
  const updateBottomSheetField = useTodoStore(state => state.updateBottomSheetField);

  const [durValue, setDurValue] = useState(() => durationToPicker(data.duration));

  useEffect(() => {
    if (visible) {
      const initial = durationToPicker(data.duration);
      setDurValue(initial);
      // 미설정 상태면 기본값 즉시 반영
      if (!data.duration) {
        updateBottomSheetField('duration', pickerToDuration(initial));
      }
    }
  }, [visible]);

  if (!visible) return null;

  const handleChange = (val) => {
    setDurValue(val);
    const total = pickerToDuration(val);
    updateBottomSheetField('duration', total > 0 ? total : null);
  };

  const handleClear = () => {
    updateBottomSheetField('duration', null);
    onClose();
  };

  return (
    <>
      <div className="popup-overlay" onClick={onClose}></div>
      <div className="context-popup" data-popup="duration" style={style}>
        <div className="popup-content">
          <div className="drum-picker-wrapper">
            <Picker value={durValue} onChange={handleChange} wheelMode="natural" height={180} itemHeight={44}>
              <Picker.Column name="dHour">
                {durationHours.map(v => (
                  <Picker.Item key={v} value={v}>
                    {({ selected }) => <span className={selected ? 'drum-item selected' : 'drum-item'}>{v}시간</span>}
                  </Picker.Item>
                ))}
              </Picker.Column>
              <Picker.Column name="dMinute">
                {durationMins.map(v => (
                  <Picker.Item key={v} value={v}>
                    {({ selected }) => <span className={selected ? 'drum-item selected' : 'drum-item'}>{v}분</span>}
                  </Picker.Item>
                ))}
              </Picker.Column>
            </Picker>
          </div>
        </div>
        <div className="popup-footer">
          <button className="popup-clear-btn" onClick={handleClear}>
            없음
          </button>
        </div>
      </div>
    </>
  );
}
