import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import useTodoStore from '../../../store/useTodoStore';
import { formatTime, formatDuration } from '../../../utils/timeUtils';
import Checkbox from './Checkbox';

const moveCursorToEnd = (el) => {
  if (!el) return;
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

  // 페인트 전에 텍스트 세팅 → 빈 화면 플래시 없음
  useLayoutEffect(() => {
    if (divRef.current) {
      divRef.current.innerText = todo.text || '';
    }
  }, []);

  // 편집 상태 전환 처리
  useEffect(() => {
    if (!divRef.current) return;
    if (isEditing) {
      // React 리렌더 후 커서 맨 뒤로
      moveCursorToEnd(divRef.current);
    } else {
      // 편집 종료: contentEditable 해제 + store 값으로 동기화
      divRef.current.contentEditable = 'false';
      divRef.current.innerText = todo.text || '';
    }
  }, [isEditing]);

  const handleInput = (e) => {
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
    // iOS: 유저 제스처 안에서 contentEditable 활성화 + focus() 해야 키보드 올라옴
    if (divRef.current) {
      divRef.current.contentEditable = 'true';
      divRef.current.focus();
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
          contentEditable={isEditing ? 'true' : 'false'}
          suppressContentEditableWarning
          className={titleClass}
          onInput={isEditing ? handleInput : undefined}
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
