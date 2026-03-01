import { useState, useEffect, useRef } from 'react';
import useTodoStore from '../../../store/useTodoStore';
import { formatTime, formatDuration } from '../../../utils/timeUtils';
import Checkbox from './Checkbox';

export default function TodoItemB({ todo, subjectColor }) {
  const editingTodoId = useTodoStore(state => state.editingTodoId);
  const openBottomSheet = useTodoStore(state => state.openBottomSheet);
  const updateBottomSheetField = useTodoStore(state => state.updateBottomSheetField);
  const saveAndAddNewTodo = useTodoStore(state => state.saveAndAddNewTodo);
  const inputRef = useRef(null);
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(t);
  }, []);

  const isEditing = editingTodoId === todo.id;
  const isCompleted = todo.status === 'done' || todo.status === 'skip' || todo.status === 'cancel';

  useEffect(() => {
    setPulseAnimation(isEditing);
  }, [isEditing]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.removeAttribute('readonly');
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveAndAddNewTodo();
    }
  };

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    openBottomSheet('status-only', {
      todoId: todo.id,
      category: todo.subjectId,
      status: todo.status,
      text: todo.text,
      time: todo.time || '',
      duration: todo.duration,
      date: todo.date || 'today',
    });
  };

  const handleItemClick = () => {
    openBottomSheet('edit', {
      todoId: todo.id,
      category: todo.subjectId,
      status: todo.status,
      text: todo.text,
      time: todo.time || '',
      duration: todo.duration,
      date: todo.date || 'today',
    });
    // iOS는 readOnly 상태의 input에 focus()를 무시함.
    // removeAttribute로 readOnly를 동기 제거 후 focus() → iOS 키보드 표시
    if (inputRef.current) {
      inputRef.current.removeAttribute('readonly');
      inputRef.current.focus();
    }
  };

  const titleClass = isCompleted ? 'todo-title completed' : 'todo-title';
  const metaTextClass = isCompleted ? 'todo-meta-text completed' : (todo.overdue ? 'todo-meta-text overdue' : 'todo-meta-text');
  const durationClass = isCompleted ? 'todo-meta-duration completed' : 'todo-meta-duration';

  return (
    <div
      className={`todo-item${isEditing ? ' editing' : ''}${pulseAnimation ? ' pulse-in' : ''}${mounted ? ' mounted' : ''}`}
      data-todo-id={todo.id}
    >
      <div className="todo-checkbox" onClick={handleCheckboxClick}>
        <Checkbox status={todo.status} color={subjectColor} />
      </div>
      <div className="todo-info" onClick={handleItemClick}>
        <input
          ref={inputRef}
          type="text"
          className={titleClass}
          value={todo.text}
          readOnly={!isEditing}
          style={isEditing ? undefined : { pointerEvents: 'none' }}
          onChange={isEditing ? (e) => updateBottomSheetField('text', e.target.value) : undefined}
          onKeyDown={isEditing ? handleKeyDown : undefined}
          placeholder="할 일 입력..."
        />
        {(todo.time || todo.duration) && (
          <div className="todo-meta">
            {todo.time && (
              <span className={metaTextClass}>{todo.overdue ? '어제 ' : ''}{formatTime(todo.time)}</span>
            )}
            {todo.duration && (
              <div className={durationClass}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span className={metaTextClass}>{formatDuration(todo.duration)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
