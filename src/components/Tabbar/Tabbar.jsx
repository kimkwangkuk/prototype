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
            {currentTab === 'todo' ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 1C20.3137 1 23 3.68629 23 7V17C23 20.3137 20.3137 23 17 23H7C3.68629 23 1 20.3137 1 17V7C1 3.68629 3.68629 1 7 1H17ZM17.207 8.29297C16.8165 7.90244 16.1835 7.90244 15.793 8.29297L10.5 13.5859L8.20703 11.293C7.81651 10.9024 7.18349 10.9024 6.79297 11.293C6.40245 11.6835 6.40245 12.3165 6.79297 12.707L9.79297 15.707C9.9805 15.8946 10.2348 16 10.5 16C10.7652 16 11.0195 15.8946 11.207 15.707L17.207 9.70703C17.5976 9.31651 17.5976 8.68349 17.207 8.29297Z" fill="currentColor"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="20" height="20" rx="3.75" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M7.5 12L10.5 15L16.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            <span className="tab-btn-label">할일</span>
          </button>
          <button className={`tab-btn${currentTab === 'calendar' ? ' active' : ''}`} onClick={() => setTab('calendar')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M17 1C20.3137 1 23 3.68629 23 7V17C23 20.3137 20.3137 23 17 23H7C3.68629 23 1 20.3137 1 17V7C1 3.68629 3.68629 1 7 1H17ZM6 6C4.34315 6 3 7.34315 3 9V17C3 19.2091 4.79086 21 7 21H17C19.2091 21 21 19.2091 21 17V9C21 7.34315 19.6569 6 18 6H6Z" fill="currentColor"/>
              <text x="12" y="17" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor" fontFamily="system-ui, sans-serif">{new Date().getDate()}</text>
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
