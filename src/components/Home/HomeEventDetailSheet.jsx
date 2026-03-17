import { useState, useEffect } from 'react';
import { Clock, FileText, Users } from 'lucide-react';
import useTodoStore from '../../store/useTodoStore';

function formatLabel(h, m) {
  const isPM = h >= 12;
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${isPM ? '오후' : '오전'} ${h12}:${String(m).padStart(2, '0')}`;
}

export default function HomeEventDetailSheet({ event, onClose }) {
  const [animate, setAnimate] = useState(false);
  const removeHomeEvent = useTodoStore(state => state.removeHomeEvent);

  useEffect(() => {
    if (event) setTimeout(() => setAnimate(true), 10);
    else setAnimate(false);
  }, [event]);

  if (!event) return null;

  const isDynamic = typeof event.id === 'number';

  const handleDelete = () => {
    removeHomeEvent(event.id);
    onClose();
  };

  return (
    <>
      <div
        className="bottom-sheet-overlay"
        style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
        onClick={onClose}
      />
      <div className={`bottom-sheet detail-sheet group-sheet${animate ? ' visible' : ''}`}>

        <div className="group-sheet-grabber">
          <div className="toolbar-grabber-bar" />
        </div>

        <div className="group-sheet-appbar">
          <div className="group-sheet-appbar-side" />
          <div className="group-sheet-appbar-title">
            <span>{event.title}</span>
          </div>
          <div className="group-sheet-appbar-side group-sheet-appbar-side--right">
            <button className="group-sheet-close-btn" onClick={onClose}>닫기</button>
          </div>
        </div>

        <div className="group-sheet-divider" />

        <div className="group-sheet-panel">
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
              <button className="detail-action-btn detail-action-delete" onClick={handleDelete}>
                삭제
              </button>
            </div>
          )}
        </div>

      </div>
    </>
  );
}
