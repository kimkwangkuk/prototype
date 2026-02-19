import { useMemo } from 'react';
import useTodoStore from '../../store/useTodoStore';
import { subjects } from '../../config';
import { formatDate, isToday } from '../../utils/dateUtils';

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

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
  const baseDate = useTodoStore(state => state.baseDate);
  const todos = useTodoStore(state => state.todos);
  const openBottomSheet = useTodoStore(state => state.openBottomSheet);

  const weeks = useMemo(() => getMonthCalendar(baseDate), [baseDate]);

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

  return (
    <div className="monthly-content">
      <div className="monthly-day-labels">
        {DAY_LABELS.map((d, i) => (
          <span key={d} className={`monthly-day-label${i >= 5 ? ' weekend' : ''}`}>{d}</span>
        ))}
      </div>
      <div className="monthly-body">
        {weeks.map((week, wi) => (
          <div key={wi} className="monthly-week-row">
            {week.map((date, di) => {
              const ds = formatDate(date);
              const dayTodos = todos[ds] || [];
              const today = isToday(ds);
              const inMonth = date.getMonth() === baseDate.getMonth();
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
                      const subj = subjects.find(s => s.id === todo.subjectId);
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
