import { useMemo } from 'react';
import useTodoStore from '../../store/useTodoStore';
import { subjects } from '../../config';
import { formatDate, isToday } from '../../utils/dateUtils';

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

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
  // 월요일 시작
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
  const baseDate = useTodoStore(state => state.baseDate);
  const todos = useTodoStore(state => state.todos);

  const weeks = useMemo(() => getMonthCalendar(baseDate), [baseDate]);

  return (
    <div className="cal-screen">
      {/* 요일 헤더 */}
      <div className="cal-day-labels">
        {DAY_LABELS.map((d, i) => (
          <span key={d} className={`cal-day-label${i >= 5 ? ' weekend' : ''}`}>{d}</span>
        ))}
      </div>

      {/* 캘린더 그리드 */}
      <div className="cal-grid">
        {weeks.map((week, wi) => (
          <div key={wi} className="cal-week-row">
            {week.map((date, di) => {
              const ds = formatDate(date);
              const dayTodos = (todos[ds] || []).filter(t => t.time);
              const today = isToday(ds);
              const inMonth = date.getMonth() === baseDate.getMonth();
              const isWeekend = di >= 5;
              const events = SAMPLE_EVENTS[ds] || [];
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
                  {/* 날짜 헤더 */}
                  <div className="cal-date-header">
                    <div className="cal-date-num-wrap">
                      <div className={dateNumClass}>{date.getDate()}</div>
                      {isDayoff && <span className="cal-dayoff-badge">OFF</span>}
                    </div>
                  </div>

                  {/* 이벤트 칩 */}
                  <div className="cal-day-events">
                    {/* 투두 칩 */}
                    {dayTodos.map(todo => {
                      const subj = subjects.find(s => s.id === todo.subjectId);
                      return (
                        <div key={todo.id} className="cal-chip cal-chip-todo">
                          <span className="cal-chip-text">{todo.time}</span>
                        </div>
                      );
                    })}
                    {/* 일정 칩 */}
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
