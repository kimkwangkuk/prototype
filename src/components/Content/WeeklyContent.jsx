import useTodoStore from '../../store/useTodoStore';
import { subjects } from '../../config';
import { getWeekDates, formatDate, getDayOfWeekKR, isToday } from '../../utils/dateUtils';
import Checkbox from './TodoItem/Checkbox';

// 월~일을 2열 쌍으로 묶음: (월,화), (수,목), (금,토), (일,empty)
const PAIRS = [[0, 1], [2, 3], [4, 5], [6, null]];

export default function WeeklyContent() {
  const baseDate = useTodoStore(state => state.baseDate);
  const todos = useTodoStore(state => state.todos);
  const selectDate = useTodoStore(state => state.selectDate);
  const addTodo = useTodoStore(state => state.addTodo);
  const openBottomSheet = useTodoStore(state => state.openBottomSheet);

  const dates = getWeekDates(baseDate); // [월, 화, 수, 목, 금, 토, 일]

  const handleAdd = (dateStr) => {
    selectDate(dateStr);
    // Zustand set()은 동기적이므로 selectDate 이후 addTodo에서 올바른 selectedDate를 읽음
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
          {[leftIdx, rightIdx].map((dayIdx) => {
            if (dayIdx === null) {
              return <div key="empty" className="week-day-cell week-day-cell-empty" />;
            }
            const date = dates[dayIdx];
            const ds = formatDate(date);
            const dayTodos = todos[ds] || [];
            const today = isToday(ds);

            return (
              <div key={ds} className="week-day-cell">
                <div className="week-day-header">
                  <span className="week-day-label">{getDayOfWeekKR(date)}</span>
                  <div className={`week-day-num${today ? ' today' : ''}`}>
                    {date.getDate()}
                  </div>
                </div>
                <div className="week-cell-divider" />
                <div className="week-todos">
                  {dayTodos.map(todo => {
                    const subj = subjects.find(s => s.id === todo.subjectId);
                    const completed = ['done', 'skip', 'cancel'].includes(todo.status);
                    return (
                      <button
                        key={todo.id}
                        className="week-todo-item"
                        onClick={() => handleTodoClick(todo)}
                      >
                        <div
                          className="week-todo-check"
                          onClick={(e) => handleCheckboxClick(e, todo)}
                        >
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
