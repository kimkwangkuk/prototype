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

  // 바텀시트 닫힐 때 상세도 초기화
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

        {/* 타이틀바 */}
        <div className="group-sheet-titlebar">
          {selectedEv ? (
            <>
              <button className="group-sheet-back-btn" onClick={() => setSelectedEv(null)}>
                <ChevronLeft size={20} strokeWidth={2} />
              </button>
              <span className="group-sheet-titlebar-text">{selectedEv.title}</span>
              <div className="group-sheet-titlebar-spacer" />
            </>
          ) : (
            <>
              <div className="group-sheet-grabber-area">
                <div className="toolbar-grabber-bar" />
              </div>
              <div className="group-sheet-titlebar-row">
                <span className="group-sheet-titlebar-text">
                  {group.title}
                  <span style={{ color: 'rgba(0,0,0,0.38)', fontWeight: 400 }}> (+{group.extraCount})</span>
                </span>
                <button className="group-sheet-close-btn" onClick={handleClose}>닫기</button>
              </div>
            </>
          )}
        </div>

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
