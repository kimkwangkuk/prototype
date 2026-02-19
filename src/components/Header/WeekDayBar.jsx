import { useState, useEffect, useRef } from 'react';
import useTodoStore from '../../store/useTodoStore';
import { getWeekDates, formatDate, getDayOfWeekKR } from '../../utils/dateUtils';
import { getTodoCount, hasCheckIcon } from '../../utils/todoUtils';
import { useSwipe } from '../../hooks/useSwipe';

const todayStr = formatDate(new Date());

export default function WeekDayBar() {
  const baseDate = useTodoStore(state => state.baseDate);
  const selectedDate = useTodoStore(state => state.selectedDate);
  const todos = useTodoStore(state => state.todos);
  const selectDate = useTodoStore(state => state.selectDate);
  const nextWeek = useTodoStore(state => state.nextWeek);
  const prevWeek = useTodoStore(state => state.prevWeek);

  const dates = getWeekDates(baseDate);
  const swipeHandlers = useSwipe(nextWeek, prevWeek);

  // 전환 애니메이션: 이탈하는 숫자 보관
  const [exitingCounts, setExitingCounts] = useState({});
  const prevAllDoneRef = useRef({});
  const prevCountRef = useRef({}); // allDone 직전 마지막 숫자

  // 렌더 중 카운트 캡처 (0이 되기 전 값 보존)
  dates.forEach(d => {
    const ds = formatDate(d);
    const c = getTodoCount(todos, ds);
    if (c > 0) prevCountRef.current[ds] = c;
  });

  useEffect(() => {
    const newExiting = {};
    let hasNew = false;

    dates.forEach(d => {
      const ds = formatDate(d);
      const wasAllDone = prevAllDoneRef.current[ds] ?? false;
      const isNowAllDone = hasCheckIcon(todos, ds);

      if (!wasAllDone && isNowAllDone && prevCountRef.current[ds]) {
        newExiting[ds] = prevCountRef.current[ds];
        hasNew = true;
      }
      prevAllDoneRef.current[ds] = isNowAllDone;
    });

    if (hasNew) {
      setExitingCounts(prev => ({ ...prev, ...newExiting }));
      const t = setTimeout(() => {
        setExitingCounts(prev => {
          const next = { ...prev };
          Object.keys(newExiting).forEach(ds => delete next[ds]);
          return next;
        });
      }, 520);
      return () => clearTimeout(t);
    }
  }, [todos]);

  return (
    <div className="week-day-bar" {...swipeHandlers}>
      {dates.map(d => {
        const ds = formatDate(d);
        const isToday = ds === todayStr;
        const isActive = ds === selectedDate;
        const count = getTodoCount(todos, ds);
        const allDone = hasCheckIcon(todos, ds);
        const exitingCount = exitingCounts[ds];

        const boardClass = [
          'day-todo-board',
          isToday ? 'today' : '',
          allDone && !isToday ? 'all-done' : '',
        ].filter(Boolean).join(' ');

        return (
          <div
            key={ds}
            className={`day-date${isActive ? ' selected' : ''}`}
            onClick={() => selectDate(ds)}
          >
            <span className={`day-date-label${isActive ? ' active' : ''}`}>
              {d.getDate()}.{getDayOfWeekKR(d)}
            </span>
            <div className={boardClass}>
              {/* 이탈하는 숫자 (위로 사라짐) */}
              {exitingCount && !isToday && (
                <span className="day-todo-board-count board-count-exit">
                  {exitingCount}
                </span>
              )}
              {/* 메인 콘텐츠 */}
              {allDone ? (
                <svg
                  className={`day-todo-board-icon${!isToday ? ' board-icon-enter' : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : count > 0 ? (
                <span className="day-todo-board-count">{count}</span>
              ) : isToday ? (
                <span className="day-todo-board-count">0</span>
              ) : null}
            </div>
            <div className={`day-select-indicator${isActive ? ' visible' : ''}`} />
          </div>
        );
      })}
    </div>
  );
}
