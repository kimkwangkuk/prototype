import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

function formatLabel(h, m) {
  const isPM = h >= 12;
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${isPM ? '오후' : '오전'} ${h12}:${String(m).padStart(2, '0')}`;
}

export default function HomeGroupDetailSheet({ group, onClose }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (group) setTimeout(() => setAnimate(true), 10);
    else setAnimate(false);
  }, [group]);

  if (!group) return null;

  return (
    <>
      <div
        className="bottom-sheet-overlay"
        style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
        onClick={onClose}
      />
      <div className={`bottom-sheet detail-sheet${animate ? ' visible' : ''}`}>
        <div className="toolbar-grabber">
          <div className="toolbar-grabber-bar" />
        </div>

        <div className="detail-sheet-body">
          <p className="detail-sheet-text">
            {group.title}
            <span style={{ color: 'rgba(0,0,0,0.38)', fontWeight: 400 }}> (+{group.extraCount})</span>
          </p>

          <div className="group-event-list">
            {group.events.map(ev => (
              <div key={ev.id} className="group-event-item">
                <span className="group-event-item-title">{ev.title}</span>
                <div className="group-event-item-time">
                  <Clock size={12} strokeWidth={2} />
                  <span>{formatLabel(ev.startH, ev.startM)} – {formatLabel(ev.endH, ev.endM)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="detail-sheet-actions">
            <button className="detail-action-btn detail-action-edit" onClick={onClose}>
              닫기
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
