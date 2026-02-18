import { useState, useEffect } from 'react';
import useTodoStore from '../../store/useTodoStore';
import { formatDisplayDate, getDayOfWeekKR, isToday } from '../../utils/dateUtils';
import { Redo2 } from 'lucide-react';
import WeekDayBar from './WeekDayBar';

export default function HeaderB() {
  const selectedDate = useTodoStore(state => state.selectedDate);
  const goToday = useTodoStore(state => state.goToday);
  const [showGoToday, setShowGoToday] = useState(false);

  const d = new Date(selectedDate + 'T00:00:00');
  const displayDate = formatDisplayDate(selectedDate);
  const dayKR = getDayOfWeekKR(d);

  useEffect(() => {
    setShowGoToday(!isToday(selectedDate));
  }, [selectedDate]);

  return (
    <div className="header">
      <div className="header-bg"></div>
      <div className="header-content">
        <div className="toolbar-top">
          <div className="toolbar-left">
            <div className="toolbar-date">
              <span className="toolbar-date-main">{displayDate}</span>
              <span className="toolbar-date-day">({dayKR})</span>
            </div>
            {showGoToday && (
              <button className="btn-go-today" onClick={goToday}>
                <Redo2 size={18} strokeWidth={2} />
                <span>오늘</span>
              </button>
            )}
          </div>
          <div className="toolbar-right">
            <button className="btn-icon" aria-label="메뉴">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="4" y1="5" x2="20" y2="5"/>
                <line x1="4" y1="12" x2="20" y2="12"/>
                <line x1="4" y1="19" x2="20" y2="19"/>
              </svg>
            </button>
          </div>
        </div>
        <WeekDayBar />
      </div>
    </div>
  );
}
