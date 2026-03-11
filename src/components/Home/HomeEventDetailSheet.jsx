import { Clock, FileText, Users, Trash2 } from 'lucide-react';
import useTodoStore from '../../store/useTodoStore';
import AttachedSheet from '../common/AttachedSheet';

function formatLabel(h, m) {
  const isPM = h >= 12;
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${isPM ? '오후' : '오전'} ${h12}:${String(m).padStart(2, '0')}`;
}

export default function HomeEventDetailSheet({ event, onClose }) {
  const removeHomeEvent = useTodoStore(state => state.removeHomeEvent);

  const isDynamic = typeof event?.id === 'number';

  const handleDelete = () => {
    removeHomeEvent(event.id);
    onClose();
  };

  return (
    <AttachedSheet visible={!!event} onClose={onClose}>
      <div className="hed-title-row">
        <span className="hed-title">{event?.title}</span>
      </div>

      <div className="hed-info-row">
        <Clock size={14} color="rgba(0,0,0,0.35)" strokeWidth={2} style={{ flexShrink: 0 }} />
        <span className="hed-info-text">
          {event && `${formatLabel(event.startH, event.startM)} – ${formatLabel(event.endH, event.endM)}`}
        </span>
      </div>

      {event?.todoCount && (
        <div className="hed-info-row">
          <Users size={14} color="rgba(0,0,0,0.35)" strokeWidth={2} style={{ flexShrink: 0 }} />
          <span className="hed-info-text">할 일 {event.todoCount}개</span>
        </div>
      )}

      {event?.note && (
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
    </AttachedSheet>
  );
}
