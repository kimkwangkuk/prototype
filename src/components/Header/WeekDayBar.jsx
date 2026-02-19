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

  return (
    <div className="week-day-bar" {...swipeHandlers}>
      {dates.map(d => {
        const ds = formatDate(d);
        const isToday = ds === todayStr;
        const isActive = ds === selectedDate;
        const count = getTodoCount(todos, ds);
        const allDone = hasCheckIcon(todos, ds);

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
              {allDone ? (
                <svg className="day-todo-board-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
