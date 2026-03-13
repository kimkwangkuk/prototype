import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import Picker from 'react-mobile-picker';
import { Clock, ArrowRight, Target, Square } from 'lucide-react';
import KeypadPopup from '../BottomSheet/Popup/KeypadPopup';
import useTodoStore from '../../store/useTodoStore';

// 10분 단위 타임슬롯
const timeSlots = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 10) {
    timeSlots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
}

function snapSlot(t) {
  if (!t) return '09:00';
  const [h, m] = t.split(':').map(Number);
  const snapped = Math.round(m / 10) * 10;
  const mm = snapped >= 60 ? 0 : snapped;
  const hh = snapped >= 60 ? (h + 1) % 24 : h;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function addHour(t, hours = 1) {
  const [h, m] = t.split(':').map(Number);
  return `${String((h + hours) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatLabel(t) {
  const [h, m] = t.split(':').map(Number);
  const isPM = h >= 12;
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${isPM ? '오후' : '오전'} ${h12}:${String(m).padStart(2, '0')}`;
}

export default function HomeEventSheet() {
  const visible = useTodoStore(state => state.homeSheetVisible);
  const closeHomeSheet = useTodoStore(state => state.closeHomeSheet);
  const addHomeEvent = useTodoStore(state => state.addHomeEvent);
  const homeSheetInitialStart = useTodoStore(state => state.homeSheetInitialStart);
  const homeSheetInitialEnd = useTodoStore(state => state.homeSheetInitialEnd);

  const [animate, setAnimate] = useState(false);
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('focus'); // 'focus' | 'task'
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [timeField, setTimeField] = useState(null); // 'start' | 'end' | null
  const [pickerVal, setPickerVal] = useState({ time: '09:00' });
  const keypadRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setTimeout(() => setAnimate(true), 10);
      setTitle('');
      setEventType('focus');
      setStartTime(homeSheetInitialStart || '09:00');
      setEndTime(homeSheetInitialEnd || '10:00');
      setTimeField(null);
    } else {
      setAnimate(false);
    }
  }, [visible]);

  // 키패드 높이를 CSS 변수로 설정 → 바텀시트가 키패드 위로 올라감
  useLayoutEffect(() => {
    if (!visible) return;
    const update = () => {
      const h = keypadRef.current?.offsetHeight || 0;
      document.documentElement.style.setProperty('--keypad-h', `${h}px`);
    };
    update();
    document.body.classList.add('keyboard-open');
    return () => {
      document.body.classList.remove('keyboard-open');
      document.documentElement.style.setProperty('--keypad-h', '0px');
    };
  }, [visible]);

  if (!visible) return null;

  const handleConfirm = () => {
    if (timeField) {
      // 시간 피커 닫고 제목 입력으로 복귀 (키패드는 유지)
      setTimeField(null);
      return;
    }
    if (title.trim()) {
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      addHomeEvent({ id: Date.now(), title, startH: sh, startM: sm, endH: eh, endM: em, type: eventType });
    }
    closeHomeSheet();
  };

  const handleOverlay = () => {
    if (timeField) { setTimeField(null); return; }
    closeHomeSheet();
  };

  const handleTimeTap = (field) => {
    const t = field === 'start' ? startTime : endTime;
    setTimeField(field);
    setPickerVal({ time: snapSlot(t) });
  };

  const handlePickerChange = (val) => {
    setPickerVal(val);
    if (timeField === 'start') {
      setStartTime(val.time);
      const [sh, sm] = val.time.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      if (sh * 60 + sm >= eh * 60 + em) setEndTime(addHour(val.time, 1));
    } else {
      setEndTime(val.time);
    }
  };

  return (
    <>
      <div className="bottom-sheet-overlay" onClick={handleOverlay} />
      <div className={`bottom-sheet home-event-sheet${animate ? ' visible' : ''}`}>
        <div className="toolbar-surface" />

        {/* 그래버 */}
        <div className="toolbar-grabber">
          <svg width="36" height="4" viewBox="0 0 36 4" fill="none">
            <rect width="36" height="4" rx="2" fill="rgba(0,0,0,0.18)" />
          </svg>
        </div>

        {/* 일정 이름 입력 */}
        <div className="home-event-title-row">
          <input
            type="text"
            inputMode="none"
            readOnly
            tabIndex={-1}
            className="home-event-title-input"
            value={title}
            placeholder="일정 이름"
            style={{ pointerEvents: 'none' }}
          />
        </div>

        {/* 타입 선택 */}
        <div className="home-event-type-row">
          {[
            { value: 'focus', label: '집중계획', Icon: Target },
            { value: 'task',  label: '할일',    Icon: Square },
          ].map(({ value, label, Icon }) => (
            <button
              key={value}
              className={`home-event-type-btn${eventType === value ? ' active' : ''}`}
              onMouseDown={e => e.preventDefault()}
              onTouchStart={e => e.preventDefault()}
              onTouchEnd={e => { e.preventDefault(); setEventType(value); }}
              onClick={() => setEventType(value)}
            >
              <Icon size={13} strokeWidth={1.8} />
              {label}
            </button>
          ))}
        </div>

        {/* 시간 선택 행 */}
        <div className="home-event-time-row">
          <Clock size={14} color="rgba(0,0,0,0.35)" strokeWidth={2} style={{ flexShrink: 0 }} />
          <button
            className={`home-event-time-btn${timeField === 'start' ? ' active' : ''}`}
            onMouseDown={e => e.preventDefault()}
            onTouchStart={e => e.preventDefault()}
            onTouchEnd={e => { e.preventDefault(); handleTimeTap('start'); }}
            onClick={() => handleTimeTap('start')}
          >
            {formatLabel(startTime)}
          </button>
          <ArrowRight size={13} color="rgba(0,0,0,0.25)" strokeWidth={2} style={{ flexShrink: 0 }} />
          <button
            className={`home-event-time-btn${timeField === 'end' ? ' active' : ''}`}
            onMouseDown={e => e.preventDefault()}
            onTouchStart={e => e.preventDefault()}
            onTouchEnd={e => { e.preventDefault(); handleTimeTap('end'); }}
            onClick={() => handleTimeTap('end')}
          >
            {formatLabel(endTime)}
          </button>
        </div>

        {/* 인라인 드럼 피커 (시간 필드 선택시, 키패드는 유지) */}
        {timeField && (
          <div className="home-event-picker">
            <div className="home-event-picker-label">
              {timeField === 'start' ? '시작 시간' : '종료 시간'}
            </div>
            <div className="drum-picker-wrapper">
              <Picker
                value={pickerVal}
                onChange={handlePickerChange}
                wheelMode="natural"
                height={160}
                itemHeight={44}
              >
                <Picker.Column name="time">
                  {timeSlots.map(v => (
                    <Picker.Item key={v} value={v}>
                      {({ selected }) => (
                        <span className={selected ? 'drum-item selected' : 'drum-item'}>
                          {formatLabel(v)}
                        </span>
                      )}
                    </Picker.Item>
                  ))}
                </Picker.Column>
              </Picker>
            </div>
          </div>
        )}
      </div>

      {/* 키패드: 시간 피커 열려있어도 항상 유지 */}
      <KeypadPopup
        ref={keypadRef}
        visible
        value={title}
        onChange={timeField ? undefined : setTitle}
        onConfirm={handleConfirm}
      />
    </>
  );
}
