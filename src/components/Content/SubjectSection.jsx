import useTodoStore from '../../store/useTodoStore';
import TodoItemB from './TodoItem/TodoItemB';

export default function SubjectSection({ subject, todos }) {
  const addTodo = useTodoStore(state => state.addTodo);

  return (
    <div className="section">
      <div className="subject-title-bar">
        <div className="subject-color-chip" style={{ background: subject.color }}></div>
        <span className="subject-name">{subject.name}</span>
        <button
          className="subject-add-btn"
          aria-label="추가"
          onClick={() => addTodo(subject.id)}
        >
          <div className="subject-add-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </div>
        </button>
      </div>
      {todos.length > 0 && (
        <div className="task-list">
          {todos.map(todo => (
            <TodoItemB
              key={todo.id}
              todo={todo}
              subjectColor={subject.color}
            />
          ))}
        </div>
      )}
    </div>
  );
}
