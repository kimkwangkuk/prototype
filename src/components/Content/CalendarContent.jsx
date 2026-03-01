import { useMemo, useRef, useEffect } from 'react';
import useTodoStore from '../../store/useTodoStore';
import { subjects } from '../../config';
import { formatDate, isToday } from '../../utils/dateUtils';

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];
const SWIPE_THRESHOLD = 55;
const FADE_DISTANCE   = 130;

// 샘플 일정 데이터 (2026년 1~3월)
const SAMPLE_EVENTS = {
  '2026-01-27': [{ label: '설날 연휴', color: 'orange' }],
  '2026-01-28': [{ label: '설날', color: 'orange' }],
  '2026-01-29': [{ label: '설날 연휴', color: 'orange' }],
  '2026-02-03': [{ label: '중간고사시험기간', color: 'purple' }],
  '2026-02-04': [{ label: '중간고사시험기간', color: 'blue' }],
  '2026-02-05': [{ label: '중간고사시험기간', color: 'purple' }],
  '2026-02-06': [{ label: '중간고사시험기간', color: 'blue' }],
  '2026-02-10': [{ label: '정보람님의 생일', color: 'purple' }],
  '2026-02-14': [
    { label: '이비인후과', color: 'blue' },
    { label: '원치윤님의 생일', color: 'purple' },
  ],
  '2026-02-20': [{ label: '황규민님의 생일', color: 'blue' }],
};

// 휴일 표시 (날짜 -> OFF)
const DAYOFF_DATES = new Set(['2026-01-27', '2026-01-28', '2026-01-29']);

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
  }
  return weeks;
}

export default function CalendarContent() {
  const baseDate        = useTodoStore(state => state.baseDate);
  const todos           = useTodoStore(state => state.todos);
  const nextMonthAction = useTodoStore(state => state.nextMonth);
  const prevMonthAction = useTodoStore(state => state.prevMonth);

  const weeks = useMemo(() => getMonthCalendar(baseDate), [baseDate]);

  const gridRef    = useRef(null);
  const stateRef   = useRef({ startX: 0, startY: 0, direction: null, animating: false });
  const actionsRef = useRef({ nextMonth: nextMonthAction, prevMonth: prevMonthAction });
  useEffect(() => { actionsRef.current = { nextMonth: nextMonthAction, prevMonth: prevMonthAction }; });

  // ─── 터치 스와이프 ─────────────────────────────────────────────────────────
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const s = stateRef.current;

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

    // 요일 헤더 위 스와이프도 감지하도록 부모에 이벤트 등록
    const container = el.closest('.cal-screen');
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

  return (
    <div className="cal-screen">
      {/* 요일 헤더: 고정 */}
      <div className="cal-day-labels">
        {DAY_LABELS.map((d, i) => (
          <span key={d} className={`cal-day-label${i >= 5 ? ' weekend' : ''}`}>{d}</span>
        ))}
      </div>

      {/* 캘린더 그리드: 스와이프 대상 */}
      <div className="cal-grid" ref={gridRef} style={{ willChange: 'opacity, transform', overflow: 'hidden' }}>
        {weeks.map((week, wi) => (
          <div key={wi} className="cal-week-row">
            {week.map((date, di) => {
              const ds       = formatDate(date);
              const dayTodos = (todos[ds] || []).filter(t => t.time);
              const today    = isToday(ds);
              const inMonth  = date.getMonth() === baseDate.getMonth();
              const isWeekend = di >= 5;
              const events   = SAMPLE_EVENTS[ds] || [];
              const isDayoff = DAYOFF_DATES.has(ds);

              const dateNumClass = [
                'cal-date-num',
                today ? 'today' : '',
                !today && isWeekend ? 'weekend' : '',
              ].filter(Boolean).join(' ');

              return (
                <div
                  key={ds}
                  className={`cal-day-cell${!inMonth ? ' out-month' : ''}`}
                >
                  <div className="cal-date-header">
                    <div className="cal-date-num-wrap">
                      <div className={dateNumClass}>{date.getDate()}</div>
                      {isDayoff && <span className="cal-dayoff-badge">OFF</span>}
                    </div>
                  </div>
                  <div className="cal-day-events">
                    {dayTodos.map(todo => {
                      const subj = subjects.find(s => s.id === todo.subjectId);
                      return (
                        <div key={todo.id} className="cal-chip cal-chip-todo">
                          <span className="cal-chip-text">{todo.time}</span>
                        </div>
                      );
                    })}
                    {events.map((ev, i) => (
                      <div key={i} className={`cal-chip cal-chip-${ev.color}`}>
                        <span className="cal-chip-text">{ev.label}</span>
                      </div>
                    ))}
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
