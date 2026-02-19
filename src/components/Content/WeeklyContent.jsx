import { useMemo } from 'react';
import useTodoStore from '../../store/useTodoStore';
import { subjects } from '../../config';
import { getWeekDates, formatDate, getDayOfWeekKR, isToday } from '../../utils/dateUtils';
import Checkbox from './TodoItem/Checkbox';

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

// [nav, 월], [화, 수], [목, 금], [토, 일]
const PAIRS = [['nav', 0], [1, 2], [3, 4], [5, 6]];

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

  return (
    <div className="week-nav-cell">
      <div className="week-nav-day-labels">
        {DAY_LABELS.map(d => (
          <span key={d} className="week-nav-day-label">{d}</span>
        ))}
      </div>
      <div className="week-nav-rows">
        {monthCalendar.map((week, wi) => {
          const isCurrent = week.some(d => currentWeekStrs.has(formatDate(d)));
          return (
            <button
              key={wi}
              className={`week-nav-row${isCurrent ? ' current' : ''}`}
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
          );
        })}
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

  const weekDates = getWeekDates(baseDate);
  const currentWeekStrs = useMemo(() => new Set(weekDates.map(d => formatDate(d))), [weekDates]);

  const handleAdd = (dateStr) => {
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

  return (
    <div className="weekly-content">
      {PAIRS.map(([leftIdx, rightIdx], rowIdx) => (
        <div key={rowIdx} className="week-row">
          {[leftIdx, rightIdx].map((idx) => {
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

            const date = weekDates[idx];
            const ds = formatDate(date);
            const dayTodos = todos[ds] || [];
            const today = isToday(ds);

            return (
              <div key={ds} className="week-day-col">
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
                        onClick={() => handleTodoClick(todo)}
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
                <button className="week-add-btn" onClick={() => handleAdd(ds)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
