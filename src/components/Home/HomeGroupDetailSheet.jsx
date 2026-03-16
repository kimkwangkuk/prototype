import { useState, useEffect } from 'react';
import { Clock, ChevronLeft, FileText, Users } from 'lucide-react';

function formatLabel(h, m) {
  const isPM = h >= 12;
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${isPM ? '오후' : '오전'} ${h12}:${String(m).padStart(2, '0')}`;
}

export default function HomeGroupDetailSheet({ group, onClose }) {
  const [animate, setAnimate] = useState(false);
  const [selectedEv, setSelectedEv] = useState(null);

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
          {/* 왼쪽 */}
          <div className="group-sheet-appbar-side">
            {selectedEv && (
              <button className="group-sheet-back-btn" onClick={() => setSelectedEv(null)}>
                <ChevronLeft size={22} strokeWidth={2} />
              </button>
            )}
          </div>

          {/* 타이틀 */}
          <div className="group-sheet-appbar-title">
            {selectedEv ? (
              <span>{selectedEv.title}</span>
            ) : (
              <span>
                {group.title}
                <span className="group-sheet-appbar-count"> (+{group.extraCount})</span>
              </span>
            )}
          </div>

          {/* 오른쪽 */}
          <div className="group-sheet-appbar-side group-sheet-appbar-side--right">
            {!selectedEv && (
              <button className="group-sheet-close-btn" onClick={handleClose}>닫기</button>
            )}
          </div>
        </div>

        {/* 구분선 */}
        <div className="group-sheet-divider" />

        {/* 슬라이딩 패널 */}
        <div className={`group-sheet-panels${selectedEv ? ' show-detail' : ''}`}>

          {/* 패널 1: 할일 목록 */}
          <div className="group-sheet-panel">
            <div className="group-event-list">
              {group.events.map(ev => (
                <div
                  key={ev.id}
                  className="group-event-item group-event-item-tappable"
                  onClick={() => setSelectedEv(ev)}
                >
                  <span className="group-event-item-title">{ev.title}</span>
                  <div className="group-event-item-time">
                    <Clock size={12} strokeWidth={2} />
                    <span>{formatLabel(ev.startH, ev.startM)} – {formatLabel(ev.endH, ev.endM)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 패널 2: 할일 상세 */}
          <div className="group-sheet-panel">
            {selectedEv && (
              <div className="detail-sheet-meta">
                <div className="detail-sheet-meta-row">
                  <Clock size={16} className="detail-meta-icon" strokeWidth={2} />
                  <span className="detail-meta-label">
                    {formatLabel(selectedEv.startH, selectedEv.startM)} – {formatLabel(selectedEv.endH, selectedEv.endM)}
                  </span>
                </div>
                {selectedEv.todoCount && (
                  <div className="detail-sheet-meta-row">
                    <Users size={16} className="detail-meta-icon" strokeWidth={2} />
                    <span className="detail-meta-label">할 일 {selectedEv.todoCount}개</span>
                  </div>
                )}
                {selectedEv.note && (
                  <div className="detail-sheet-meta-row">
                    <FileText size={16} className="detail-meta-icon" strokeWidth={2} />
                    <span className="detail-meta-label">{selectedEv.note}</span>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
