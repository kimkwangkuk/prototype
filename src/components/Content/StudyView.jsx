import { useEffect, useState } from 'react';
import useTodoStore from '../../store/useTodoStore';

const BG_IMAGE = 'https://www.figma.com/api/mcp/asset/fa511f46-f34c-4aa5-9ada-9d76e1e7f114';
const AIRPLANE_IMAGE = 'https://www.figma.com/api/mcp/asset/cd75c6bc-a1e5-4890-8eff-b3a4599037e8';
const MEMBER_ICON = 'https://www.figma.com/api/mcp/asset/b90d4708-0a13-48da-b779-763445e4f462';

const MEMBERS = [
  { name: '꽃길만걷자', time: '12:23:43' },
  { name: 'CloudFloating', time: '12:23:43' },
  { name: '강물처럼', time: '12:23:43' },
  { name: '단풍잎사랑🍁', time: '12:23:43' },
  { name: '별밤달빛', time: '12:23:43' },
  { name: '햇살가득✨', time: '12:23:43' },
  { name: 'SummerSea', time: '12:23:43' },
  { name: '겨울아이', time: '12:23:43' },
];

function formatTimer(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function StudyView() {
  const setStudyModeActive = useTodoStore(state => state.setStudyModeActive);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="study-view">
      {/* 배경 이미지 */}
      <div className="study-view-bg">
        <img src={BG_IMAGE} alt="" />
      </div>

      {/* 비행기 이미지 */}
      <div className="study-view-airplane">
        <img src={AIRPLANE_IMAGE} alt="" />
      </div>

      {/* 하단 컨테이너 */}
      <div className="study-view-container">
        {/* 집중 시간 섹션 */}
        <div className="study-time-section">
          <div className="study-time-left">
            <div className="study-time-main">
              <p className="study-time-label">현재 집중 시간</p>
              <p className="study-time-value">{formatTimer(elapsed)}</p>
            </div>
            <div className="study-time-stats">
              <div className="study-time-stat">
                <p className="study-stat-label">오늘</p>
                <p className="study-stat-value">1:34:42</p>
              </div>
              <div className="study-time-stat">
                <p className="study-stat-label">Work</p>
                <p className="study-stat-value">1:34:42</p>
              </div>
            </div>
          </div>
          {/* 일시중지 버튼 */}
          <button className="study-pause-btn" onClick={() => setStudyModeActive(false)}>
            <PauseIcon />
          </button>
        </div>

        {/* 태스크 카드 */}
        <div className="study-cards-wrapper">
          <div className="study-glass-card study-task-card">
            <div className="study-task-row">
              <div className="study-task-info">
                <div className="study-task-title-row">
                  <span className="study-task-title">새로운 이벤트</span>
                  <span className="study-task-status">진행중</span>
                </div>
                <span className="study-task-time">오전 09:00~12:00</span>
              </div>
            </div>
          </div>

          {/* 그룹 카드 */}
          <div className="study-glass-card study-group-card">
            <div className="study-group-header">
              <div className="study-group-title-row">
                <p className="study-group-title">직장인분들 같이 발전합시다</p>
                <div className="study-group-dots">
                  <span className="study-dot active" />
                  <span className="study-dot" />
                  <span className="study-dot" />
                </div>
              </div>
              <p className="study-group-info"><span className="study-group-count">8명</span> 공부중</p>
            </div>
            <div className="study-members-grid">
              {MEMBERS.map((m, i) => (
                <div key={i} className="study-member">
                  <img src={MEMBER_ICON} alt="" className="study-member-icon" />
                  <p className="study-member-name">{m.name}</p>
                  <p className="study-member-time">{m.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PauseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="4" y="3" width="4" height="14" rx="1.5" fill="white" />
      <rect x="12" y="3" width="4" height="14" rx="1.5" fill="white" />
    </svg>
  );
}
