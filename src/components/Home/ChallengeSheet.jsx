import AttachedSheet from '../common/AttachedSheet';

const CHALLENGES = [
  { id: 1, emoji: '🌞', title: '기상인증',      time: '오전 5:00' },
  { id: 2, emoji: '💧', title: '물마시기 인증',  time: '오전 5:00' },
  { id: 3, emoji: '🏃🏻‍♂️', title: '러닝 인증',     time: '오전 9:00' },
];

export default function ChallengeSheet({ visible, onClose }) {
  return (
    <AttachedSheet visible={visible} onClose={onClose}>
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
    </AttachedSheet>
  );
}
