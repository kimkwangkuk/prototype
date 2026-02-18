import { useState, useEffect } from 'react';
import Picker from 'react-mobile-picker';
import useTodoStore from '../../../store/useTodoStore';

const hours = ['1','2','3','4','5','6','7','8','9','10','11','12'];
const minutes = ['00','05','10','15','20','25','30','35','40','45','50','55'];
const ampm = ['오전','오후'];

const durations = [
  { value: 30, label: '30분' },
  { value: 60, label: '1시간' },
  { value: 90, label: '1시간 30분' },
  { value: 120, label: '2시간' },
];

function timeStrToPicker(timeStr) {
  if (!timeStr) return { ampm: '오전', hour: '8', minute: '00' };
  const [h, m] = timeStr.split(':').map(Number);
  const isPM = h >= 12;
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const minStr = String(m).padStart(2, '0');
  const snapMin = minutes.reduce((prev, cur) =>
    Math.abs(Number(cur) - m) < Math.abs(Number(prev) - m) ? cur : prev
  );
  return { ampm: isPM ? '오후' : '오전', hour: String(hour12), minute: snapMin };
}

function pickerToTimeStr({ ampm: ap, hour, minute }) {
  let h = Number(hour);
  if (ap === '오전' && h === 12) h = 0;
  if (ap === '오후' && h !== 12) h += 12;
  return `${String(h).padStart(2, '0')}:${minute}`;
}

export default function TimePopup({ visible, onClose }) {
  const data = useTodoStore(state => state.bottomSheetData);
  const updateBottomSheetField = useTodoStore(state => state.updateBottomSheetField);

  const [pickerValue, setPickerValue] = useState(() => timeStrToPicker(data.time));

  useEffect(() => {
    if (visible) {
      setPickerValue(timeStrToPicker(data.time));
    }
  }, [visible]);

  if (!visible) return null;

  const handlePickerChange = (newValue) => {
    setPickerValue(newValue);
    updateBottomSheetField('time', pickerToTimeStr(newValue));
  };

  const handleDurationSelect = (duration) => {
    updateBottomSheetField('duration', duration);
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
          <div className="drum-picker-wrapper">
            <Picker
              value={pickerValue}
              onChange={handlePickerChange}
              wheelMode="natural"
              height={180}
              itemHeight={44}
            >
              <Picker.Column name="ampm">
                {ampm.map(v => (
                  <Picker.Item key={v} value={v}>
                    {({ selected }) => (
                      <span className={selected ? 'drum-item selected' : 'drum-item'}>{v}</span>
                    )}
                  </Picker.Item>
                ))}
              </Picker.Column>
              <Picker.Column name="hour">
                {hours.map(v => (
                  <Picker.Item key={v} value={v}>
                    {({ selected }) => (
                      <span className={selected ? 'drum-item selected' : 'drum-item'}>{v}</span>
                    )}
                  </Picker.Item>
                ))}
              </Picker.Column>
              <Picker.Column name="minute">
                {minutes.map(v => (
                  <Picker.Item key={v} value={v}>
                    {({ selected }) => (
                      <span className={selected ? 'drum-item selected' : 'drum-item'}>{v}</span>
                    )}
                  </Picker.Item>
                ))}
              </Picker.Column>
            </Picker>
          </div>
          <div className="popup-section-label">지속 시간</div>
          {durations.map(d => (
            <button
              key={d.value}
              className="popup-item"
              onClick={() => handleDurationSelect(d.value)}
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
