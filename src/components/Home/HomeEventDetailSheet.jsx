import { useState, useEffect, useRef, memo } from 'react';
import { Clock, FileText, Users } from 'lucide-react';
import KeypadPopup from '../BottomSheet/Popup/KeypadPopup';
import useTodoStore from '../../store/useTodoStore';

const TIMELINE_START_H = 5;
function toTimelineMins(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  let offset = h - TIMELINE_START_H;
  if (offset < 0) offset += 24;
  return offset * 60 + m;
}

function addHour(t, hours = 1) {
  const [h, m] = t.split(':').map(Number);
  return `${String((h + hours) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function snapSlot(t) {
  if (!t) return '09:00';
  const [h, m] = t.split(':').map(Number);
  const snapped = Math.round(m / 10) * 10;
  const mm = snapped >= 60 ? 0 : snapped;
  const hh = snapped >= 60 ? (h + 1) % 24 : h;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

const timeSlots = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 10) {
    timeSlots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
}
const sortedTimeSlots = [
  ...timeSlots.filter(t => parseInt(t) >= TIMELINE_START_H),
  ...timeSlots.filter(t => parseInt(t) < TIMELINE_START_H),
];

function formatLabel(h, m) {
  const isPM = h >= 12;
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${isPM ? '오후' : '오전'} ${h12}:${String(m).padStart(2, '0')}`;
}

function formatLabelStr(t) {
  const [h, m] = t.split(':').map(Number);
  return formatLabel(h, m);
}

