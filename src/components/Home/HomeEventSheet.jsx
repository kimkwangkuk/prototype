import { useState, useEffect, useRef } from 'react';
import Picker from 'react-mobile-picker';
import { Clock, ArrowRight, Target, Square, ChevronDown } from 'lucide-react';

function StudyIcon({ size = 14, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path d="M7 2.99602C6.49326 2.23802 5.32556 1.75 3.98894 1.75C2.86104 1.75 1.77201 2.11629 1.12742 2.69577C0.947878 2.85722 0.875 3.08546 0.875 3.31342L0.875 11.7439C0.875037 11.92 1.09764 12.0279 1.27217 11.9471C2.01214 11.6042 2.97726 11.3997 3.98894 11.3997C5.14196 11.3997 6.25825 11.7557 7 12.25M7 2.99602V12.25M7 2.99602C7.50674 2.23802 8.67444 1.75 10.0111 1.75C11.139 1.75 12.228 2.11629 12.8726 2.69577C13.0521 2.85722 13.125 3.08546 13.125 3.31342V11.7439C13.125 11.92 12.9024 12.0279 12.7278 11.9471C11.9879 11.6042 11.0227 11.3997 10.0111 11.3997C8.85804 11.3997 7.74175 11.7557 7 12.25" stroke={color} strokeWidth="1"/>
    </svg>
  );
}
import useTodoStore from '../../store/useTodoStore';

// 타임라인은 AM5 기준 0~1440분. 자정(00:00)은 1140분 → 저녁 이후 시간보다 큼
const TIMELINE_START_H = 5;
function toTimelineMins(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  let offset = h - TIMELINE_START_H;
  if (offset < 0) offset += 24;
  return offset * 60 + m;
}

// 00:00~04:50 → "다음날" 레이블 추가
function formatLabel(t) {
  const [h, m] = t.split(':').map(Number);
  const isPM = h >= 12;
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const base = `${isPM ? '오후' : '오전'} ${h12}:${String(m).padStart(2, '0')}`;
  return h < TIMELINE_START_H ? `${base} (다음날)` : base;
}

const timeSlots = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 10) {
    timeSlots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
}

// AM5 기준으로 정렬된 슬롯 순서 (5:00 → 4:50)
const sortedTimeSlots = [
  ...timeSlots.filter(t => parseInt(t) >= TIMELINE_START_H),
  ...timeSlots.filter(t => parseInt(t) < TIMELINE_START_H),
];

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

