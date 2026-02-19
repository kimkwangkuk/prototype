import { useState, useEffect, useRef } from 'react';
import useTodoStore from '../../store/useTodoStore';

export default function Tabbar() {
  const currentView = useTodoStore(state => state.currentView);
  const setView = useTodoStore(state => state.setView);
  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(1);

  const tabbarRef = useRef(null);
  const indicatorRef = useRef(null);
  const tabBtnRefs = useRef([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const handleViewSelect = (view) => {
    setView(view);
    setViewMenuOpen(false);
  };

  useEffect(() => {
    const updateIndicator = () => {
      const tabEl = tabBtnRefs.current[activeTab];
      const containerEl = indicatorRef.current;
      if (!tabEl || !containerEl) return;
      const tabRect = tabEl.getBoundingClientRect();
      const containerRect = containerEl.getBoundingClientRect();
      setIndicatorStyle({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
      });
    };

    const timeout = setTimeout(updateIndicator, 0);
    window.addEventListener('resize', updateIndicator);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [activeTab]);

  return (
    <div className="tabbar" ref={tabbarRef}>
      <div className="tabbar-gradient"></div>
      {viewMenuOpen && (
        <div className="tabbar-overlay" onClick={() => setViewMenuOpen(false)} />
      )}
      <div className="tabbar-inner">
        <div className="tabbar-group">
          <div className="tabbar-group-bg"></div>

          {/* 홈 */}
          <button
            ref={el => tabBtnRefs.current[0] = el}
            className={`tab-btn${activeTab === 0 ? ' active' : ''}`}
            onClick={() => setActiveTab(0)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            </svg>
            <span className="tab-btn-label">홈</span>
          </button>

          {/* 할일 */}
          <button
            ref={el => tabBtnRefs.current[1] = el}
            className={`tab-btn${activeTab === 1 ? ' active' : ''}`}
            onClick={() => setActiveTab(1)}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 5a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 3a1 1 0 000 2h4a1 1 0 100-2H7zm0 4a1 1 0 100 2h8a1 1 0 100-2H7zm0 4a1 1 0 100 2h6a1 1 0 100-2H7z"/>
            </svg>
            <span className="tab-btn-label">할일</span>
          </button>

          {/* 캘린더 */}
          <button
            ref={el => tabBtnRefs.current[2] = el}
            className={`tab-btn${activeTab === 2 ? ' active' : ''}`}
            onClick={() => setActiveTab(2)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span className="tab-btn-label">캘린더</span>
          </button>

          {/* 그룹 */}
          <button
            ref={el => tabBtnRefs.current[3] = el}
            className={`tab-btn${activeTab === 3 ? ' active' : ''}`}
            onClick={() => setActiveTab(3)}
          >
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
            <button
              className={`view-dial-btn${currentView === 'month' ? ' active' : ''}`}
              onClick={() => handleViewSelect('month')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2.5"/>
                <line x1="3" y1="8.5" x2="21" y2="8.5"/>
                <line x1="9" y1="8.5" x2="9" y2="21"/>
                <line x1="15" y1="8.5" x2="15" y2="21"/>
                <line x1="3" y1="13.5" x2="21" y2="13.5"/>
                <line x1="3" y1="18.5" x2="21" y2="18.5"/>
              </svg>
              <span>월</span>
            </button>
            <button
              className={`view-dial-btn${currentView === 'week' ? ' active' : ''}`}
              onClick={() => handleViewSelect('week')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 7.725V6.5C2 4.29086 3.79086 2.5 6 2.5H18C20.2091 2.5 22 4.29086 22 6.5V7.725M2 7.725V13.9M2 7.725H12M22 7.725V13.9M22 7.725H12M22 13.9V17.5C22 19.7091 20.2091 21.5 18 21.5H12M22 13.9H2M2 13.9V17.5C2 19.7091 3.79086 21.5 6 21.5H12M12 7.725V21.5"/>
              </svg>
              <span>주</span>
            </button>
            <button
              className={`view-dial-btn${currentView === 'day' ? ' active' : ''}`}
              onClick={() => handleViewSelect('day')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="8" rx="2.5"/>
                <rect x="2" y="14" width="20" height="8" rx="2.5"/>
              </svg>
              <span>일</span>
            </button>
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
            ) : currentView === 'month' ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2.5"/>
                  <line x1="3" y1="8.5" x2="21" y2="8.5"/>
                  <line x1="9" y1="8.5" x2="9" y2="21"/>
                  <line x1="15" y1="8.5" x2="15" y2="21"/>
                  <line x1="3" y1="13.5" x2="21" y2="13.5"/>
                  <line x1="3" y1="18.5" x2="21" y2="18.5"/>
                </svg>
                <span className="tabbar-add-label">월</span>
              </>
            ) : currentView === 'week' ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 7.725V6.5C2 4.29086 3.79086 2.5 6 2.5H18C20.2091 2.5 22 4.29086 22 6.5V7.725M2 7.725V13.9M2 7.725H12M22 7.725V13.9M22 7.725H12M22 13.9V17.5C22 19.7091 20.2091 21.5 18 21.5H12M22 13.9H2M2 13.9V17.5C2 19.7091 3.79086 21.5 6 21.5H12M12 7.725V21.5"/>
                </svg>
                <span className="tabbar-add-label">주</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="8" rx="2.5"/>
                  <rect x="2" y="14" width="20" height="8" rx="2.5"/>
                </svg>
                <span className="tabbar-add-label">일</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="tabbar-indicator" ref={indicatorRef}>
        <div
          className="tabbar-indicator-bar"
          style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
        ></div>
      </div>
    </div>
  );
}