function toTimeStr(h, m) {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

const HOUR_HEIGHT = 60;
const TIMELINE_START_H_SCROLL = 5;

function scrollTimelineToTime(timeStr) {
  const scrollEl = document.querySelector('.home-view');
  const headerEl = document.querySelector('.header');
  const sheetEl = document.querySelector('.detail-sheet');
  if (!scrollEl || !headerEl) return;
  const [h, m] = timeStr.split(':').map(Number);
  const offsetH = ((h - TIMELINE_START_H_SCROLL + 24) % 24);
  const timeTop = offsetH * HOUR_HEIGHT + (m / 60) * HOUR_HEIGHT;
  const headerBottom = headerEl.getBoundingClientRect().bottom;
  const sheetTop = sheetEl ? sheetEl.getBoundingClientRect().top : window.innerHeight;
  const visibleHeight = sheetTop - headerBottom;
  const containerTop = scrollEl.getBoundingClientRect().top;
  const targetScrollTop = timeTop - (visibleHeight / 2) + (headerBottom - containerTop);
  scrollEl.scrollTo({ top: Math.max(0, targetScrollTop), behavior: 'smooth' });
}

// ─── 커스텀 드럼 피커 ───
const ITEM_H = 44;
const PICKER_H = 160;
const PICKER_PAD = (PICKER_H - ITEM_H) / 2; // 58px

const DrumPicker = memo(function DrumPicker({ options, value, onChange }) {
  const scrollRef = useRef(null);
  const prevValueRef = useRef(value);
  const rafRef = useRef(null);

  // 초기 위치 및 외부에서 value 바뀔 때 스크롤 동기화
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = options.indexOf(value);
    if (idx === -1) return;
    // 이미 해당 위치면 스킵 (스크롤 중 외부 업데이트 무시)
    if (Math.round(el.scrollTop / ITEM_H) === idx) return;
    el.scrollTop = idx * ITEM_H;
    prevValueRef.current = value;
  }, [value, options]);

  const handleScroll = () => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (!el) return;
      const idx = Math.round(el.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(idx, options.length - 1));
      const v = options[clamped];
      if (v !== prevValueRef.current) {
        prevValueRef.current = v;
        onChange(v);
      }
    });
  };

  return (
    <div style={{ position: 'relative', height: PICKER_H, overflow: 'hidden' }}>
      {/* 선택 영역 표시선 */}
      <div style={{
        position: 'absolute', top: PICKER_PAD, left: 0, right: 0,
        height: ITEM_H, pointerEvents: 'none', zIndex: 1,
        borderTop: '1px solid rgba(0,0,0,0.1)',
        borderBottom: '1px solid rgba(0,0,0,0.1)',
      }} />
      {/* 상단 페이드 */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: PICKER_PAD,
        background: 'linear-gradient(to bottom, #fff 30%, rgba(255,255,255,0))',
        pointerEvents: 'none', zIndex: 1,
      }} />
      {/* 하단 페이드 */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: PICKER_PAD,
        background: 'linear-gradient(to top, #fff 30%, rgba(255,255,255,0))',
        pointerEvents: 'none', zIndex: 1,
      }} />
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="drum-picker-scroll"
        style={{
          height: PICKER_H,
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          paddingTop: PICKER_PAD,
          paddingBottom: PICKER_PAD,
          boxSizing: 'content-box',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {options.map(opt => (
          <div
            key={opt}
            style={{
              height: ITEM_H,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              scrollSnapAlign: 'center',
              flexShrink: 0,
            }}
          >
            <span className={opt === value ? 'drum-item selected' : 'drum-item'}>
              {formatLabelStr(opt)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

const HomeEventDetailSheet = memo(function HomeEventDetailSheet({ event, onClose }) {
  const [animate, setAnimate] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [activeField, setActiveField] = useState(null); // 'title' | 'start' | 'end'
  const [pickerTime, setPickerTime] = useState('09:00');

  const keypadRef = useRef(null);
  const startTimeRef = useRef(startTime);
  const endTimeRef = useRef(endTime);
  const eventRef = useRef(event);
  const activeFieldRef = useRef(activeField);

  useEffect(() => { startTimeRef.current = startTime; }, [startTime]);
  useEffect(() => { endTimeRef.current = endTime; }, [endTime]);
  useEffect(() => { eventRef.current = event; }, [event]);
  useEffect(() => { activeFieldRef.current = activeField; }, [activeField]);

  const removeHomeEvent = useTodoStore(state => state.removeHomeEvent);
  const updateHomeEvent = useTodoStore(state => state.updateHomeEvent);
  const setPreviewHomeEvent = useTodoStore(state => state.setPreviewHomeEvent);
  const clearPreviewHomeEvent = useTodoStore(state => state.clearPreviewHomeEvent);

  useEffect(() => {
    if (event) {
      setTimeout(() => setAnimate(true), 10);
      setTimeout(() => scrollTimelineToTime(toTimeStr(event.startH, event.startM)), 380);
    } else {
      setAnimate(false);
      setEditMode(false);
      clearPreviewHomeEvent();
    }
  }, [event]);

  // 커스텀 키패드 높이 → CSS 변수로 바텀시트 밀어올리기
  useEffect(() => {
    const isKeypad = editMode && activeField === 'title';

    const apply = () => {
      const h = isKeypad && keypadRef.current ? keypadRef.current.offsetHeight : 0;
      document.documentElement.style.setProperty('--keypad-h', `${h}px`);
    };

    if (isKeypad) {
      document.body.classList.add('home-keypad-open');
      requestAnimationFrame(() => requestAnimationFrame(apply));
    } else {
      document.body.classList.remove('home-keypad-open');
      document.documentElement.style.setProperty('--keypad-h', '0px');
    }

    return () => {
      document.body.classList.remove('home-keypad-open');
      document.documentElement.style.setProperty('--keypad-h', '0px');
    };
  }, [editMode, activeField]);

  // 시작 시간 탭 시 타임라인 스크롤
  useEffect(() => {
    if (activeField === 'start') {
      requestAnimationFrame(() => requestAnimationFrame(() => scrollTimelineToTime(startTimeRef.current)));
    }
  }, [activeField]);

  if (!event) return null;

  const isEndValid = toTimelineMins(endTime) > toTimelineMins(startTime);

  const handleDelete = () => {
    removeHomeEvent(event.id);
    onClose();
  };

  const handleEditOpen = () => {
    const st = toTimeStr(event.startH, event.startM);
    setTitle(event.title);
    setStartTime(st);
    setEndTime(toTimeStr(event.endH, event.endM));
    setActiveField('title');
    setEditMode(true);
    requestAnimationFrame(() => requestAnimationFrame(() => scrollTimelineToTime(st)));
  };

  const handleEditCancel = () => {
    clearPreviewHomeEvent();
    setEditMode(false);
    setActiveField(null);
  };

  const handleEditSave = () => {
    if (!title.trim() || !isEndValid) return;
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    updateHomeEvent(event.id, { title: title.trim(), startH: sh, startM: sm, endH: eh, endM: em });
    clearPreviewHomeEvent();
    setEditMode(false);
    setActiveField(null);
    onClose();
  };

  const handleTimeTap = (field) => {
    const t = field === 'start' ? startTime : endTime;
    setPickerTime(snapSlot(t));
    setActiveField(prev => prev === field ? null : field);
  };

  // 피커에서 시간 변경될 때마다 즉시 호출 (스크롤 이벤트마다)
  const handlePickerChange = (newTime) => {
    setPickerTime(newTime);
    let newStart = startTimeRef.current;
    let newEnd = endTimeRef.current;
    if (activeFieldRef.current === 'start') {
      newStart = newTime;
      scrollTimelineToTime(newTime);
      if (toTimelineMins(endTimeRef.current) <= toTimelineMins(newTime)) {
        newEnd = addHour(newTime, 1);
      }
      setStartTime(newStart);
      setEndTime(newEnd);
    } else {
      newEnd = newTime;
      scrollTimelineToTime(newTime);
      setEndTime(newEnd);
    }
    const [sh, sm] = newStart.split(':').map(Number);
    const [eh, em] = newEnd.split(':').map(Number);
    setPreviewHomeEvent({ ...eventRef.current, startH: sh, startM: sm, endH: eh, endM: em });
  };

  return (
    <>
      <div
        className="bottom-sheet-overlay"
        style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
        onClick={editMode ? handleEditCancel : onClose}
      />

      <div className={`bottom-sheet detail-sheet group-sheet${animate ? ' visible' : ''}`}>

        <div className="group-sheet-grabber">
          <div className="toolbar-grabber-bar" />
        </div>

        <div className="group-sheet-appbar">
          <div className="group-sheet-appbar-side">
            {editMode && (
              <button className="group-sheet-close-btn" onClick={handleEditCancel}>취소</button>
            )}
          </div>
          <div className="group-sheet-appbar-title">
            <span>{editMode ? '편집' : event.title}</span>
          </div>
          <div className="group-sheet-appbar-side group-sheet-appbar-side--right">
            {editMode && (
              <button
                className="group-sheet-close-btn"
                style={{ color: title.trim() && isEndValid ? 'rgba(0,0,0,0.86)' : 'rgba(0,0,0,0.25)', fontWeight: 600 }}
                onClick={handleEditSave}
                disabled={!title.trim() || !isEndValid}
              >
                저장
              </button>
            )}
          </div>
        </div>

        <div className="group-sheet-divider" />

        {editMode ? (
          <div className="event-detail-panel">
            {/* 제목 필드 */}
            <div
              className={`home-sheet-field-row${activeField === 'title' ? ' active' : ''}`}
              onClick={() => setActiveField('title')}
            >
              <span className="home-sheet-field-label">제목</span>
              <span className={`home-sheet-field-value${!title ? ' placeholder' : ''}`}>
                {title || '일정 이름 입력'}
              </span>
            </div>

            {/* 시작/종료 시간 (좌우 나란히) */}
            <div className="home-sheet-time-row">
              <div
                className={`home-sheet-time-cell${activeField === 'start' ? ' active' : ''}`}
                onClick={() => handleTimeTap('start')}
              >
                <span className="home-sheet-field-label">시작</span>
                <span className="home-sheet-field-value">{formatLabelStr(startTime)}</span>
              </div>
              <div className="home-sheet-time-divider" />
              <div
                className={`home-sheet-time-cell${activeField === 'end' ? ' active' : ''}${!isEndValid ? ' error' : ''}`}
                onClick={() => handleTimeTap('end')}
              >
                <span className="home-sheet-field-label">종료</span>
                <span className={`home-sheet-field-value${!isEndValid ? ' error' : ''}`}>{formatLabelStr(endTime)}</span>
              </div>
            </div>

            {/* 드럼 피커 */}
            {(activeField === 'start' || activeField === 'end') && (
              <div className="hep-picker-section">
                <DrumPicker
                  options={sortedTimeSlots}
                  value={pickerTime}
                  onChange={handlePickerChange}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="event-detail-panel">
            <div className="detail-sheet-meta">
              <div className="detail-sheet-meta-row">
                <Clock size={16} className="detail-meta-icon" strokeWidth={2} />
                <span className="detail-meta-label">
                  {formatLabel(event.startH, event.startM)} – {formatLabel(event.endH, event.endM)}
                </span>
              </div>
              {event.todoCount && (
                <div className="detail-sheet-meta-row">
                  <Users size={16} className="detail-meta-icon" strokeWidth={2} />
                  <span className="detail-meta-label">할 일 {event.todoCount}개</span>
                </div>
              )}
              {event.note && (
                <div className="detail-sheet-meta-row">
                  <FileText size={16} className="detail-meta-icon" strokeWidth={2} />
                  <span className="detail-meta-label">{event.note}</span>
                </div>
              )}
            </div>

            <div className="detail-sheet-actions" style={{ marginTop: 16 }}>
              <button className="detail-action-btn detail-action-edit" onClick={handleEditOpen}>
                편집
              </button>
              <button className="detail-action-btn detail-action-delete" onClick={handleDelete}>
                삭제
              </button>
            </div>
          </div>
        )}

      </div>

      {/* 커스텀 QWERTY 키패드 */}
      <KeypadPopup
        ref={keypadRef}
        visible={editMode && activeField === 'title'}
        value={title}
        onChange={setTitle}
        onConfirm={() => handleTimeTap('start')}
      />
    </>
  );
});

export default HomeEventDetailSheet;
