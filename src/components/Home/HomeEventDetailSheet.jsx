import { useState, useEffect } from 'react';
import { Clock, FileText, Users, Trash2 } from 'lucide-react';
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

  // id가 숫자(timestamp)면 동적 이벤트, 문자열 'ev*'면 샘플
  const isDynamic = typeof event.id === 'number';

  const handleDelete = () => {
    removeHomeEvent(event.id);
    onClose();
  };

  return (
    <>
      <div className="bottom-sheet-overlay" onClick={onClose} />
      <div className={`bottom-sheet home-event-detail-sheet${animate ? ' visible' : ''}`}>
        <div className="toolbar-surface" />
        <div className="toolbar-grabber">
          <svg width="36" height="4" viewBox="0 0 36 4" fill="none">
            <rect width="36" height="4" rx="2" fill="rgba(0,0,0,0.18)" />
          </svg>
        </div>

        <div className="hed-title-row">
          <span className="hed-title">{event.title}</span>
        </div>

        <div className="hed-info-row">
          <Clock size={14} color="rgba(0,0,0,0.35)" strokeWidth={2} style={{ flexShrink: 0 }} />
          <span className="hed-info-text">
            {formatLabel(event.startH, event.startM)} – {formatLabel(event.endH, event.endM)}
          </span>
        </div>

        {event.todoCount && (
          <div className="hed-info-row">
            <Users size={14} color="rgba(0,0,0,0.35)" strokeWidth={2} style={{ flexShrink: 0 }} />
            <span className="hed-info-text">할 일 {event.todoCount}개</span>
          </div>
        )}

        {event.note && (
          <div className="hed-info-row">
            <FileText size={14} color="rgba(0,0,0,0.35)" strokeWidth={2} style={{ flexShrink: 0 }} />
            <span className="hed-info-text">{event.note}</span>
          </div>
        )}

        {isDynamic && (
          <button className="hed-delete-btn" onClick={handleDelete}>
            <Trash2 size={15} strokeWidth={2} />
            삭제
          </button>
        )}
      </div>
    </>
  );
}
