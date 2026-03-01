import { useState, useEffect, useRef } from 'react';
import useTodoStore from '../../../store/useTodoStore';
import { formatTime, formatDuration } from '../../../utils/timeUtils';
import Checkbox from './Checkbox';

const moveCursorToEnd = (el) => {
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(el);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
};

export default function TodoItemB({ todo, subjectColor }) {
  const editingTodoId = useTodoStore(state => state.editingTodoId);
  const openBottomSheet = useTodoStore(state => state.openBottomSheet);
  const updateBottomSheetField = useTodoStore(state => state.updateBottomSheetField);
  const saveAndAddNewTodo = useTodoStore(state => state.saveAndAddNewTodo);
  const divRef = useRef(null);
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

  // 마운트 시 초기 텍스트 세팅
  useEffect(() => {
    if (divRef.current) {
      divRef.current.innerText = todo.text || '';
    }
  }, []);

  // 편집 종료 시 DOM을 store 값으로 동기화
  useEffect(() => {
    if (!isEditing && divRef.current) {
      divRef.current.innerText = todo.text || '';
      divRef.current.contentEditable = 'false';
    }
  }, [isEditing]);

  const handleInput = (e) => {
    if (!isEditing) return;
    const text = e.currentTarget.innerText.replace(/\n/g, '');
    updateBottomSheetField('text', text);
  };

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
    });
    // iOS: 유저 제스처 컨텍스트 안에서 contentEditable + focus() 해야 키보드 올라옴
    if (divRef.current) {
      divRef.current.contentEditable = 'true';
      divRef.current.focus();
      moveCursorToEnd(divRef.current);
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
        <div
          ref={divRef}
          contentEditable="false"
          suppressContentEditableWarning
          className={titleClass}
          onInput={handleInput}
          onKeyDown={isEditing ? handleKeyDown : undefined}
          style={!isEditing ? { pointerEvents: 'none' } : undefined}
          data-placeholder="할 일 입력..."
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
