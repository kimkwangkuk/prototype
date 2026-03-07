import { useMemo, useRef, useEffect, useLayoutEffect, useState } from 'react';
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
  const baseDate            = useTodoStore(state => state.baseDate);
  const todos               = useTodoStore(state => state.todos);
  const openBottomSheet     = useTodoStore(state => state.openBottomSheet);
  const addTodoForDate      = useTodoStore(state => state.addTodoForDate);
  const nextMonthAction     = useTodoStore(state => state.nextMonth);
  const prevMonthAction     = useTodoStore(state => state.prevMonth);
  const editingTodoId       = useTodoStore(state => state.editingTodoId);
  const newlySavedTodoId    = useTodoStore(state => state.newlySavedTodoId);
  const clearNewlySavedTodo = useTodoStore(state => state.clearNewlySavedTodo);
  const [pulseTodoId, setPulseTodoId] = useState(null);
  const [focusedDay, setFocusedDay] = useState(() => formatDate(new Date()));

  useEffect(() => {
    if (editingTodoId === null) {
      setFocusedDay(formatDate(new Date()));
      // 키패드 닫힐 때 스페이서·스크롤 리셋
      if (spacerRef.current) spacerRef.current.style.height = '0px';
      if (containerRef.current) containerRef.current.scrollTop = 0;
      return;
    }
    // 편집 중인 할일이 .monthly-todos 내에서 보이도록 스크롤
    const scrollIntoView = () => {
      const editingEl = containerRef.current?.querySelector('.monthly-todo-item.editing');
      if (!editingEl) return;
      const todosContainer = editingEl.closest('.monthly-todos');
      if (!todosContainer) return;
      const elRect = editingEl.getBoundingClientRect();
      const containerRect = todosContainer.getBoundingClientRect();
      if (elRect.bottom > containerRect.bottom) {
        todosContainer.scrollBy({ top: elRect.bottom - containerRect.bottom + 4, behavior: 'smooth' });
      }
    };
    setTimeout(scrollIntoView, 50);
    // --numpad-h가 확정된 후 포커스 날짜 블록을 가시 영역 중앙으로 스크롤
    setTimeout(() => {
      const container = containerRef.current;
      const spacer    = spacerRef.current;
      if (!container || !spacer) return;
      const numpadH  = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--numpad-h')) || 0;
      const headerH  = document.querySelector('.header')?.getBoundingClientRect().bottom ?? 0;
      const visibleH = window.innerHeight - numpadH - headerH;
      spacer.style.height = `${visibleH}px`;
      const focusedCell = container.querySelector('.monthly-day-cell.focused');
      if (!focusedCell) return;
      const row = focusedCell.closest('.monthly-week-row');
      if (!row) return;
      const containerRect = container.getBoundingClientRect();
      const rowRect = row.getBoundingClientRect();
      const rowMid = rowRect.top - containerRect.top + container.scrollTop + rowRect.height / 2;
      container.scrollTo({ top: rowMid - visibleH / 2, behavior: 'smooth' });
    }, 50);
  }, [editingTodoId]);

  useEffect(() => {
    if (newlySavedTodoId !== null) {
      setPulseTodoId(newlySavedTodoId);
      clearNewlySavedTodo();
    }
  }, [newlySavedTodoId]);

  const weeks = useMemo(() => getMonthCalendar(baseDate), [baseDate]);

  const containerRef = useRef(null); // .monthly-content (스크롤 컨테이너)
  const bodyRef      = useRef(null); // .monthly-body (스와이프 애니메이션 대상)
  const spacerRef    = useRef(null);
  const stateRef     = useRef({ startX: 0, startY: 0, direction: null, animating: false });
  const actionsRef   = useRef({ nextMonth: nextMonthAction, prevMonth: prevMonthAction });
  useEffect(() => { actionsRef.current = { nextMonth: nextMonthAction, prevMonth: prevMonthAction }; });

  // 키보드 등장 시 컨테이너가 줄어들어도 각 행의 최소 높이를 고정
  useLayoutEffect(() => {
    const body = containerRef.current?.querySelector('.monthly-body');
    if (!body) return;
    const rows = body.querySelectorAll(':scope > .monthly-week-row');
    if (rows.length === 0) return;
    const rowHeight = Math.round(body.getBoundingClientRect().height / rows.length);
    rows.forEach(row => {
      row.style.minHeight = `${rowHeight}px`;
      row.style.flexShrink = '0';
    });
  }, [weeks.length]);

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
  const handleCellClick = (ds, inMonth) => {
    if (!inMonth) return;
    setFocusedDay(ds);
    document.body.classList.add('keyboard-open');
    addTodoForDate(ds);
  };

  const handleTodoClick = (e, todo) => {
    e.stopPropagation();
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
    <div className="monthly-content" ref={containerRef}>
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
                  className={`monthly-day-cell${isWeekend ? ' weekend' : ''}${!inMonth ? ' out-of-month' : ''}${focusedDay === ds ? ' focused' : ''}`}
                  onClick={() => handleCellClick(ds, inMonth)}
                >
                  <div className={`monthly-date-num${today ? ' today' : ''}`}>
                    {date.getDate()}
                  </div>
                  <div className="monthly-todos">
                    {dayTodos.map(todo => {
                      const subj      = subjects.find(s => s.id === todo.subjectId);
                      const completed = ['done', 'skip', 'cancel'].includes(todo.status);
                      const isEditing = editingTodoId === todo.id;
                      const isPulsing = pulseTodoId === todo.id;
                      return (
                        <button
                          key={todo.id}
                          className={`monthly-todo-item${isEditing ? ' editing' : ''}${isPulsing ? ' pulse-in' : ''}`}
                          onAnimationEnd={() => setPulseTodoId(null)}
                          onClick={(e) => handleTodoClick(e, todo)}
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
      <div ref={spacerRef} style={{ flexShrink: 0, height: 0 }} />
    </div>
  );
}
