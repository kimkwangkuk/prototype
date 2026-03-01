import { useMemo, useRef, useEffect } from 'react';
import useTodoStore from '../../store/useTodoStore';
import { subjects } from '../../config';
import { formatDate, isToday } from '../../utils/dateUtils';

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];
const SWIPE_THRESHOLD = 55;
const FADE_DISTANCE   = 130;

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

export default function MonthlyContent() {
  const baseDate        = useTodoStore(state => state.baseDate);
  const todos           = useTodoStore(state => state.todos);
  const openBottomSheet = useTodoStore(state => state.openBottomSheet);
  const nextMonthAction = useTodoStore(state => state.nextMonth);
  const prevMonthAction = useTodoStore(state => state.prevMonth);

  const weeks = useMemo(() => getMonthCalendar(baseDate), [baseDate]);

  const bodyRef    = useRef(null);
  const stateRef   = useRef({ startX: 0, startY: 0, direction: null, animating: false });
  const actionsRef = useRef({ nextMonth: nextMonthAction, prevMonth: prevMonthAction });
  useEffect(() => { actionsRef.current = { nextMonth: nextMonthAction, prevMonth: prevMonthAction }; });

  // ─── 터치 스와이프 ─────────────────────────────────────────────────────────
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const s = stateRef.current;

    // monthly-body 전체에 직접 스타일 적용 (요일 헤더는 건드리지 않음)
    const applyStyle = (opacity, tx, transition = 'none') => {
      el.style.transition = transition;
      el.style.opacity    = String(opacity);
      el.style.transform  = `translateX(${tx}px)`;
    };

    function onStart(e) {
      s.direction = null;
      if (s.animating) return;
      s.startX = e.touches[0].clientX;
      s.startY = e.touches[0].clientY;
    }

    function onMove(e) {
      if (s.animating) return;
      const dx  = e.touches[0].clientX - s.startX;
      const dy  = e.touches[0].clientY - s.startY;
      const adx = Math.abs(dx);
      const ady = Math.abs(dy);

      if (s.direction === null) {
        if (adx < 10 && ady < 10) return;
        s.direction = adx >= ady * 2 ? 'h' : 'v';
      }
      if (s.direction !== 'h') return;

      e.preventDefault();

      const progress = Math.min(adx / FADE_DISTANCE, 1);
      el.style.transition = 'none';
      el.style.opacity    = String(1 - progress * 0.85);
      el.style.transform  = `translateX(${dx * 0.18}px)`;
    }

    function onEnd(e) {
      if (s.animating) return;
      if (s.direction !== 'h') return;

      const dx     = e.changedTouches[0].clientX - s.startX;
      const goLeft = dx < 0;

      if (Math.abs(dx) < SWIPE_THRESHOLD) {
        applyStyle(1, 0, 'opacity 0.2s ease, transform 0.2s ease');
        return;
      }

      s.animating = true;
      el.style.pointerEvents = 'none';

      // 1) 슬라이드 아웃
      applyStyle(0, goLeft ? -30 : 30, 'opacity 0.12s ease-out, transform 0.12s ease-out');

      setTimeout(() => {
        // 2) 월 변경
        goLeft ? actionsRef.current.nextMonth() : actionsRef.current.prevMonth();

        // 3) 반대편 대기 위치
        applyStyle(0, goLeft ? 30 : -30, 'none');

        // 4) 슬라이드 인
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            applyStyle(1, 0, 'opacity 0.22s ease-in, transform 0.22s ease-in');
            setTimeout(() => {
              el.style.transition    = '';
              el.style.opacity       = '';
              el.style.transform     = '';
              el.style.pointerEvents = '';
              s.animating = false;
            }, 240);
          });
        });
      }, 130);
    }

    function onCancel() {
      s.direction = null;
      if (!s.animating) applyStyle(1, 0, 'opacity 0.15s ease, transform 0.15s ease');
    }

    // monthly-content 전체에서 터치 감지 (요일 헤더 위에서 스와이프해도 작동)
    const container = el.closest('.monthly-content');
    container.addEventListener('touchstart',  onStart,  { passive: true  });
    container.addEventListener('touchmove',   onMove,   { passive: false });
    container.addEventListener('touchend',    onEnd,    { passive: true  });
    container.addEventListener('touchcancel', onCancel, { passive: true  });

    return () => {
      container.removeEventListener('touchstart',  onStart);
      container.removeEventListener('touchmove',   onMove);
      container.removeEventListener('touchend',    onEnd);
      container.removeEventListener('touchcancel', onCancel);
    };
  }, []);

  // ─── 렌더 ─────────────────────────────────────────────────────────────────
  const handleTodoClick = (todo) => {
    openBottomSheet('edit', {
      todoId:   todo.id,
      category: todo.subjectId,
      status:   todo.status,
      text:     todo.text,
      time:     todo.time || '',
      duration: todo.duration,
    });
  };

  return (
    <div className="monthly-content">
      {/* 요일 헤더: 고정 */}
      <div className="monthly-day-labels">
        {DAY_LABELS.map((d, i) => (
          <span key={d} className={`monthly-day-label${i >= 5 ? ' weekend' : ''}`}>{d}</span>
        ))}
      </div>

      {/* 날짜 그리드 전체: 스와이프 대상 */}
      <div className="monthly-body" ref={bodyRef} style={{ willChange: 'opacity, transform', overflow: 'hidden' }}>
        {weeks.map((week, wi) => (
          <div key={wi} className="monthly-week-row">
            {week.map((date, di) => {
              const ds       = formatDate(date);
              const dayTodos = todos[ds] || [];
              const today    = isToday(ds);
              const inMonth  = date.getMonth() === baseDate.getMonth();
              const isWeekend = di >= 5;

              return (
                <div
                  key={ds}
                  className={`monthly-day-cell${isWeekend ? ' weekend' : ''}${!inMonth ? ' out-of-month' : ''}`}
                >
                  <div className={`monthly-date-num${today ? ' today' : ''}`}>
                    {date.getDate()}
                  </div>
                  <div className="monthly-todos">
                    {dayTodos.map(todo => {
                      const subj      = subjects.find(s => s.id === todo.subjectId);
                      const completed = ['done', 'skip', 'cancel'].includes(todo.status);
                      return (
                        <button
                          key={todo.id}
                          className="monthly-todo-item"
                          onClick={() => handleTodoClick(todo)}
                        >
                          <span className="monthly-todo-dot" style={{ background: subj?.color }}></span>
                          <span className={`monthly-todo-text${completed ? ' completed' : ''}`}>
                            {todo.text || '...'}
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
      </div>
    </div>
  );
}
