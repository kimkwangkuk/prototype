import { useState, useEffect, useRef } from 'react';
import useTodoStore from '../../store/useTodoStore';
import { getWeekDates, formatDate, getDayOfWeekKR } from '../../utils/dateUtils';
import { getTodoCount, hasCheckIcon } from '../../utils/todoUtils';
import { useSwipe } from '../../hooks/useSwipe';

const todayStr = formatDate(new Date());
const INDICATOR_W = 28; // day-todo-board 너비와 동일

export default function WeekDayBar() {
  const baseDate = useTodoStore(state => state.baseDate);
  const selectedDate = useTodoStore(state => state.selectedDate);
  const todos = useTodoStore(state => state.todos);
  const selectDate = useTodoStore(state => state.selectDate);
  const nextWeek = useTodoStore(state => state.nextWeek);
  const prevWeek = useTodoStore(state => state.prevWeek);

  const dates = getWeekDates(baseDate);
  const swipeHandlers = useSwipe(nextWeek, prevWeek);

  // 슬라이딩 인디케이터
  const containerRef = useRef(null);
  const dayRefs = useRef([]);
  const [sliderLeft, setSliderLeft] = useState(null);

  useEffect(() => {
    const selectedIdx = dates.findIndex(d => formatDate(d) === selectedDate);
    if (selectedIdx < 0) return;
    const dayEl = dayRefs.current[selectedIdx];
    const containerEl = containerRef.current;
    if (!dayEl || !containerEl) return;
    const dayRect = dayEl.getBoundingClientRect();
    const containerRect = containerEl.getBoundingClientRect();
    setSliderLeft(dayRect.left - containerRect.left + (dayRect.width - INDICATOR_W) / 2);
  }, [selectedDate, baseDate]);

  // 전환 애니메이션: 이탈하는 숫자 보관 + allDone 진입 추적
  const [exitingCounts, setExitingCounts] = useState({});
  const [enteringDates, setEnteringDates] = useState(new Set());
  const prevAllDoneRef = useRef({});
  const prevCountRef = useRef({});

  dates.forEach(d => {
    const ds = formatDate(d);
    const c = getTodoCount(todos, ds);
    if (c > 0) prevCountRef.current[ds] = c;
  });

  useEffect(() => {
    const newExiting = {};
    const newEntering = [];

    dates.forEach(d => {
      const ds = formatDate(d);
      const wasAllDone = prevAllDoneRef.current[ds] ?? false;
      const isNowAllDone = hasCheckIcon(todos, ds);

      if (!wasAllDone && isNowAllDone) {
        if (prevCountRef.current[ds]) newExiting[ds] = prevCountRef.current[ds];
        newEntering.push(ds);
      }
      prevAllDoneRef.current[ds] = isNowAllDone;
    });

    const timers = [];

    if (Object.keys(newExiting).length > 0) {
      setExitingCounts(prev => ({ ...prev, ...newExiting }));
      timers.push(setTimeout(() => {
        setExitingCounts(prev => {
          const next = { ...prev };
          Object.keys(newExiting).forEach(ds => delete next[ds]);
          return next;
        });
      }, 520));
    }

    if (newEntering.length > 0) {
      setEnteringDates(prev => new Set([...prev, ...newEntering]));
      timers.push(setTimeout(() => {
        setEnteringDates(prev => {
          const next = new Set(prev);
          newEntering.forEach(ds => next.delete(ds));
          return next;
        });
      }, 600));
    }

    return () => timers.forEach(clearTimeout);
  }, [todos]);

  return (
    <div className="week-day-bar" ref={containerRef} {...swipeHandlers}>
      {dates.map((d, i) => {
        const ds = formatDate(d);
        const isToday = ds === todayStr;
        const isActive = ds === selectedDate;
        const count = getTodoCount(todos, ds);
        const allDone = hasCheckIcon(todos, ds);
        const exitingCount = exitingCounts[ds];
        const isEntering = enteringDates.has(ds);

        const boardClass = [
          'day-todo-board',
          allDone ? 'all-done' : '',
        ].filter(Boolean).join(' ');

        return (
          <div
            key={ds}
            ref={el => dayRefs.current[i] = el}
            className={`day-date${isActive ? ' selected' : ''}`}
            onClick={() => selectDate(ds)}
          >
            <span className={`day-date-label${isToday ? ' today' : ''}`}>
              {d.getDate()}.{getDayOfWeekKR(d)}
            </span>
            <div className={boardClass}>
              {exitingCount && (
                <span className="day-todo-board-count board-count-exit">
                  {exitingCount}
                </span>
              )}
              {allDone ? (
                <svg
                  className={`day-todo-board-icon${isEntering ? ' board-icon-enter' : ''}`}
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
              ) : (
                <span className="day-todo-board-dash" />
              )}
            </div>
          </div>
        );
      })}

      {sliderLeft !== null && (
        <div
          className="week-day-bar-slider"
          style={{ left: sliderLeft, width: INDICATOR_W }}
        />
      )}
    </div>
  );
}
