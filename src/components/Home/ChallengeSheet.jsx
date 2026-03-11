import { useState, useEffect } from 'react';

const CHALLENGES = [
  { id: 1, emoji: '🌞', title: '기상인증',      time: '오전 5:00' },
  { id: 2, emoji: '💧', title: '물마시기 인증',  time: '오전 5:00' },
  { id: 3, emoji: '🏃🏻‍♂️', title: '러닝 인증',     time: '오전 9:00' },
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
          <p className="detail-sheet-text">1.13 챌린지</p>

          <div className="detail-sheet-meta">
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
      </div>
    </>
  );
}
