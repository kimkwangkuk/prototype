import { useState } from 'react';
import { Plus } from 'lucide-react';
import useTodoStore from '../../store/useTodoStore';

const IconBase = () => (
  <path d="M18.2568 1.00684C20.8989 1.14053 23 3.32472 23 6V18L22.9932 18.2568C22.8638 20.8138 20.8138 22.8638 18.2568 22.9932L18 23H6C3.32472 23 1.14053 20.8989 1.00684 18.2568L1 18V6C1 3.23858 3.23858 1 6 1H18L18.2568 1.00684ZM5 6C3.89543 6 3 6.89543 3 8V18C3 19.6569 4.34315 21 6 21H18C19.6569 21 21 19.6569 21 18V8C21 6.89543 20.1046 6 19 6H5Z" fill="currentColor"/>
);

const IconDay = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <IconBase/>
    <rect x="6" y="9" width="2" height="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconWeek = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.2139 0.838949C17.4157 0.950359 19.1666 2.77052 19.1666 4.99992V14.9999L19.1609 15.2139C19.0531 17.3448 17.3448 19.0531 15.2139 19.1609L14.9999 19.1666H4.99992C2.77052 19.1666 0.950359 17.4157 0.838949 15.2139L0.833252 14.9999V4.99992C0.833252 2.69873 2.69873 0.833252 4.99992 0.833252H14.9999L15.2139 0.838949ZM4.16659 4.99992C3.24611 4.99992 2.49992 5.74611 2.49992 6.66659V14.9999C2.49992 16.3806 3.61921 17.4999 4.99992 17.4999H14.9999C16.3806 17.4999 17.4999 16.3806 17.4999 14.9999V6.66659C17.4999 5.74611 16.7537 4.99992 15.8333 4.99992H4.16659Z" fill="currentColor"/>
    <path d="M5 7.91675H5.00833" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.33057 7.91675H8.3389" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11.6611 7.91675H11.6695" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14.9917 7.91675H15" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconMonth = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <IconBase/>
    <path d="M6 9.5H6.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.99658 9.5H10.0066" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.9934 9.5H14.0034" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17.99 9.5H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 13.5H6.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.99658 13.5H10.0066" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.9934 13.5H14.0034" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17.99 13.5H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 17.5H6.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.99658 17.5H10.0066" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.9934 17.5H14.0034" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const VIEW_ICONS = { month: IconMonth, week: IconWeek, day: IconDay };
const VIEW_LABELS = { month: '월', week: '주', day: '일' };

export default function Tabbar() {
  const currentView = useTodoStore(state => state.currentView);
  const setView = useTodoStore(state => state.setView);
  const currentTab = useTodoStore(state => state.currentTab);
  const setTab = useTodoStore(state => state.setTab);
  const openHomeSheet = useTodoStore(state => state.openHomeSheet);
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
          <button className={`tab-btn${currentTab === 'home' ? ' active' : ''}`} onClick={() => setTab('home')}>
            {currentTab === 'home' ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2.59619L22 9.86317V21C22 21.5523 21.5523 22 21 22H15V16H9V22H3C2.44772 22 2 21.5523 2 21V9.86317L12 2.59619Z" fill="currentColor"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              </svg>
            )}
            <span className="tab-btn-label">홈</span>
          </button>
          <button className={`tab-btn${currentTab === 'todo' ? ' active' : ''}`} onClick={() => setTab('todo')}>
            {currentTab === 'todo' ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 1C20.3137 1 23 3.68629 23 7V17C23 20.3137 20.3137 23 17 23H7C3.68629 23 1 20.3137 1 17V7C1 3.68629 3.68629 1 7 1H17ZM17.207 8.29297C16.8165 7.90244 16.1835 7.90244 15.793 8.29297L10.5 13.5859L8.20703 11.293C7.81651 10.9024 7.18349 10.9024 6.79297 11.293C6.40245 11.6835 6.40245 12.3165 6.79297 12.707L9.79297 15.707C9.9805 15.8946 10.2348 16 10.5 16C10.7652 16 11.0195 15.8946 11.207 15.707L17.207 9.70703C17.5976 9.31651 17.5976 8.68349 17.207 8.29297Z" fill="currentColor"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="20" height="20" rx="3.75" stroke="currentColor" strokeWidth="2"/>
                <path d="M7.5 12L10.5 15L16.5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

        {/* 홈탭: + 버튼 / 나머지: 뷰 전환 */}
        {currentTab === 'home' ? (
          <button className="tabbar-add" onClick={openHomeSheet} aria-label="일정 추가">
            <div className="tabbar-add-bg" />
            <Plus size={24} strokeWidth={2} style={{ position: 'relative', color: 'var(--label-primary)' }} />
          </button>
        ) : null}
        <div className="tabbar-view-area" style={currentTab === 'home' ? { display: 'none' } : undefined}>
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
