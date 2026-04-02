import { useEffect, useState } from 'react';
import useTodoStore from '../../store/useTodoStore';

const BG_IMAGE = 'https://www.figma.com/api/mcp/asset/fa511f46-f34c-4aa5-9ada-9d76e1e7f114';
const AIRPLANE_IMAGE = 'https://www.figma.com/api/mcp/asset/cd75c6bc-a1e5-4890-8eff-b3a4599037e8';
const MEMBER_ICON = 'https://www.figma.com/api/mcp/asset/b90d4708-0a13-48da-b779-763445e4f462';
const TABLE_FRAME_IMAGE = 'https://www.figma.com/api/mcp/asset/7f064995-250e-4569-a855-e5ed29c5771d';
const LANDSCAPE_IMAGE = 'https://www.figma.com/api/mcp/asset/0bb79a9b-816f-49bd-9e5f-accceb022dbf';

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
  const [isExiting, setIsExiting] = useState(false);
  const [viewMode, setViewMode] = useState('default');
  const [isViewTransitioning, setIsViewTransitioning] = useState(false);
  const [tableFrameLoaded, setTableFrameLoaded] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // 테이블 모드 이미지 미리 로드
  useEffect(() => {
    [TABLE_FRAME_IMAGE, LANDSCAPE_IMAGE].forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  function handleExit() {
    setIsExiting(true);
    setTimeout(() => setStudyModeActive(false), 600);
  }

  function toggleViewMode() {
    setIsViewTransitioning(true);
    setTimeout(() => {
      setTableFrameLoaded(false);
      setViewMode(v => v === 'default' ? 'table' : 'default');
      setTimeout(() => setIsViewTransitioning(false), 300);
    }, 300);
  }

  const progress = Math.min(100, (elapsed / (25 * 60)) * 100);

  return (
    <div className={`study-view${isExiting ? ' exiting' : ''}`}>
      {viewMode === 'default' ? (
        <>
          {/* 배경 이미지 */}
          <div className="study-view-bg">
            <div className="study-bg-inner">
              <div className="study-bg-strip" style={{ backgroundImage: `url(${BG_IMAGE})` }} />
              <div className="study-bg-strip study-bg-strip-flip" style={{ backgroundImage: `url(${BG_IMAGE})` }} />
            </div>
          </div>

          {/* 앱바 */}
          <div className="study-appbar">
            <span className="study-appbar-title">Work {formatTimer(elapsed)}</span>
            <div className="study-appbar-icons">
              <button className="study-appbar-btn" onClick={toggleViewMode}><ViewToggleIcon /></button>
              <button className="study-appbar-btn"><DotsIcon /></button>
            </div>
          </div>

          {/* 비행기 이미지 */}
          <div className="study-view-airplane">
            <img src={AIRPLANE_IMAGE} alt="" />
          </div>

          {/* 하단 컨테이너 (스크롤 영역) */}
          <div className="study-view-container">
            <div className="study-view-scroll-inner">
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
                {/* 우측: 프로그레스바 + 버튼 */}
                <div className="study-right-controls">
                  <div className="study-time-range">
                    <div className="study-time-range-labels">
                      <div className="study-range-time">
                        <span className="study-range-label">End</span>
                        <span className="study-range-value">5:25</span>
                      </div>
                      <span className="study-range-dot" />
                      <span className="study-range-dot" />
                      <span className="study-range-dot" />
                      <span className="study-range-dot" />
                      <span className="study-range-dot" />
                      <div className="study-range-time">
                        <span className="study-range-label">Start</span>
                        <span className="study-range-value">5:00</span>
                      </div>
                    </div>
                    <div className="study-progress-bar-wrap">
                      <div className="study-progress-bar-bg">
                        <div className="study-progress-fill" style={{ height: `${progress}%` }} />
                      </div>
                      <div className="study-progress-plane" style={{ bottom: `${progress}%` }}>
                        <PlaneIcon />
                      </div>
                    </div>
                  </div>
                  <div className="study-btn-row">
                    <button className="study-ctrl-btn" onClick={handleExit}>
                      <StopIcon />
                    </button>
                    <button className="study-ctrl-btn">
                      <PauseIcon />
                    </button>
                  </div>
                </div>
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
        </>
      ) : (
        /* 테이블 모드 */
        <div className="study-table-mode">
          {/* 비행기 창문 프레임 영역 */}
          <div className={`study-table-frame-area${tableFrameLoaded ? ' loaded' : ''}`}>
            {/* 풍경 이미지 - 가로 무한 스크롤 */}
            <div className="study-table-landscape-container">
              <div className="study-table-landscape-inner">
                <img src={LANDSCAPE_IMAGE} alt="" />
                <img src={LANDSCAPE_IMAGE} alt="" />
              </div>
            </div>
            {/* 창문 프레임 (위에 올라감) */}
            <img src={TABLE_FRAME_IMAGE} alt="" className="study-table-frame" onLoad={() => setTableFrameLoaded(true)} />
          </div>

          {/* 상단 그라데이션 */}
          <div className="study-table-gradient-top" />
          {/* 하단 그라데이션 */}
          <div className="study-table-gradient-bottom" />

          {/* 앱바 */}
          <div className="study-appbar study-table-appbar">
            <button className="study-appbar-btn" onClick={toggleViewMode}><HamburgerIcon /></button>
            <div className="study-appbar-icons" style={{ opacity: 0 }}>
              <button className="study-appbar-btn"><DotsIcon /></button>
              <button className="study-appbar-btn"><DotsIcon /></button>
            </div>
          </div>

          {/* 하단 컨텐츠 */}
          <div className="study-table-bottom">
            {/* 좌측: 타이머 */}
            <div className="study-table-time-left">
              <div className="study-table-time-main">
                <p className="study-table-time-label">현재 집중 시간</p>
                <p className="study-table-time-value">{formatTimer(elapsed)}</p>
              </div>
              <div className="study-time-stats">
                <div className="study-time-stat">
                  <p className="study-stat-label">오늘</p>
                  <p className="study-stat-value">1:34:42</p>
                </div>
                <div className="study-time-stat">
                  <p className="study-stat-label">미적분 수학</p>
                  <p className="study-stat-value">1:34:42</p>
                </div>
              </div>
            </div>

            {/* 우측: 프로그레스바 + 버튼 */}
            <div className="study-right-controls">
              <div className="study-time-range">
                <div className="study-time-range-labels">
                  <div className="study-range-time">
                    <span className="study-range-label">End</span>
                    <span className="study-range-value">5:25</span>
                  </div>
                  <span className="study-range-dot" />
                  <span className="study-range-dot" />
                  <span className="study-range-dot" />
                  <span className="study-range-dot" />
                  <span className="study-range-dot" />
                  <div className="study-range-time">
                    <span className="study-range-label">Start</span>
                    <span className="study-range-value">5:00</span>
                  </div>
                </div>
                <div className="study-progress-bar-wrap">
                  <div className="study-progress-bar-bg">
                    <div className="study-progress-fill study-table-progress-fill" style={{ height: `${progress}%` }} />
                  </div>
                  <div className="study-progress-plane" style={{ bottom: `${progress}%` }}>
                    <PlaneIcon />
                  </div>
                </div>
              </div>
              <div className="study-btn-row">
                <button className="study-ctrl-btn study-table-ctrl-btn" onClick={handleExit}>
                  <StopIcon />
                </button>
                <button className="study-ctrl-btn study-table-ctrl-btn">
                  <PauseIcon />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 뷰모드 전환 오버레이 */}
      {isViewTransitioning && <div className="study-view-transition-overlay" />}
    </div>
  );
}

function ViewToggleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="8" height="8" rx="2" stroke="white" strokeWidth="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="2" stroke="white" strokeWidth="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="2" stroke="white" strokeWidth="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="2" stroke="white" strokeWidth="1.5" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="5" width="16" height="2" rx="1" fill="white" />
      <rect x="4" y="11" width="16" height="2" rx="1" fill="white" />
      <rect x="4" y="17" width="16" height="2" rx="1" fill="white" />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="5" r="1.5" fill="white" />
      <circle cx="12" cy="12" r="1.5" fill="white" />
      <circle cx="12" cy="19" r="1.5" fill="white" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="4.5" y="4.5" width="11" height="11" rx="2.5" fill="white" />
    </svg>
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

function PlaneIcon() {
  return (
    <svg width="32" height="35" viewBox="0 0 32 35" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#filter0_d_1122_9628)">
        <path d="M26.512 20.3729L18.0727 14.9718V9.06426C18.0727 6.53247 16.8068 4.42264 15.5409 4.00067C14.275 4.42264 13.0091 6.53247 13.0091 9.06426L13.0091 14.9718L4.56979 20.3729C4.06343 20.7105 3.89464 21.2169 4.06343 21.7232L4.23222 22.3984C4.4854 22.9891 4.99176 23.3267 5.58251 23.2423L13.0091 21.7232L13.853 25.9429L11.3212 28.4747V30.1626L15.5409 29.3186L19.7606 30.1626L19.7606 28.4747L17.2288 25.9429L18.0727 21.7232L25.4993 23.2423C26.09 23.3267 26.5964 22.9891 26.8496 22.3984L27.1028 21.8076C27.1872 21.2169 27.0184 20.7105 26.512 20.3729Z" fill="white"/>
      </g>
      <defs>
        <filter id="filter0_d_1122_9628" x="0" y="0" width="31.1235" height="34.1621" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feOffset/>
          <feGaussianBlur stdDeviation="2"/>
          <feComposite in2="hardAlpha" operator="out"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1122_9628"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1122_9628" result="shape"/>
        </filter>
      </defs>
    </svg>
  );
}
