import { useState, useEffect, useRef } from 'react';
import Picker from 'react-mobile-picker';
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

export default function HomeEventDetailSheet({ event, onClose }) {
  const [animate, setAnimate] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [activeField, setActiveField] = useState(null); // 'title' | 'start' | 'end'
  const [pickerVal, setPickerVal] = useState({ time: '09:00' });

  const keypadRef = useRef(null);

  const removeHomeEvent = useTodoStore(state => state.removeHomeEvent);
  const updateHomeEvent = useTodoStore(state => state.updateHomeEvent);
  const setPreviewHomeEvent = useTodoStore(state => state.setPreviewHomeEvent);
  const clearPreviewHomeEvent = useTodoStore(state => state.clearPreviewHomeEvent);

  useEffect(() => {
    if (event) setTimeout(() => setAnimate(true), 10);
    else {
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
      // 키패드가 DOM에 그려진 후 높이 읽기
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

  if (!event) return null;

  const isEndValid = toTimelineMins(endTime) > toTimelineMins(startTime);

  const handleDelete = () => {
    removeHomeEvent(event.id);
    onClose();
  };

  const handleEditOpen = () => {
    setTitle(event.title);
    setStartTime(toTimeStr(event.startH, event.startM));
    setEndTime(toTimeStr(event.endH, event.endM));
    setActiveField('title');
    setEditMode(true);
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
    setPickerVal({ time: snapSlot(t) });
    setActiveField(prev => prev === field ? null : field);
  };

  const handlePickerChange = (val) => {
    setPickerVal(val);
    let newStart = startTime;
    let newEnd = endTime;
    if (activeField === 'start') {
      newStart = val.time;
      if (toTimelineMins(endTime) <= toTimelineMins(val.time)) {
        newEnd = addHour(val.time, 1);
      }
      setStartTime(newStart);
      setEndTime(newEnd);
    } else {
      newEnd = val.time;
      setEndTime(newEnd);
    }
    // 타임라인 블록 실시간 반영
    const [sh, sm] = newStart.split(':').map(Number);
    const [eh, em] = newEnd.split(':').map(Number);
    setPreviewHomeEvent({ ...event, startH: sh, startM: sm, endH: eh, endM: em });
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
            {/* 제목 필드 (커스텀 키패드) */}
            <div
              className={`home-sheet-field-row${activeField === 'title' ? ' active' : ''}`}
              onClick={() => setActiveField('title')}
            >
              <span className="home-sheet-field-label">제목</span>
              <span className={`home-sheet-field-value${!title ? ' placeholder' : ''}`}>
                {title || '일정 이름 입력'}
              </span>
            </div>

            {/* 시작 시간 */}
            <div
              className={`home-sheet-field-row${activeField === 'start' ? ' active' : ''}`}
              onClick={() => handleTimeTap('start')}
            >
              <span className="home-sheet-field-label">시작</span>
              <span className="home-sheet-field-value">{formatLabelStr(startTime)}</span>
            </div>

            {/* 종료 시간 */}
            <div
              className={`home-sheet-field-row${activeField === 'end' ? ' active' : ''}${!isEndValid && activeField === 'end' ? ' error' : ''}`}
              onClick={() => handleTimeTap('end')}
            >
              <span className="home-sheet-field-label">종료</span>
              <span className={`home-sheet-field-value${!isEndValid ? ' error' : ''}`}>{formatLabelStr(endTime)}</span>
            </div>

            {/* 드럼 피커 */}
            {(activeField === 'start' || activeField === 'end') && (
              <div className="hep-picker-section">
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
                              {formatLabelStr(v)}
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
}
