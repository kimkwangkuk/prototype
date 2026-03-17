import { useState, useEffect, useRef } from 'react';
import Picker from 'react-mobile-picker';
import { Clock, FileText, Users, ArrowRight, ChevronDown } from 'lucide-react';
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

function toTimeStr(h, m) {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatLabelStr(t) {
  const [h, m] = t.split(':').map(Number);
  return formatLabel(h, m);
}

export default function HomeEventDetailSheet({ event, onClose }) {
  const [animate, setAnimate] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [timeField, setTimeField] = useState(null);
  const [pickerVal, setPickerVal] = useState({ time: '09:00' });
  const inputRef = useRef(null);

  const removeHomeEvent = useTodoStore(state => state.removeHomeEvent);
  const updateHomeEvent = useTodoStore(state => state.updateHomeEvent);

  useEffect(() => {
    if (event) setTimeout(() => setAnimate(true), 10);
    else {
      setAnimate(false);
      setEditMode(false);
    }
  }, [event]);

  if (!event) return null;

  const isDynamic = typeof event.id === 'number';

  const handleDelete = () => {
    removeHomeEvent(event.id);
    onClose();
  };

  const handleEditOpen = () => {
    setTitle(event.title);
    setStartTime(toTimeStr(event.startH, event.startM));
    setEndTime(toTimeStr(event.endH, event.endM));
    setTimeField(null);
    setEditMode(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleEditCancel = () => {
    setEditMode(false);
    setTimeField(null);
    inputRef.current?.blur();
  };

  const handleEditSave = () => {
    if (!title.trim()) return;
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    updateHomeEvent(event.id, { title: title.trim(), startH: sh, startM: sm, endH: eh, endM: em });
    setEditMode(false);
    setTimeField(null);
    inputRef.current?.blur();
    onClose();
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
            {editMode ? (
              <button
                className="group-sheet-close-btn"
                style={{ color: title.trim() && isEndValid ? 'rgba(0,0,0,0.86)' : 'rgba(0,0,0,0.25)', fontWeight: 600 }}
                onClick={handleEditSave}
                disabled={!title.trim() || !isEndValid}
              >
                저장
              </button>
            ) : null}
          </div>
        </div>

        <div className="group-sheet-divider" />

        {editMode ? (
          <div className="event-detail-panel">
            {/* 이름 편집 */}
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

            {/* 시간 편집 */}
            <div className="hep-section hep-time-row">
              <Clock size={14} color="rgba(0,0,0,0.35)" strokeWidth={2} style={{ flexShrink: 0 }} />
              <button
                className={`hep-time-btn${timeField === 'start' ? ' active' : ''}`}
                onClick={() => handleTimeTap('start')}
              >
                {formatLabelStr(startTime)}
                <ChevronDown size={12} strokeWidth={2} style={{ marginLeft: 2, opacity: 0.4 }} />
              </button>
              <ArrowRight size={13} color="rgba(0,0,0,0.25)" strokeWidth={2} style={{ flexShrink: 0 }} />
              <button
                className={`hep-time-btn${timeField === 'end' ? ' active' : ''}${!isEndValid ? ' invalid' : ''}`}
                onClick={() => handleTimeTap('end')}
              >
                {formatLabelStr(endTime)}
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

            {isDynamic && (
              <div className="detail-sheet-actions" style={{ marginTop: 16 }}>
                <button className="detail-action-btn detail-action-edit" onClick={handleEditOpen}>
                  편집
                </button>
                <button className="detail-action-btn detail-action-delete" onClick={handleDelete}>
                  삭제
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </>
  );
}
