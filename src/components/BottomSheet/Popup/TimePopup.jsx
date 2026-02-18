import { useState, useEffect } from 'react';
import Picker from 'react-mobile-picker';
import useTodoStore from '../../../store/useTodoStore';

const ampm = ['오전', '오후'];
const hours = ['1','2','3','4','5','6','7','8','9','10','11','12'];
const minutes = ['00','05','10','15','20','25','30','35','40','45','50','55'];
const durationHours = ['0','1','2','3','4'];
const durationMins = ['00','15','30','45'];

function timeStrToPicker(timeStr) {
  if (!timeStr || timeStr === 'none') return { ampm: '오전', hour: '8', minute: '00' };
  const [h, m] = timeStr.split(':').map(Number);
  const isPM = h >= 12;
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
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

function durationToPicker(durationMinsVal) {
  if (!durationMinsVal) return { dHour: '0', dMinute: '30' };
  const h = Math.floor(durationMinsVal / 60);
  const m = durationMinsVal % 60;
  const snapH = durationHours.includes(String(h)) ? String(h) : '0';
  const snapM = durationMins.reduce((prev, cur) =>
    Math.abs(Number(cur) - m) < Math.abs(Number(prev) - m) ? cur : prev
  );
  return { dHour: snapH, dMinute: snapM };
}

function pickerToDuration({ dHour, dMinute }) {
  return Number(dHour) * 60 + Number(dMinute);
}

export default function TimePopup({ visible, onClose }) {
  const data = useTodoStore(state => state.bottomSheetData);
  const updateBottomSheetField = useTodoStore(state => state.updateBottomSheetField);

  const [timeValue, setTimeValue] = useState(() => timeStrToPicker(data.time));
  const [durValue, setDurValue] = useState(() => durationToPicker(data.duration));

  // 팝업 열릴 때 store의 현재 값을 즉시 반영
  useEffect(() => {
    if (visible) {
      setTimeValue(timeStrToPicker(data.time));
      setDurValue(durationToPicker(data.duration));
    }
  }, [visible]);

  if (!visible) return null;

  const handleTimeChange = (val) => {
    setTimeValue(val);
    updateBottomSheetField('time', pickerToTimeStr(val));
  };

  const handleDurChange = (val) => {
    setDurValue(val);
    const total = pickerToDuration(val);
    updateBottomSheetField('duration', total > 0 ? total : null);
  };

  const handleClearTime = () => {
    updateBottomSheetField('time', 'none');
    updateBottomSheetField('duration', null);
    onClose();
  };

  return (
    <>
      <div className="popup-overlay" onClick={onClose}></div>
      <div className="context-popup" data-popup="time">
        <div className="popup-content popup-content-row">
          <div className="time-popup-col">
            <div className="popup-col-label">시작 시간</div>
            <div className="drum-picker-wrapper">
              <Picker value={timeValue} onChange={handleTimeChange} wheelMode="natural" height={180} itemHeight={44}>
                <Picker.Column name="ampm">
                  {ampm.map(v => (
                    <Picker.Item key={v} value={v}>
                      {({ selected }) => <span className={selected ? 'drum-item selected' : 'drum-item'}>{v}</span>}
                    </Picker.Item>
                  ))}
                </Picker.Column>
                <Picker.Column name="hour">
                  {hours.map(v => (
                    <Picker.Item key={v} value={v}>
                      {({ selected }) => <span className={selected ? 'drum-item selected' : 'drum-item'}>{v}</span>}
                    </Picker.Item>
                  ))}
                </Picker.Column>
                <Picker.Column name="minute">
                  {minutes.map(v => (
                    <Picker.Item key={v} value={v}>
                      {({ selected }) => <span className={selected ? 'drum-item selected' : 'drum-item'}>{v}</span>}
                    </Picker.Item>
                  ))}
                </Picker.Column>
              </Picker>
            </div>
          </div>
          <div className="time-popup-divider" />
          <div className="time-popup-col">
            <div className="popup-col-label">소요 시간</div>
            <div className="drum-picker-wrapper">
              <Picker value={durValue} onChange={handleDurChange} wheelMode="natural" height={180} itemHeight={44}>
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
        </div>
        <div className="popup-footer">
          <button className="popup-clear-btn" onClick={handleClearTime}>
            시간 설정 없음
          </button>
        </div>
      </div>
    </>
  );
}
