import { useState } from 'react';
import useTodoStore from '../../store/useTodoStore';

const CalOutline = () => (
  <path d="M2 7.725V17.5C2 19.7091 3.79086 21.5 6 21.5H18C20.2091 21.5 22 19.7091 22 17.5V7.725M2 7.725V6.5C2 4.29086 3.79086 2.5 6 2.5H18C20.2091 2.5 22 4.29086 22 6.5V7.725M2 7.725H22"/>
);

const IconMonth = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <CalOutline/>
    <path d="M6 12.5H6.01"/><path d="M9.99658 12.5H10.0066"/><path d="M13.9934 12.5H14.0034"/><path d="M17.99 12.5H18"/>
    <path d="M6 16.5H6.01"/><path d="M9.99658 16.5H10.0066"/><path d="M13.9934 16.5H14.0034"/>
  </svg>
);

const IconWeek = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <CalOutline/>
    <path d="M6 12H18"/>
    <path d="M6 15.5H18"/>
    <path d="M6 19H14"/>
  </svg>
);

const IconDay = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <CalOutline/>
    <path d="M6 13.5H18"/>
    <path d="M6 17.5H12"/>
  </svg>
);

const VIEW_ICONS = { month: IconMonth, week: IconWeek, day: IconDay };
const VIEW_LABELS = { month: '월', week: '주', day: '일' };

export default function Tabbar() {
  const currentView = useTodoStore(state => state.currentView);
  const setView = useTodoStore(state => state.setView);
  const currentTab = useTodoStore(state => state.currentTab);
  const setTab = useTodoStore(state => state.setTab);
  const [viewMenuOpen, setViewMenuOpen] = useState(false);

  const handleViewSelect = (view) => {
    setView(view);
    setViewMenuOpen(false);
  };

  const CurrentIcon = VIEW_ICONS[currentView];

  return (
    <div className="tabbar">
      <div className="tabbar-gradient"></div>
      {viewMenuOpen && (
        <div className="tabbar-overlay" onClick={() => setViewMenuOpen(false)} />
      )}
      <div className="tabbar-inner">
        <div className="tabbar-group">
          <div className="tabbar-group-bg"></div>
          <button className="tab-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            </svg>
            <span className="tab-btn-label">홈</span>
          </button>
          <button className={`tab-btn${currentTab === 'todo' ? ' active' : ''}`} onClick={() => setTab('todo')}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 5a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 3a1 1 0 000 2h4a1 1 0 100-2H7zm0 4a1 1 0 100 2h8a1 1 0 100-2H7zm0 4a1 1 0 100 2h6a1 1 0 100-2H7z"/>
            </svg>
            <span className="tab-btn-label">할일</span>
          </button>
          <button className={`tab-btn${currentTab === 'calendar' ? ' active' : ''}`} onClick={() => setTab('calendar')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span className="tab-btn-label">캘린더</span>
          </button>
          <button className="tab-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/>
              <path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
            <span className="tab-btn-label">그룹</span>
          </button>
        </div>

        {/* 뷰 전환 영역 */}
        <div className="tabbar-view-area">
          <div className={`view-speed-dial${viewMenuOpen ? ' open' : ''}`}>
            {['month', 'week', 'day'].map(view => {
              const Icon = VIEW_ICONS[view];
              return (
                <button
                  key={view}
                  className={`view-dial-btn${currentView === view ? ' active' : ''}`}
                  onClick={() => handleViewSelect(view)}
                >
                  <Icon/>
                  <span>{VIEW_LABELS[view]}</span>
                </button>
              );
            })}
          </div>
          <button
            className="tabbar-add"
            onClick={() => setViewMenuOpen(!viewMenuOpen)}
            aria-label="뷰 전환"
          >
            <div className="tabbar-add-bg"></div>
            {viewMenuOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="5" y1="5" x2="19" y2="19"/>
                <line x1="19" y1="5" x2="5" y2="19"/>
              </svg>
            ) : (
              <>
                <CurrentIcon/>
                <span className="tabbar-add-label">{VIEW_LABELS[currentView]}</span>
              </>
            )}
          </button>
        </div>
      </div>
      <div className="tabbar-indicator">
        <div className="tabbar-indicator-bar"></div>
      </div>
    </div>
  );
}
