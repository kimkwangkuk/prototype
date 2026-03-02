import { useState, useEffect, useRef } from 'react';
import useTodoStore from '../../../store/useTodoStore';
import { formatTime, formatDuration } from '../../../utils/timeUtils';
import Checkbox from './Checkbox';

export default function TodoItemB({ todo, subjectColor }) {
  const editingTodoId = useTodoStore(state => state.editingTodoId);
  const newlySavedTodoId = useTodoStore(state => state.newlySavedTodoId);
  const clearNewlySavedTodo = useTodoStore(state => state.clearNewlySavedTodo);
  const openBottomSheet = useTodoStore(state => state.openBottomSheet);
  const updateBottomSheetField = useTodoStore(state => state.updateBottomSheetField);
  const saveAndAddNewTodo = useTodoStore(state => state.saveAndAddNewTodo);
  const inputRef = useRef(null);
  const itemRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(t);
  }, []);

  // 저장 완료된 할일에만 펄스 1회
  useEffect(() => {
    if (newlySavedTodoId === todo.id) {
      setPulseAnimation(true);
      clearNewlySavedTodo();
    }
  }, [newlySavedTodoId]);

  const isEditing = editingTodoId === todo.id;
  const isCompleted = todo.status === 'done' || todo.status === 'skip' || todo.status === 'cancel';

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.removeAttribute('readonly');
      inputRef.current.focus();

      const itemEl = itemRef.current;
      const contentEl = document.getElementById('content');
      if (itemEl && contentEl) {
        const itemRect = itemEl.getBoundingClientRect();
        const contentRect = contentEl.getBoundingClientRect();
        const scrollTarget = contentEl.scrollTop + (itemRect.top - contentRect.top) - (contentRect.height / 2) + (itemRect.height / 2);
        contentEl.scrollTo({ top: scrollTarget, behavior: 'smooth' });
      }
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
    document.activeElement?.blur();
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
    openBottomSheet('detail', {
      todoId: todo.id,
      category: todo.subjectId,
      status: todo.status,
      text: todo.text,
      time: todo.time || '',
      duration: todo.duration,
      date: todo.date || 'today',
    });
  };

  const titleClass = isCompleted ? 'todo-title completed' : 'todo-title';
  const metaTextClass = isCompleted ? 'todo-meta-text completed' : (todo.overdue ? 'todo-meta-text overdue' : 'todo-meta-text');
  const durationClass = isCompleted ? 'todo-meta-duration completed' : 'todo-meta-duration';

  return (
    <div
      ref={itemRef}
      className={`todo-item${isEditing ? ' editing' : ''}${pulseAnimation ? ' pulse-in' : ''}${mounted ? ' mounted' : ''}`}
      data-todo-id={todo.id}
      onAnimationEnd={() => setPulseAnimation(false)}
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
