import { useState, useEffect } from 'react';

const CHALLENGES = [
  { id: 1, emoji: '🌞', title: '기상인증',     time: '오전 5:00' },
  { id: 2, emoji: '💧', title: '물마시기 인증', time: '오전 5:00' },
  { id: 3, emoji: '🏃🏻‍♂️', title: '러닝 인증',    time: '오전 9:00' },
];

export default function ChallengeSheet({ visible, onClose }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (visible) setTimeout(() => setAnimate(true), 10);
    else setAnimate(false);
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      <div className="bottom-sheet-overlay" onClick={onClose} />
      <div className={`bottom-sheet challenge-sheet${animate ? ' visible' : ''}`}>
        <div className="toolbar-surface" />
        <div className="toolbar-grabber">
          <svg width="36" height="4" viewBox="0 0 36 4" fill="none">
            <rect width="36" height="4" rx="2" fill="rgba(0,0,0,0.18)" />
          </svg>
        </div>

        <div className="challenge-sheet-title">1.13 챌린지</div>

        <div className="challenge-sheet-list">
          {CHALLENGES.map(ch => (
            <div key={ch.id} className="challenge-item">
              <span className="challenge-emoji">{ch.emoji}</span>
              <div className="challenge-info">
                <span className="challenge-name">{ch.title}</span>
                <span className="challenge-time">{ch.time}</span>
              </div>
              <button className="challenge-cert-btn">인증</button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
