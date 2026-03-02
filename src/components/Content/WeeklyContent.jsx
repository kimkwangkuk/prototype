import { useMemo, useRef, useEffect } from 'react';
import useTodoStore from '../../store/useTodoStore';
import { subjects } from '../../config';
import { getWeekDates, formatDate, getDayOfWeekKR, isToday } from '../../utils/dateUtils';
import Checkbox from './TodoItem/Checkbox';

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];
const PAIRS = [['nav', 0], [1, 2], [3, 4], [5, 6]];
const SWIPE_THRESHOLD = 55;
const FADE_DISTANCE   = 120;
const NAV_ROW_H       = 22;

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

function WeekTodoEditInput({ text }) {
  const inputRef = useRef(null);
  const updateBottomSheetField = useTodoStore(state => state.updateBottomSheetField);
  const saveAndAddNewTodo = useTodoStore(state => state.saveAndAddNewTodo);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    // iOS는 focus 시 overflow-y:auto 컨테이너를 자동 스크롤해 화면이 아래로 쏠림.
    // scroll 위치를 저장 후 복원해 점프 방지.
    const container = document.querySelector('.weekly-content');
    const savedScroll = container?.scrollTop ?? 0;
    el.removeAttribute('readonly');
    el.focus();
    if (container) {
      container.scrollTop = savedScroll;
      requestAnimationFrame(() => { container.scrollTop = savedScroll; });
    }
  }, []);

  return (
    <input
      ref={inputRef}
      type="text"
      readOnly
      className="week-todo-text week-todo-edit-input"
      value={text}
      onChange={(e) => updateBottomSheetField('text', e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          saveAndAddNewTodo();
        }
      }}
      placeholder="할 일 입력..."
    />
  );
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
  const baseDate        = useTodoStore(state => state.baseDate);
  const todos           = useTodoStore(state => state.todos);
  const selectDate      = useTodoStore(state => state.selectDate);
  const setBaseDate     = useTodoStore(state => state.setBaseDate);
  const addTodo         = useTodoStore(state => state.addTodo);
  const openBottomSheet = useTodoStore(state => state.openBottomSheet);
  const nextWeekAction  = useTodoStore(state => state.nextWeek);
  const prevWeekAction  = useTodoStore(state => state.prevWeek);
  const editingTodoId   = useTodoStore(state => state.editingTodoId);

  const weekDates       = useMemo(() => getWeekDates(baseDate), [baseDate]);
  const currentWeekStrs = useMemo(() => new Set(weekDates.map(d => formatDate(d))), [weekDates]);

  const containerRef = useRef(null);
  // 모든 변경 가능 상태를 ref 하나로 관리 (React 렌더 루프 밖에서 동작)
  const stateRef   = useRef({ startX: 0, startY: 0, direction: null, animating: false });
  const actionsRef = useRef({ nextWeek: nextWeekAction, prevWeek: prevWeekAction });
  useEffect(() => { actionsRef.current = { nextWeek: nextWeekAction, prevWeek: prevWeekAction }; });

  // 편집 중일 때 padding-bottom 추가 → 하단 행도 스크롤 가능하게
  // (콘텐츠 높이 < 컨테이너 높이면 scrollTo 불가 → 패딩으로 스크롤 영역 확보)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (editingTodoId !== null) {
      el.style.paddingBottom = `${window.innerHeight * 0.55}px`;
    } else {
      el.style.paddingBottom = '';
      el.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [editingTodoId]);

  // ─── 터치 스와이프 ────────────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const s = stateRef.current;

    // 각 날짜 블록의 내부 컨텐츠 wrapper들 (블록 테두리/배경은 그대로, 텍스트만 페이드+이동)
    const getInners = () => container.querySelectorAll('.week-cell-content');

    const setStyle = (opacity, tx, transition = 'none') => {
      getInners().forEach(el => {
        el.style.transition = transition;
        el.style.opacity    = String(opacity);
        el.style.transform  = `translateX(${tx}px)`;
      });
    };

    function onStart(e) {
      s.direction = null;                 // 항상 방향 리셋
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

      // 10px 미만은 방향 결정 보류
      if (s.direction === null) {
        if (adx < 10 && ady < 10) return;
        // 가로가 세로의 2배 이상일 때만 수평으로 확정 → 세로 스크롤 오판 방지
        s.direction = adx >= ady * 2 ? 'h' : 'v';
      }
      if (s.direction !== 'h') return;

      // 수평 확정 후에만 스크롤 차단 (passive:false 이므로 실제 작동)
      e.preventDefault();

      // 드래그 거리에 비례해 실시간 페이드 + 드래그 방향으로 이동 (직접 DOM 조작 → 60fps)
      const progress = Math.min(adx / FADE_DISTANCE, 1);
      getInners().forEach(el => {
        el.style.transition = 'none';
        el.style.opacity    = String(1 - progress * 0.85);
        el.style.transform  = `translateX(${dx * 0.18}px)`;  // 블록 내에서 드래그 방향으로 이동
      });
    }

    function onEnd(e) {
      if (s.animating) return;
      if (s.direction !== 'h') return;   // 수직이거나 탭이면 무시

      const dx     = e.changedTouches[0].clientX - s.startX;
      const goLeft = dx < 0;

      if (Math.abs(dx) < SWIPE_THRESHOLD) {
        // 임계값 미달 → 스냅백 (원위치로)
        setStyle(1, 0, 'opacity 0.2s ease, transform 0.2s ease');
        return;
      }

      // ── 주 전환 애니메이션 ──────────────────────────────
      s.animating = true;
      container.style.pointerEvents = 'none';    // 전환 중 터치 차단

      // 1) 슬라이드 아웃 (드래그 방향으로 날아가듯)
      setStyle(0, goLeft ? -28 : 28, 'opacity 0.12s ease-out, transform 0.12s ease-out');

      setTimeout(() => {
        // 2) 주 변경 (Zustand store 업데이트 → React 리렌더)
        goLeft ? actionsRef.current.nextWeek() : actionsRef.current.prevWeek();

        // 3) 반대편 대기 위치로 순간 이동 (transition 없이)
        setStyle(0, goLeft ? 28 : -28, 'none');

        // 4) 두 프레임 대기 후 슬라이드 인 (새 컨텐츠가 DOM에 반영된 뒤)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setStyle(1, 0, 'opacity 0.22s ease-in, transform 0.22s ease-in');
            setTimeout(() => {
              // 인라인 스타일 초기화 (CSS가 다시 주도)
              getInners().forEach(el => {
                el.style.transition = '';
                el.style.opacity    = '';
                el.style.transform  = '';
              });
              container.style.pointerEvents = '';
              s.animating = false;
            }, 240);
          });
        });
      }, 130);
    }

    function onCancel() {
      s.direction = null;
      if (!s.animating) setStyle(1, 0, 'opacity 0.15s ease, transform 0.15s ease');
    }

    container.addEventListener('touchstart',  onStart,  { passive: true  });
    container.addEventListener('touchmove',   onMove,   { passive: false }); // ← preventDefault 가능
    container.addEventListener('touchend',    onEnd,    { passive: true  });
    container.addEventListener('touchcancel', onCancel, { passive: true  });

    return () => {
      container.removeEventListener('touchstart',  onStart);
      container.removeEventListener('touchmove',   onMove);
      container.removeEventListener('touchend',    onEnd);
      container.removeEventListener('touchcancel', onCancel);
    };
  }, []);

  // ─── 핸들러 ────────────────────────────────────────────────────────────────
  const handleAdd = (dateStr) => {
    if (stateRef.current.animating) return;
    // 리렌더 전에 미리 keyboard-open 추가 → 탭바 플래시 방지
    document.body.classList.add('keyboard-open');
    selectDate(dateStr);
    addTodo(subjects[0].id);

    // 새 할일 아이템을 weekly-content 중앙에 스크롤
    // 350ms: iOS 키보드 애니메이션(~300ms) 완료 후 실행
    // visualViewport.height: 키보드 위 실제 가시 영역 높이 (layout viewport 전체 높이 X)
    setTimeout(() => {
      const contentEl = containerRef.current;
      const editingItem = contentEl?.querySelector('.week-todo-item.editing');
      if (editingItem && contentEl) {
        const itemRect = editingItem.getBoundingClientRect();
        const contentRect = contentEl.getBoundingClientRect();
        const visibleHeight = window.visualViewport?.height ?? window.innerHeight;
        const scrollTarget = contentEl.scrollTop + (itemRect.top - contentRect.top) - (visibleHeight / 2) + (itemRect.height / 2);
        contentEl.scrollTo({ top: scrollTarget, behavior: 'smooth' });
      }
    }, 350);
  };

  const handleTodoClick = (todo) => {
    openBottomSheet('detail', {
      todoId:   todo.id,
      category: todo.subjectId,
      status:   todo.status,
      text:     todo.text,
      time:     todo.time || '',
      duration: todo.duration,
      date:     todo.date || 'today',
    });
  };

  const handleCheckboxClick = (e, todo) => {
    e.stopPropagation();
    document.activeElement?.blur();
    openBottomSheet('status-only', {
      todoId:   todo.id,
      category: todo.subjectId,
      status:   todo.status,
      text:     todo.text,
      time:     todo.time || '',
      duration: todo.duration,
      date:     todo.date || 'today',
    });
  };

  // ─── 그리드 렌더 ────────────────────────────────────────────────────────────
  const renderGrid = () => (
    <>
      {PAIRS.map(([leftIdx, rightIdx], rowIdx) => (
        <div key={rowIdx} className="week-row">
          {[leftIdx, rightIdx].map((idx) => {
            // 캘린더(nav) 블록: 구조·배경 완전 고정, 페이드 없음
            if (idx === 'nav') {
              return (
                <WeekNavCell
                  key="nav"
                  baseDate={baseDate}
                  currentWeekStrs={currentWeekStrs}
                  onWeekClick={setBaseDate}
                />
              );
            }

            const date     = weekDates[idx];
            const ds       = formatDate(date);
            const dayTodos = todos[ds] || [];
            const today    = isToday(ds);

            return (
              // 외부 블록(.week-day-col): 테두리·배경 고정
              <div key={ds} className="week-day-col" onClick={() => handleAdd(ds)}>
                {/* 내부 컨텐츠(.week-cell-content): 텍스트·할일만 페이드 대상 */}
                <div
                  className="week-cell-content"
                  style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
                >
                  <div className="week-day-col-header">
                    <span className={`week-day-col-num${today ? ' today' : ''}`}>
                      {date.getDate()}.
                    </span>
                    <span className="week-day-col-name">{getDayOfWeekKR(date)}</span>
                  </div>
                  <div className="week-day-col-todos">
                    {dayTodos.map(todo => {
                      const subj      = subjects.find(s => s.id === todo.subjectId);
                      const completed = ['done', 'skip', 'cancel'].includes(todo.status);
                      const isEditing = editingTodoId === todo.id;

                      if (isEditing) {
                        return (
                          <div
                            key={todo.id}
                            className="week-todo-item editing"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="week-todo-check" onClick={(e) => handleCheckboxClick(e, todo)}>
                              <Checkbox status={todo.status} color={subj?.color} />
                            </div>
                            <WeekTodoEditInput text={todo.text} />
                          </div>
                        );
                      }

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
              </div>
            );
          })}
        </div>
      ))}
    </>
  );

  return (
    <div className="weekly-content" ref={containerRef}>
      {renderGrid()}
    </div>
  );
}
