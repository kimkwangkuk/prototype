import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

const RANGE_DATA = [
  { startH: 5,  endH: 8  },
  { startH: 9,  endH: 12 },
  { startH: 12, endH: 15 },
  { startH: 20, endH: 23 },
  { startH: 22, endH: 25 },
];

function fmtHour(h) {
  const h24 = h % 24;
  const period = h24 < 12 ? '오전' : '오후';
  const hour = h24 % 12 || 12;
  return `${period} ${hour}:00`;
}

function rangeLabel(rangeIndex) {
  const r = RANGE_DATA[rangeIndex];
  return `${fmtHour(r.startH)}~${fmtHour(r.endH)}`;
}

const CHALLENGES = [
  { id: 1, emoji: '🌞', title: '기상인증',      time: '오전 5:00',  done: true,  rangeIndex: 0 },
  { id: 2, emoji: '💧', title: '물마시기 인증',  time: '오전 5:00',  done: true,  rangeIndex: 0 },
  { id: 3, emoji: '🏃🏻‍♂️', title: '러닝 인증',     time: '오전 9:00',  done: false, rangeIndex: 1 },
  { id: 6, emoji: '🥗', title: '점심 인증',      time: '오후 12:00', done: false, rangeIndex: 2 },
  { id: 4, emoji: '🌃', title: '별밤 인증',      time: '오후 9:00',  done: false, rangeIndex: 3 },
  { id: 5, emoji: '🛏️', title: '취침 인증',      time: '오후 11:00', done: false, rangeIndex: 4 },
];

export default function ChallengeSheet({ visible, onClose, onCertify }) {
  const [animate, setAnimate] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [certified, setCertified] = useState({});

  useEffect(() => {
    if (visible) setTimeout(() => setAnimate(true), 10);
    else {
      setAnimate(false);
      setSelectedChallenge(null);
    }
  }, [visible]);

  const handleClose = () => {
    setSelectedChallenge(null);
    onClose();
  };

  if (!visible) return null;

  return (
    <>
      <div
        className="bottom-sheet-overlay"
        style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
        onClick={handleClose}
      />
      <div className={`bottom-sheet detail-sheet group-sheet${animate ? ' visible' : ''}`}>

        {/* Grabber — 목록 뷰에서만 노출 */}
        <div className={`group-sheet-grabber${selectedChallenge ? ' hidden' : ''}`}>
          <div className="toolbar-grabber-bar" />
        </div>

        {/* 앱바 */}
        <div className="group-sheet-appbar">
          <div className="group-sheet-appbar-side">
            {selectedChallenge && (
              <button className="group-sheet-back-btn" onClick={() => setSelectedChallenge(null)}>
                <ChevronLeft size={22} strokeWidth={2} />
              </button>
            )}
          </div>

          <div className="group-sheet-appbar-title">
            {selectedChallenge ? selectedChallenge.title : '1.13 챌린지'}
          </div>

          <div className="group-sheet-appbar-side group-sheet-appbar-side--right">
            {!selectedChallenge && (
              <button className="group-sheet-close-btn" onClick={handleClose}>닫기</button>
            )}
          </div>
        </div>

        {/* 구분선 */}
        <div className="group-sheet-divider" />

        {/* 슬라이딩 패널 */}
        <div className={`group-sheet-panels${selectedChallenge ? ' show-detail' : ''}`}>

          {/* 패널 1: 챌린지 목록 */}
          <div className="group-sheet-panel">
            <div className="challenge-sheet-list">
              {CHALLENGES.map(ch => {
                const isDone = certified[ch.id] || ch.done;
                return (
                  <div
                    key={ch.id}
                    className="challenge-item challenge-item-tappable"
                    onClick={() => setSelectedChallenge(ch)}
                  >
                    <span className="challenge-emoji">{ch.emoji}</span>
                    <div className="challenge-info">
                      <span className="challenge-name">{ch.title}</span>
                      <div className="challenge-time-row">
                        <span className="challenge-time">{rangeLabel(ch.rangeIndex)}</span>
                        {isDone && <span className="challenge-done-badge">✓완료</span>}
                      </div>
                    </div>
                    <ChevronRight size={16} strokeWidth={2} color="rgba(0,0,0,0.3)" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* 패널 2: 챌린지 상세 (인증) */}
          <div className="group-sheet-panel">
            {selectedChallenge && (
              <div className="challenge-detail">
                <div className="challenge-detail-emoji">{selectedChallenge.emoji}</div>
                <p className="challenge-detail-title">{selectedChallenge.title}</p>
                <p className="challenge-detail-time">{rangeLabel(selectedChallenge.rangeIndex)}</p>
                {certified[selectedChallenge.id] || selectedChallenge.done ? (
                  <div className="challenge-certified-badge">
                    <CheckCircle size={20} strokeWidth={2} color="#00b13b" />
                    <span>인증 완료</span>
                  </div>
                ) : (
                  <button
                    className="challenge-cert-action-btn"
                    onClick={() => {
                      setCertified(prev => ({ ...prev, [selectedChallenge.id]: true }));
                      onCertify?.(selectedChallenge.rangeIndex);
                    }}
                  >
                    인증하기
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