export default function HomeEventSheet() {
  const visible = useTodoStore(state => state.homeSheetVisible);
  const closeHomeSheet = useTodoStore(state => state.closeHomeSheet);
  const addHomeEvent = useTodoStore(state => state.addHomeEvent);
  const homeSheetInitialStart = useTodoStore(state => state.homeSheetInitialStart);
  const homeSheetInitialEnd = useTodoStore(state => state.homeSheetInitialEnd);

  const [mounted, setMounted] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('focus');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [timeField, setTimeField] = useState(null);
  const [pickerVal, setPickerVal] = useState({ time: '09:00' });
  const inputRef = useRef(null);

  useEffect(() => {
    if (visible) {
      const initStart = homeSheetInitialStart || '09:00';
      // 종료 시간이 시작 시간 이전이면 시작+1시간으로 보정
      let initEnd = homeSheetInitialEnd || addHour(initStart, 1);
      if (toTimelineMins(initEnd) <= toTimelineMins(initStart)) {
        initEnd = addHour(initStart, 1);
      }
      setTitle('');
      setEventType('focus');
      setStartTime(initStart);
      setEndTime(initEnd);
      setTimeField(null);
      setMounted(true);
      // 포커스를 먼저 → iOS가 유저 제스처로 인식해 키보드 표시
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        requestAnimationFrame(() => setAnimate(true));
      });
    } else {
      // 닫힐 때 키보드 해제 + keyboard-open 클래스 명시적 제거 → 탭바 복원
      inputRef.current?.blur();
      document.body.classList.remove('keyboard-open');
      setAnimate(false);
      const t = setTimeout(() => setMounted(false), 350);
      return () => clearTimeout(t);
    }
  }, [visible]);

  if (!mounted) return null;

  const handleSave = () => {
    if (title.trim()) {
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      addHomeEvent({ id: Date.now(), title, startH: sh, startM: sm, endH: eh, endM: em, type: eventType });
    }
    closeHomeSheet();
  };

  const handleTimeTap = (field) => {
    inputRef.current?.blur();
    const t = field === 'start' ? startTime : endTime;
    setTimeField(prev => prev === field ? null : field);
    setPickerVal({ time: snapSlot(t) });
  };

  const handlePickerChange = (val) => {
    setPickerVal(val);
    if (timeField === 'start') {
      setStartTime(val.time);
      // 타임라인 기준으로 종료가 시작 이후인지 확인 (자정 포함)
      if (toTimelineMins(endTime) <= toTimelineMins(val.time)) {
        setEndTime(addHour(val.time, 1));
      }
    } else {
      setEndTime(val.time);
    }
  };

  const isEndValid = toTimelineMins(endTime) > toTimelineMins(startTime);

  return (
    <>
      <div
        className="bottom-sheet-overlay"
        style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
        onClick={closeHomeSheet}
      />
      <div className={`home-event-page${animate ? ' visible' : ''}`}>
        {/* 그래버 */}
        <div className="toolbar-grabber">
          <div className="toolbar-grabber-bar" />
        </div>
        {/* 헤더 */}
        <div className="hep-header">
          <button className="hep-cancel-btn" onClick={closeHomeSheet}>취소</button>
          <span className="hep-header-title">새 일정</span>
          <button className="hep-save-btn" onClick={handleSave} disabled={!title.trim() || !isEndValid}>저장</button>
        </div>

        {/* 본문 */}
        <div className="hep-body">
          {/* 일정 이름 */}
          <div className="hep-section">
            <input
              ref={inputRef}
              type="text"
              className="hep-title-input"
              placeholder="일정 이름"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
            />
          </div>

          {/* 타입 선택 */}
          <div className="hep-section hep-type-row">
            {[
              { value: 'focus', label: '집중계획', Icon: Target   },
              { value: 'study', label: '공부시간', Icon: StudyIcon },
              { value: 'task',  label: '할일',    Icon: Square  },
            ].map(({ value, label, Icon }) => (
              <button
                key={value}
                className={`hep-type-btn${eventType === value ? ' active' : ''}`}
                onClick={() => setEventType(value)}
              >
                <Icon size={13} strokeWidth={1.8} />
                {label}
              </button>
            ))}
          </div>

          {/* 시간 설정 */}
          <div className="hep-section hep-time-row">
            <Clock size={14} color="rgba(0,0,0,0.35)" strokeWidth={2} style={{ flexShrink: 0 }} />
            <button
              className={`hep-time-btn${timeField === 'start' ? ' active' : ''}`}
              onClick={() => handleTimeTap('start')}
            >
              {formatLabel(startTime)}
              <ChevronDown size={12} strokeWidth={2} style={{ marginLeft: 2, opacity: 0.4 }} />
            </button>
            <ArrowRight size={13} color="rgba(0,0,0,0.25)" strokeWidth={2} style={{ flexShrink: 0 }} />
            <button
              className={`hep-time-btn${timeField === 'end' ? ' active' : ''}${!isEndValid ? ' invalid' : ''}`}
              onClick={() => handleTimeTap('end')}
            >
              {formatLabel(endTime)}
              <ChevronDown size={12} strokeWidth={2} style={{ marginLeft: 2, opacity: 0.4 }} />
            </button>
          </div>

          {/* 드럼 피커 */}
          {timeField && (
            <div className="hep-picker-section">
              <div className="hep-picker-label">
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
                    {sortedTimeSlots.map(v => (
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
      </div>
    </>
  );
}
