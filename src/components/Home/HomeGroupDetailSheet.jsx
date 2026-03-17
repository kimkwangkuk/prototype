import { useState, useEffect } from 'react';
import { Clock, ChevronLeft, FileText } from 'lucide-react';
import useTodoStore from '../../store/useTodoStore';

function formatLabel(h, m) {
  const isPM = h >= 12;
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${isPM ? '오후' : '오전'} ${h12}:${String(m).padStart(2, '0')}`;
}

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path d="M2 5.5L4.5 8L9 3" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function StudyIcon({ size = 14, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path d="M7 2.99602C6.49326 2.23802 5.32556 1.75 3.98894 1.75C2.86104 1.75 1.77201 2.11629 1.12742 2.69577C0.947878 2.85722 0.875 3.08546 0.875 3.31342L0.875 11.7439C0.875037 11.92 1.09764 12.0279 1.27217 11.9471C2.01214 11.6042 2.97726 11.3997 3.98894 11.3997C5.14196 11.3997 6.25825 11.7557 7 12.25M7 2.99602V12.25M7 2.99602C7.50674 2.23802 8.67444 1.75 10.0111 1.75C11.139 1.75 12.228 2.11629 12.8726 2.69577C13.0521 2.85722 13.125 3.08546 13.125 3.31342V11.7439C13.125 11.92 12.9024 12.0279 12.7278 11.9471C11.9879 11.6042 11.0227 11.3997 10.0111 11.3997C8.85804 11.3997 7.74175 11.7557 7 12.25" stroke={color} strokeWidth="1"/>
    </svg>
  );
}

export default function HomeGroupDetailSheet({ group, onClose, onEditEvent }) {
  const [animate, setAnimate] = useState(false);
  const [selectedEv, setSelectedEv] = useState(null);
  const removeHomeEvent = useTodoStore(state => state.removeHomeEvent);
  const doneHomeEventIds = useTodoStore(state => state.doneHomeEventIds);
  const toggleHomeEventDone = useTodoStore(state => state.toggleHomeEventDone);

  useEffect(() => {
    if (group) setTimeout(() => setAnimate(true), 10);
    else {
      setAnimate(false);
      setSelectedEv(null);
    }
  }, [group]);

  const handleClose = () => {
    setSelectedEv(null);
    onClose();
  };

  if (!group) return null;

  const anchorEvent = group.events.find(ev => ev.isAnchor);
  const taskEvents = group.events.filter(ev => !ev.isAnchor);
  const doneCount = taskEvents.filter(ev => doneHomeEventIds.has(String(ev.id))).length;

  return (
    <>
      <div
        className="bottom-sheet-overlay"
        style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
        onClick={handleClose}
      />
      <div className={`bottom-sheet detail-sheet group-sheet${animate ? ' visible' : ''}`}>

        {/* Grabber — 목록 뷰에서만 노출 */}
        <div className={`group-sheet-grabber${selectedEv ? ' hidden' : ''}`}>
          <div className="toolbar-grabber-bar" />
        </div>

        {/* 앱바 */}
        <div className="group-sheet-appbar">
          <div className="group-sheet-appbar-side">
            {selectedEv && (
              <button className="group-sheet-back-btn" onClick={() => setSelectedEv(null)}>
                <ChevronLeft size={22} strokeWidth={2} />
              </button>
            )}
          </div>

          <div className="group-sheet-appbar-title">
            {selectedEv ? (
              <span>{selectedEv.title}</span>
            ) : anchorEvent ? (
              <span>{anchorEvent.title}</span>
            ) : (
              <span>할일 {doneCount}/{taskEvents.length}</span>
            )}
          </div>

          <div className="group-sheet-appbar-side group-sheet-appbar-side--right" />
        </div>

        {/* 구분선 */}
        <div className="group-sheet-divider" />

        {/* 슬라이딩 패널 */}
        <div className={`group-sheet-panels${selectedEv ? ' show-detail' : ''}`}>

          {/* 패널 1: 할일 목록 */}
          <div className="group-sheet-panel">
            <div className="group-event-list">
              {group.events.map(ev => {
                const isDone = doneHomeEventIds.has(String(ev.id));
                if (ev.isAnchor) {
                  return (
                    <div
                      key={ev.id}
                      className="group-event-item group-event-item-tappable"
                      onClick={() => setSelectedEv(ev)}
                    >
                      <div className="group-anchor-icon">
                        <StudyIcon size={14} color="rgba(0,0,0,0.6)" />
                      </div>
                      <div className="group-event-item-content">
                        <span className="group-event-item-title group-event-item-title--anchor">{ev.title}</span>
                        <div className="group-event-item-time">
                          <Clock size={12} strokeWidth={2} />
                          <span>{formatLabel(ev.startH, ev.startM)} – {formatLabel(ev.endH, ev.endM)}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <div
                    key={ev.id}
                    className="group-event-item group-event-item-tappable"
                    onClick={() => setSelectedEv(ev)}
                  >
                    <button
                      className={`group-todo-check${isDone ? ' checked' : ''}`}
                      onClick={e => { e.stopPropagation(); toggleHomeEventDone(ev.id); }}
                    >
                      {isDone && <CheckIcon />}
                    </button>
                    <div className="group-event-item-content">
                      <span className={`group-event-item-title${isDone ? ' done' : ''}`}>{ev.title}</span>
                      <div className="group-event-item-time">
                        <Clock size={12} strokeWidth={2} />
                        <span>{formatLabel(ev.startH, ev.startM)} – {formatLabel(ev.endH, ev.endM)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 패널 2: 할일 상세 */}
          <div className="group-sheet-panel">
            {selectedEv && (
              <>
                <div className="detail-sheet-meta">
                  <div className="detail-sheet-meta-row">
                    <Clock size={16} className="detail-meta-icon" strokeWidth={2} />
                    <span className="detail-meta-label">
                      {formatLabel(selectedEv.startH, selectedEv.startM)} – {formatLabel(selectedEv.endH, selectedEv.endM)}
                    </span>
                  </div>
                  {selectedEv.note && (
                    <div className="detail-sheet-meta-row">
                      <FileText size={16} className="detail-meta-icon" strokeWidth={2} />
                      <span className="detail-meta-label">{selectedEv.note}</span>
                    </div>
                  )}
                </div>
                <div className="detail-sheet-actions" style={{ marginTop: 16 }}>
                  {selectedEv.type === 'task' && (() => {
                    const isDone = doneHomeEventIds.has(String(selectedEv.id));
                    return (
                      <button
                        className={`detail-action-btn detail-action-done${isDone ? ' done' : ''}`}
                        onClick={() => toggleHomeEventDone(selectedEv.id)}
                      >
                        {isDone ? '완료됨' : '완료'}
                      </button>
                    );
                  })()}
                  {onEditEvent && (
                    <button
                      className="detail-action-btn detail-action-edit"
                      onClick={() => { onEditEvent(selectedEv); handleClose(); }}
                    >
                      편집
                    </button>
                  )}
                  {typeof selectedEv.id === 'number' && (
                    <button
                      className="detail-action-btn detail-action-delete"
                      onClick={() => { removeHomeEvent(selectedEv.id); handleClose(); }}
                    >
                      삭제
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
