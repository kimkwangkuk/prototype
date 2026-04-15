import { useEffect, useRef, useState } from 'react';
import useTodoStore from '../../store/useTodoStore';

const BG_IMAGES = [
  'https://www.figma.com/api/mcp/asset/30b3331a-d2a4-410a-95c9-436bba05c869',
  'https://www.figma.com/api/mcp/asset/087d7626-f42d-4073-9361-9ba73c823fab',
];
const AIRPLANE_IMAGE = 'https://www.figma.com/api/mcp/asset/0f2c93ae-2884-4229-8f97-085199f2b2da';
const MEMBER_ICON = 'https://www.figma.com/api/mcp/asset/b90d4708-0a13-48da-b779-763445e4f462';
const TABLE_FRAME_IMAGE = 'https://www.figma.com/api/mcp/asset/7f064995-250e-4569-a855-e5ed29c5771d';
const LANDSCAPE_IMAGE = 'https://www.figma.com/api/mcp/asset/c254ddae-0a22-421d-aa40-c7b2a6b6cc2f';
const IN_FLIGHT_IMAGE = 'https://www.figma.com/api/mcp/asset/397b499c-5912-4d61-87b5-707e2d9b6c77';

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
  const [bgLoaded, setBgLoaded] = useState(false);
  const [viewMode, setViewMode] = useState('default');
  const [isLeavingTable, setIsLeavingTable] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  const [bgFading, setBgFading] = useState(false);
  const [airplaneVisible, setAirplaneVisible] = useState(false);
  const [airplaneReady, setAirplaneReady] = useState(false);
  const bgIndexRef = useRef(0);
  const airplaneTimerFiredRef = useRef(false);
  const airplaneImgLoadedRef = useRef(false);
  const airplaneStartedRef = useRef(false);

  function tryStartAirplane() {
    if (airplaneTimerFiredRef.current && airplaneImgLoadedRef.current && !airplaneStartedRef.current) {
      airplaneStartedRef.current = true;
      setAirplaneVisible(true);
      setTimeout(() => setAirplaneReady(true), 300);
    }
  }

  // 비행기 이미지 미리 로드
  useEffect(() => {
    const img = new Image();
    img.onload = () => { airplaneImgLoadedRef.current = true; tryStartAirplane(); };
    img.src = AIRPLANE_IMAGE;
  }, []);

  // 배경 페이드인(1.6s) 완료 후 비행기 등장 시도
  useEffect(() => {
    if (!bgLoaded) return;
    const t = setTimeout(() => {
      airplaneTimerFiredRef.current = true;
      tryStartAirplane();
    }, 1600);
    return () => clearTimeout(t);
  }, [bgLoaded]);

  useEffect(() => {
    const timer = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // 테이블 모드 이미지 미리 로드
  useEffect(() => {
    [TABLE_FRAME_IMAGE, LANDSCAPE_IMAGE, IN_FLIGHT_IMAGE, ...BG_IMAGES].forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // 10초마다 배경 이미지 순환 (입장 애니메이션 완료 후 시작)
  useEffect(() => {
    if (viewMode !== 'default' || !airplaneReady) return;
    const interval = setInterval(() => {
      setBgFading(true);
      const nextIndex = (bgIndexRef.current + 1) % BG_IMAGES.length;
      // 페이드 아웃(1.6s) 완료 후 이미지 교체 → 페이드 인
      setTimeout(() => {
        const img = new window.Image();
        const applyNext = () => {
          bgIndexRef.current = nextIndex;
          setBgIndex(nextIndex);
          // 브라우저가 새 이미지를 그린 후 fade in
          setTimeout(() => setBgFading(false), 100);
        };
        img.onload = applyNext;
        img.src = BG_IMAGES[nextIndex];
        if (img.complete) applyNext();
      }, 1600);
    }, 10000);
    return () => clearInterval(interval);
  }, [viewMode, airplaneReady]);

  function handleExit() {
    setIsExiting(true);
    setTimeout(() => setStudyModeActive(false), 600);
  }

  function toggleViewMode() {
    if (viewMode === 'default') {
      setViewMode('table');
    } else {
      setIsLeavingTable(true);
      setTimeout(() => {
        setViewMode('default');
        setIsLeavingTable(false);
      }, 400);
    }
  }

  const progress = Math.min(100, (elapsed / (25 * 60)) * 100);

  return (
    <div className={`study-view${isExiting ? ' exiting' : ''}${airplaneReady ? ' airplane-ready' : ''}`}>
      <img src={BG_IMAGES[0]} alt="" style={{ display: 'none' }} onLoad={() => setBgLoaded(true)} onError={() => setBgLoaded(true)} />
      {viewMode === 'default' ? (
        <>
          {/* 배경 이미지 */}
          <div
            className="study-view-bg"
            style={{ opacity: bgLoaded && !bgFading ? 1 : 0 }}
          >
            <div className="study-bg-inner">
              <div className="study-bg-strip" style={{ backgroundImage: `url(${BG_IMAGES[bgIndex]})` }} />
              <div className="study-bg-strip" style={{ backgroundImage: `url(${BG_IMAGES[bgIndex]})` }} />
            </div>
          </div>

          {/* 딤드 레이어 */}
          <div className="study-dim-layer" />

          {/* 앱바 */}
          <div className="study-appbar">
            <span className="study-appbar-title">Work {formatTimer(elapsed)}</span>
            <div className="study-appbar-icons">
              <button className="study-appbar-btn" onClick={toggleViewMode}><ViewToggleIcon /></button>
              <button className="study-appbar-btn"><DotsIcon /></button>
            </div>
          </div>

          {/* 비행기 이미지 */}
          {airplaneVisible && (
            <div
              className="study-view-airplane-wrap"
              style={airplaneReady ? { opacity: bgFading ? 0 : 1 } : undefined}
            >
              <div className="study-view-airplane">
                <img src={AIRPLANE_IMAGE} alt="" />
              </div>
            </div>
          )}

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
        <div className={`study-table-mode${isLeavingTable ? ' leaving' : ''}`}>
          {/* 기내 배경 이미지 */}
          <img src={IN_FLIGHT_IMAGE} alt="" className="study-table-inflight-bg" />
          {/* 비행기 창문 프레임 영역 */}
          <div className="study-table-frame-area">
            {/* 풍경 이미지 - 가로 무한 스크롤 */}
            <div className="study-table-landscape-container">
              <div className="study-table-landscape-inner">
                <img src={LANDSCAPE_IMAGE} alt="" />
                <img src={LANDSCAPE_IMAGE} alt="" />
              </div>
            </div>
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
    </div>
  );
}

function ViewToggleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2.5" y="3" width="12" height="18" rx="3" stroke="white" strokeWidth="2"/>
      <path d="M18.5 2C20.7091 2 22.5 3.79086 22.5 6V18C22.5 20.2091 20.7091 22 18.5 22H15C15.6863 21.4844 16.2351 20.7962 16.583 20H18.5C19.6046 20 20.5 19.1046 20.5 18V6C20.5 4.89543 19.6046 4 18.5 4H16.583C16.2351 3.20378 15.6863 2.51557 15 2H18.5Z" fill="white" fillOpacity="0.5"/>
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
