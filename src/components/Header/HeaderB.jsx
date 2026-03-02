import { useState, useEffect } from 'react';
import useTodoStore from '../../store/useTodoStore';
import { formatDisplayDate, getDayOfWeekKR, isToday, getWeekDates, formatDate } from '../../utils/dateUtils';
import { Redo2 } from 'lucide-react';
import WeekDayBar from './WeekDayBar';
import VersionsButton from './VersionsButton';

export default function HeaderB() {
  const selectedDate = useTodoStore(state => state.selectedDate);
  const baseDate = useTodoStore(state => state.baseDate);
  const currentVariant = useTodoStore(state => state.currentVariant);
  const currentView = useTodoStore(state => state.currentView);
  const currentTab = useTodoStore(state => state.currentTab);
  const goToday = useTodoStore(state => state.goToday);
  const [showGoToday, setShowGoToday] = useState(false);

  const d = new Date(selectedDate + 'T00:00:00');
  const displayDate = formatDisplayDate(selectedDate);
  const dayKR = getDayOfWeekKR(d);

  // 주간뷰일 때 날짜 범위 계산
  const weekDates = getWeekDates(baseDate);
  const weekStart = formatDisplayDate(formatDate(weekDates[0]));
  const weekEnd = formatDisplayDate(formatDate(weekDates[6]));

  useEffect(() => {
    if (currentView === 'day') {
      setShowGoToday(!isToday(selectedDate));
    } else {
      // 주간뷰: 이번 주가 현재 주인지 확인
      const todayStr = formatDate(new Date());
      const weekDateStrs = weekDates.map(d => formatDate(d));
      setShowGoToday(!weekDateStrs.includes(todayStr));
    }
  }, [selectedDate, baseDate, currentView]);

  return (
    <div className="header">
      <div className="header-bg"></div>
      <div className="header-content">
        <div className="toolbar-top">
          <div className="toolbar-left">
            <div className="toolbar-date">
              {currentView === 'week' ? (
                <>
                  <span className="toolbar-date-main">{weekStart}</span>
                  <span className="toolbar-date-day"> - {weekEnd}</span>
                </>
              ) : (
                <>
                  <span className="toolbar-date-main">{displayDate}</span>
                  <span className="toolbar-date-day">({dayKR})</span>
                </>
              )}
            </div>
            {showGoToday && (
              <button className="btn-go-today" onClick={goToday}>
                <Redo2 size={18} strokeWidth={2} />
                <span>오늘</span>
              </button>
            )}
          </div>
          <div className="toolbar-right">
            <VersionsButton />
          </div>
        </div>
        {currentView === 'day' && currentTab !== 'calendar' && <WeekDayBar />}
      </div>
    </div>
  );
}
