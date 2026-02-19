import { useMemo, useState, useRef, useEffect } from 'react';
import useTodoStore from '../../store/useTodoStore';
import { subjects } from '../../config';
import { getWeekDates, formatDate, getDayOfWeekKR, isToday } from '../../utils/dateUtils';
import Checkbox from './TodoItem/Checkbox';

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];
const PAIRS = [['nav', 0], [1, 2], [3, 4], [5, 6]];
const SWIPE_THRESHOLD = 55;
const SNAP_MS = 300;
const NAV_ROW_H = 22; // .week-nav-row: 14px height + 4px*2 padding

function getMonthCalendar(baseDate) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const startDate = new Date(firstDay);
  startDate.setDate(1 - mondayOffset);

  const weeks = [];
  let d = new Date(startDate);
  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    weeks.push(week);
    if (week[0].getMonth() > month && week[0].getFullYear() >= year) break;
  }
  while (weeks.length > 0 && weeks[weeks.length - 1][0].getMonth() > month) {
    weeks.pop();
  }
  return weeks;
}

function WeekNavCell({ baseDate, currentWeekStrs, onWeekClick }) {
  const monthCalendar = useMemo(() => getMonthCalendar(baseDate), [baseDate]);
  const month = baseDate.getMonth();

  const currentRowIdx = useMemo(
    () => monthCalendar.findIndex(week => week.some(d => currentWeekStrs.has(formatDate(d)))),
    [monthCalendar, currentWeekStrs]
  );

  return (
    <div className="week-nav-cell">
      <div className="week-nav-day-labels">
        {DAY_LABELS.map(d => (
          <span key={d} className="week-nav-day-label">{d}</span>
        ))}
      </div>
      <div className="week-nav-rows">
        {/* Sliding week indicator */}
        {currentRowIdx >= 0 && (
          <div
            className="week-nav-indicator"
            style={{ top: currentRowIdx * NAV_ROW_H }}
          />
        )}
        {monthCalendar.map((week, wi) => (
          <button
            key={wi}
            className="week-nav-row"
            onClick={() => onWeekClick(week[0])}
          >
            {week.map((date, di) => {
              const ds = formatDate(date);
              const today = isToday(ds);
              const inMonth = date.getMonth() === month;
              const isWeekend = di >= 5;
              return (
                <span
                  key={ds}
                  className={[
                    'week-nav-date',
                    today ? 'today' : '',
                    !inMonth ? 'out-of-month' : '',
                    isWeekend && !today ? 'weekend' : '',
                  ].filter(Boolean).join(' ')}
                >
                  {date.getDate()}
                </span>
              );
            })}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function WeeklyContent() {
  const baseDate = useTodoStore(state => state.baseDate);
  const todos = useTodoStore(state => state.todos);
  const selectDate = useTodoStore(state => state.selectDate);
  const setBaseDate = useTodoStore(state => state.setBaseDate);
  const addTodo = useTodoStore(state => state.addTodo);
  const openBottomSheet = useTodoStore(state => state.openBottomSheet);
  const nextWeekAction = useTodoStore(state => state.nextWeek);
  const prevWeekAction = useTodoStore(state => state.prevWeek);

  const weekDates = useMemo(() => getWeekDates(baseDate), [baseDate]);
  const currentWeekStrs = useMemo(() => new Set(weekDates.map(d => formatDate(d))), [weekDates]);

  const prevBase = useMemo(() => { const d = new Date(baseDate); d.setDate(d.getDate() - 7); return d; }, [baseDate]);
  const nextBase = useMemo(() => { const d = new Date(baseDate); d.setDate(d.getDate() + 7); return d; }, [baseDate]);
  const prevWeekDates = useMemo(() => getWeekDates(prevBase), [prevBase]);
  const nextWeekDates = useMemo(() => getWeekDates(nextBase), [nextBase]);
  const prevWeekStrs = useMemo(() => new Set(prevWeekDates.map(d => formatDate(d))), [prevWeekDates]);
  const nextWeekStrs = useMemo(() => new Set(nextWeekDates.map(d => formatDate(d))), [nextWeekDates]);

  const containerRef = useRef(null);
  const [swipeX, setSwipeX] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  // Refs so touch handlers (created once) can access latest values
  const containerWRef = useRef(window.innerWidth);
  const transitioningRef = useRef(false);
  const nextWeekRef = useRef(nextWeekAction);
  const prevWeekRef = useRef(prevWeekAction);
  const activeSwipeRef = useRef(false);

  useEffect(() => { nextWeekRef.current = nextWeekAction; }, [nextWeekAction]);
  useEffect(() => { prevWeekRef.current = prevWeekAction; }, [prevWeekAction]);

  useEffect(() => {
    if (containerRef.current) {
      containerWRef.current = containerRef.current.offsetWidth;
    }
  }, []);

  // Attach touch events once with passive:false on touchmove
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let startX = 0, startY = 0;
    let isHorizontal = null;
    let swipeDelta = 0;

    const onStart = (e) => {
      if (transitioningRef.current) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isHorizontal = null;
      swipeDelta = 0;
      activeSwipeRef.current = false;
    };

    const onMove = (e) => {
      if (transitioningRef.current) return;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;

      if (isHorizontal === null) {
        if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
          isHorizontal = Math.abs(dx) > Math.abs(dy);
        }
        return;
      }
      if (!isHorizontal) return;

      e.preventDefault();
      activeSwipeRef.current = true;
      swipeDelta = dx;
      setSwipeX(dx);
    };

    const onEnd = () => {
      if (!activeSwipeRef.current) return;

      const W = containerWRef.current;
      const dx = swipeDelta;

      if (dx < -SWIPE_THRESHOLD) {
        transitioningRef.current = true;
        setTransitioning(true);
        setSwipeX(-W);
        setTimeout(() => {
          nextWeekRef.current();
          setSwipeX(0);
          setTransitioning(false);
          transitioningRef.current = false;
        }, SNAP_MS);
      } else if (dx > SWIPE_THRESHOLD) {
        transitioningRef.current = true;
        setTransitioning(true);
        setSwipeX(W);
        setTimeout(() => {
          prevWeekRef.current();
          setSwipeX(0);
          setTransitioning(false);
          transitioningRef.current = false;
        }, SNAP_MS);
      } else {
        transitioningRef.current = true;
        setTransitioning(true);
        setSwipeX(0);
        setTimeout(() => {
          setTransitioning(false);
          transitioningRef.current = false;
        }, SNAP_MS);
      }

      activeSwipeRef.current = false;
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd, { passive: true });
    el.addEventListener('touchcancel', onEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('touchcancel', onEnd);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdd = (dateStr) => {
    if (activeSwipeRef.current || transitioningRef.current) return;
    selectDate(dateStr);
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)].id;
    addTodo(randomSubject);
  };

  const handleTodoClick = (todo) => {
    openBottomSheet('edit', {
      todoId: todo.id,
      category: todo.subjectId,
      status: todo.status,
      text: todo.text,
      time: todo.time || '',
      duration: todo.duration,
    });
  };

  const handleCheckboxClick = (e, todo) => {
    e.stopPropagation();
    openBottomSheet('status-only', {
      todoId: todo.id,
      category: todo.subjectId,
      status: todo.status,
      text: todo.text,
      time: todo.time || '',
      duration: todo.duration,
    });
  };

  const renderPanel = (panelDates, panelBase, panelWeekStrs) => (
    <>
      {PAIRS.map(([leftIdx, rightIdx], rowIdx) => (
        <div key={rowIdx} className="week-row">
          {[leftIdx, rightIdx].map((idx) => {
            if (idx === 'nav') {
              return (
                <WeekNavCell
                  key="nav"
                  baseDate={panelBase}
                  currentWeekStrs={panelWeekStrs}
                  onWeekClick={setBaseDate}
                />
              );
            }

            const date = panelDates[idx];
            const ds = formatDate(date);
            const dayTodos = todos[ds] || [];
            const today = isToday(ds);

            return (
              <div key={ds} className="week-day-col" onClick={() => handleAdd(ds)}>
                <div className="week-day-col-header">
                  <span className={`week-day-col-num${today ? ' today' : ''}`}>
                    {date.getDate()}.
                  </span>
                  <span className="week-day-col-name">{getDayOfWeekKR(date)}</span>
                </div>
                <div className="week-day-col-todos">
                  {dayTodos.map(todo => {
                    const subj = subjects.find(s => s.id === todo.subjectId);
                    const completed = ['done', 'skip', 'cancel'].includes(todo.status);
                    return (
                      <button
                        key={todo.id}
                        className="week-todo-item"
                        onClick={(e) => { e.stopPropagation(); handleTodoClick(todo); }}
                      >
                        <div className="week-todo-check" onClick={(e) => handleCheckboxClick(e, todo)}>
                          <Checkbox status={todo.status} color={subj?.color} />
                        </div>
                        <span className={`week-todo-text${completed ? ' completed' : ''}`}>
                          {todo.text || '할 일...'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </>
  );

  const W = containerWRef.current;
  const trackStyle = {
    display: 'flex',
    flexDirection: 'row',
    width: `${W * 3}px`,
    transform: `translateX(${-W + swipeX}px)`,
    transition: transitioning
      ? `transform ${SNAP_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
      : 'none',
    willChange: 'transform',
  };

  const panelStyle = {
    width: `${W}px`,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <div className="weekly-content" ref={containerRef} style={{ overflow: 'hidden' }}>
      <div style={trackStyle}>
        <div style={panelStyle}>{renderPanel(prevWeekDates, prevBase, prevWeekStrs)}</div>
        <div style={panelStyle}>{renderPanel(weekDates, baseDate, currentWeekStrs)}</div>
        <div style={panelStyle}>{renderPanel(nextWeekDates, nextBase, nextWeekStrs)}</div>
      </div>
    </div>
  );
}
