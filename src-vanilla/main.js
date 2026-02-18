import { CURRENT_VARIANT, subjects } from './config.js';
import { BottomSheet } from './bottomSheet.js';

const DAY_KR = ['일', '월', '화', '수', '목', '금', '토'];

let baseDate = new Date();
let selectedDate = formatDate(new Date());
let nextId = 1;
let todos = {};
let editingTodoId = null;
let bottomSheet = null;

// Debounce 타이머
let renderDebounceTimer = null;

// ========================================
// Utility Functions
// ========================================

function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getWeekDates(base) {
  const d = new Date(base);
  const dow = d.getDay();
  const mon = new Date(d);
  mon.setDate(d.getDate() - ((dow + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(mon);
    dt.setDate(mon.getDate() + i);
    return dt;
  });
}

function getTodoCount(dateStr) {
  const list = todos[dateStr] || [];
  return list.filter(t => t.status === 'empty' || t.status === 'progress').length;
}

function hasCheckIcon(dateStr) {
  const list = todos[dateStr] || [];
  return list.length > 0 && list.every(t => t.status === 'done' || t.status === 'skip' || t.status === 'cancel');
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function debounceRender(delay = 300) {
  if (renderDebounceTimer) {
    clearTimeout(renderDebounceTimer);
  }
  renderDebounceTimer = setTimeout(() => {
    renderContent();
    renderDebounceTimer = null;
  }, delay);
}

// ========================================
// Variants - Header
// ========================================

function renderHeader_A() {
  return `
    <div class="header">
      <div class="header-bg"></div>
      <div class="header-content">
        <div class="toolbar-top">
          <div class="toolbar-left">
            <div class="toolbar-date">
              <span class="toolbar-date-main" id="toolbarDateMain">01.11</span>
              <span class="toolbar-date-day" id="toolbarDateDay">(수)</span>
            </div>
            <button class="btn-go-today hidden" id="btnGoToday">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span>오늘</span>
            </button>
          </div>
          <div class="toolbar-right">
            <button class="btn-icon" aria-label="메뉴">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="4" y1="5" x2="20" y2="5"/>
                <line x1="4" y1="12" x2="20" y2="12"/>
                <line x1="4" y1="19" x2="20" y2="19"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="week-day-bar" id="weekDayBar"></div>
      </div>
    </div>
  `;
}

// Variant B (예시 - 다른 스타일)
function renderHeader_B() {
  // B 스타일 구현 (추후)
  return renderHeader_A(); // 임시로 A 사용
}

// Variant C (예시)
function renderHeader_C() {
  // C 스타일 구현 (추후)
  return renderHeader_A(); // 임시로 A 사용
}

const headerVariants = {
  a: renderHeader_A,
  b: renderHeader_B,
  c: renderHeader_C,
};

function renderHeader() {
  return headerVariants[CURRENT_VARIANT]();
}

// ========================================
// Variants - TodoItem
// ========================================

function renderTodoItem_A(todo, subjectColor) {
  const isCompleted = todo.status === 'done' || todo.status === 'skip' || todo.status === 'cancel';
  const isEditing = CURRENT_VARIANT === 'b' ? false : todo.id === editingTodoId;
  const titleClass = isCompleted ? 'todo-title completed' : 'todo-title';
  const metaTextClass = isCompleted ? 'todo-meta-text completed' : (todo.overdue ? 'todo-meta-text overdue' : 'todo-meta-text');
  const durationClass = isCompleted ? 'todo-meta-duration completed' : 'todo-meta-duration';

  let metaHtml = '';
  if (todo.time || todo.duration) {
    metaHtml = `<div class="todo-meta">`;
    if (todo.time) {
      metaHtml += `<span class="${metaTextClass}">${todo.overdue ? '어제 ' : ''}${todo.time}</span>`;
    }
    if (todo.duration) {
      metaHtml += `<div class="${durationClass}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <span class="${metaTextClass}">${todo.duration}</span>
      </div>`;
    }
    metaHtml += `</div>`;
  }

  return `<div class="todo-item ${isEditing ? 'editing' : ''}" data-todo-id="${todo.id}">
    <div class="todo-checkbox" data-action="cycle-status" data-todo-id="${todo.id}">${renderCheckbox(todo, subjectColor)}</div>
    <div class="todo-info" data-action="edit-todo" data-todo-id="${todo.id}">
      <input
        type="text"
        class="${titleClass}"
        value="${escapeHtml(todo.text)}"
        placeholder="할 일 입력..."
        data-todo-id="${todo.id}"
        ${CURRENT_VARIANT === 'b' || !isEditing ? 'readonly' : ''}
      />
      ${metaHtml}
    </div>
  </div>`;
}

function renderTodoItem_B(todo, subjectColor) {
  // B 스타일 구현 (추후)
  return renderTodoItem_A(todo, subjectColor);
}

function renderTodoItem_C(todo, subjectColor) {
  // C 스타일 구현 (추후)
  return renderTodoItem_A(todo, subjectColor);
}

const todoItemVariants = {
  a: renderTodoItem_A,
  b: renderTodoItem_B,
  c: renderTodoItem_C,
};

function renderTodoItem(todo, subjectColor) {
  return todoItemVariants[CURRENT_VARIANT](todo, subjectColor);
}

// ========================================
// Checkbox Rendering
// ========================================

function renderCheckbox(todo, subjectColor) {
  const s = todo.status;
  if (s === 'empty') {
    return `<div class="cb-empty"></div>`;
  }
  if (s === 'progress') {
    return `<div class="cb-progress"><div class="cb-progress-fill" style="background:${subjectColor}"></div></div>`;
  }
  if (s === 'done') {
    return `<div class="cb-done" style="border-color:${subjectColor}"></div>`;
  }
  if (s === 'skip') {
    return `<div class="cb-skip"><svg viewBox="0 0 24 24" fill="none" stroke="${subjectColor}" stroke-width="1.8"><polygon points="12,4 22,20 2,20"/></svg></div>`;
  }
  if (s === 'cancel') {
    return `<div class="cb-cancel"><svg viewBox="0 0 24 24" fill="none" stroke="${subjectColor}" stroke-width="2" stroke-linecap="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg></div>`;
  }
  return `<div class="cb-empty"></div>`;
}

// ========================================
// Rendering Functions
// ========================================

function updateToolbarDate() {
  const d = new Date(selectedDate + 'T00:00:00');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  document.getElementById('toolbarDateMain').textContent = `${mm}.${dd}`;
  document.getElementById('toolbarDateDay').textContent = `(${DAY_KR[d.getDay()]})`;

  const todayStr = formatDate(new Date());
  const btn = document.getElementById('btnGoToday');
  if (selectedDate === todayStr) {
    btn.classList.add('hidden');
  } else {
    btn.classList.remove('hidden');
  }
}

function renderWeekDayBar() {
  const dates = getWeekDates(baseDate);
  const bar = document.getElementById('weekDayBar');
  bar.innerHTML = dates.map(d => {
    const ds = formatDate(d);
    const di = d.getDay();
    const isActive = ds === selectedDate;
    const count = getTodoCount(ds);
    const allDone = hasCheckIcon(ds);

    let boardContent = '';
    if (allDone) {
      boardContent = `<svg class="day-todo-board-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else if (count > 0) {
      boardContent = `<span class="day-todo-board-count">${count}</span>`;
    } else {
      boardContent = `<span class="day-todo-board-count">&nbsp;</span>`;
    }

    return `<div class="day-date" data-action="select-date" data-date="${ds}">
      <span class="day-date-label${isActive ? ' active' : ''}">${d.getDate()}.${DAY_KR[di]}</span>
      <div class="day-todo-board${isActive ? ' active' : ''}">${boardContent}</div>
    </div>`;
  }).join('');
}

function renderContent() {
  const list = todos[selectedDate] || [];
  const content = document.getElementById('content');

  const grouped = {};
  for (const t of list) {
    if (!grouped[t.subjectId]) grouped[t.subjectId] = [];
    grouped[t.subjectId].push(t);
  }

  let html = '';
  for (const subj of subjects) {
    const items = grouped[subj.id] || [];

    html += `<div class="section">
      <div class="subject-title-bar">
        <div class="subject-color-chip" style="background:${subj.color}"></div>
        <span class="subject-name">${escapeHtml(subj.name)}</span>
        <button class="subject-add-btn" aria-label="추가" data-action="add-todo" data-subject="${subj.id}">
          <div class="subject-add-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </div>
        </button>
      </div>
      ${items.length > 0 ? `<div class="task-list">
        ${items.map(t => renderTodoItem(t, subj.color)).join('')}
      </div>` : ''}
    </div>`;
  }

  content.innerHTML = html;

  // 편집 중인 아이템에 pulse-in 클래스 추가 (계속 점멸)
  if (editingTodoId !== null) {
    setTimeout(() => {
      const input = document.querySelector(`input[data-todo-id="${editingTodoId}"]`);
      if (input) {
        const todoItem = input.closest('.todo-item');
        if (todoItem) {
          // 기존 pulse-in 클래스 모두 제거
          document.querySelectorAll('.pulse-in').forEach(el => el.classList.remove('pulse-in'));
          // 편집 중인 아이템에만 추가
          todoItem.classList.add('pulse-in');
        }
      }
    }, 10);
  } else {
    // 편집이 끝나면 모든 pulse-in 클래스 제거
    setTimeout(() => {
      document.querySelectorAll('.pulse-in').forEach(el => el.classList.remove('pulse-in'));
    }, 10);
  }
}

// ========================================
// Todo Actions
// ========================================

function addTodoWithBottomSheet(subjectId) {
  if (!todos[selectedDate]) todos[selectedDate] = [];

  // 1. 이미 생성 중인 할일이 있는지 확인
  if (editingTodoId !== null) {
    const editingTodo = findTodoById(editingTodoId);

    // 같은 과목에 생성 중인 할일이 있으면 무시
    if (editingTodo && editingTodo.subjectId === subjectId) {
      return;
    }

    // 다른 과목의 할일을 추가하려면 기존 할일 삭제
    if (editingTodo) {
      const list = todos[selectedDate];
      const index = list.findIndex(t => t.id === editingTodoId);
      if (index !== -1) {
        list.splice(index, 1);
      }
    }
  }

  // 2. 즉시 빈칸 할일 추가
  const newTodo = {
    id: nextId++,
    subjectId,
    text: '',
    status: 'empty',
    time: null,
    duration: null,
    overdue: false,
  };

  todos[selectedDate].push(newTodo);
  editingTodoId = newTodo.id;

  // 3. 렌더링 (빈칸 표시됨)
  renderWeekDayBar();
  renderContent();

  // 4. 펄스 애니메이션 및 스크롤
  setTimeout(() => {
    const input = document.querySelector(`input[data-todo-id="${newTodo.id}"]`);
    if (input) {
      const todoItem = input.closest('.todo-item');
      if (todoItem) {
        // Pulse animation will be added by renderContent when editingTodoId is set

        if (CURRENT_VARIANT !== 'b') {
          // A타입: 입력 필드에 포커스 및 스크롤
          input.focus();
          input.removeAttribute('readonly');

          const rect = todoItem.getBoundingClientRect();
          const offset = window.innerHeight * 0.25; // 상단 25% 위치
          const contentEl = document.getElementById('content');
          contentEl.scrollBy({
            top: rect.top - offset,
            behavior: 'smooth'
          });
        }
      }
    }
  }, 10);

  // 5. 바텀시트 표시
  // 이미 열려있으면 먼저 닫기
  if (bottomSheet) {
    bottomSheet.hide();
  }

  if (!bottomSheet) {
    bottomSheet = new BottomSheet(
      (data) => handleBottomSheetSave(editingTodoId, data),
      (originalText) => handleBottomSheetCancel(editingTodoId, originalText),
      (newCategory) => handleCategoryChange(editingTodoId, newCategory),
      (text) => handleTextChange(editingTodoId, text),
      (startTime) => handleTimeChange(editingTodoId, startTime),
      (duration) => handleDurationChange(editingTodoId, duration)
    );
  } else {
    bottomSheet.updateCallbacks(
      (data) => handleBottomSheetSave(editingTodoId, data),
      (originalText) => handleBottomSheetCancel(editingTodoId, originalText),
      (newCategory) => handleCategoryChange(editingTodoId, newCategory),
      (text) => handleTextChange(editingTodoId, text),
      (startTime) => handleTimeChange(editingTodoId, startTime),
      (duration) => handleDurationChange(editingTodoId, duration)
    );
  }

  bottomSheet.show(subjectId, null, 'full');
}

function handleBottomSheetSave(todoId, data) {
  const todo = findTodoById(todoId);
  if (!todo) return;

  // 데이터 업데이트
  if (data.text !== undefined) {
    todo.text = data.text;
  }
  if (data.status) {
    todo.status = data.status;
  }
  if (data.category) {
    todo.subjectId = data.category;
  }
  if (data.startTime) {
    todo.time = formatTime(data.startTime);
  }
  if (data.duration) {
    todo.duration = formatDuration(data.duration);
  }

  // 텍스트가 비어있으면 할일 삭제
  if (!todo.text.trim()) {
    const list = todos[selectedDate];
    if (list) {
      const index = list.findIndex(t => t.id === todoId);
      if (index !== -1) list.splice(index, 1);
    }
    editingTodoId = null;
    renderWeekDayBar();
    renderContent();
    return;
  }

  editingTodoId = null;

  // 렌더링
  renderWeekDayBar();
  renderContent();
}

function handleBottomSheetCancel(todoId, originalData) {
  const todo = findTodoById(todoId);

  if (todo && originalData) {
    // 원본 데이터 복원
    if (originalData.text !== undefined) {
      todo.text = originalData.text;
    }
    if (originalData.category !== undefined) {
      todo.subjectId = originalData.category;
    }
    if (originalData.duration !== undefined) {
      todo.duration = originalData.duration ? formatDuration(originalData.duration) : null;
    }
    if (originalData.startTime !== undefined) {
      todo.time = originalData.startTime ? formatTime(originalData.startTime) : null;
    }
    if (originalData.status !== undefined) {
      todo.status = originalData.status;
    }

    // 텍스트가 비어있으면 할일 삭제
    if (!todo.text.trim()) {
      const list = todos[selectedDate];
      if (list) {
        const index = list.findIndex(t => t.id === todoId);
        if (index !== -1) {
          list.splice(index, 1);
        }
      }
    }
  }

  editingTodoId = null;

  renderWeekDayBar();
  renderContent();
}

function handleTextChange(todoId, text) {
  // 실시간으로 todo 텍스트 업데이트
  const todo = findTodoById(todoId);
  if (todo) {
    todo.text = text;
    // Debounce 적용하여 입력이 멈춘 후 렌더링
    debounceRender(300);
  }
}

function handleCategoryChange(todoId, newCategory) {
  const todo = findTodoById(todoId);
  if (!todo) return;

  // 과목 변경
  todo.subjectId = newCategory;

  // 렌더링 (과목별로 재정렬됨)
  renderWeekDayBar();
  renderContent();

  // 변경된 위치로 스크롤 (바텀시트 위쪽에 보이도록)
  setTimeout(() => {
    const input = document.querySelector(`input[data-todo-id="${todoId}"]`);
    if (input) {
      const todoItem = input.closest('.todo-item');
      if (todoItem) {
        // 바텀시트 높이를 고려하여 더 위쪽으로 스크롤
        const rect = todoItem.getBoundingClientRect();
        const offset = window.innerHeight * 0.3; // 상단 30% 위치
        const contentEl = document.getElementById('content');
        contentEl.scrollBy({
          top: rect.top - offset,
          behavior: 'smooth'
        });
      }
    }
  }, 10);
}

function handleTimeChange(todoId, startTime) {
  const todo = findTodoById(todoId);
  if (!todo) return;

  // 시작 시간 변경
  todo.time = formatTime(startTime);

  // 렌더링
  renderContent();
}

function handleDurationChange(todoId, duration) {
  const todo = findTodoById(todoId);
  if (!todo) return;

  // 지속 시간 변경
  todo.duration = formatDuration(duration);

  // 렌더링
  renderContent();
}

function editTodo(todoId) {
  const todo = findTodoById(todoId);
  if (!todo) return;

  // 이미 다른 할일을 편집 중이면 삭제
  if (editingTodoId !== null && editingTodoId !== todoId) {
    const editingTodo = findTodoById(editingTodoId);
    if (editingTodo && !editingTodo.text.trim()) {
      const list = todos[selectedDate];
      const index = list.findIndex(t => t.id === editingTodoId);
      if (index !== -1) {
        list.splice(index, 1);
      }
    }
  }

  editingTodoId = todoId;

  // B타입에서는 바텀시트만 열고 인라인 편집 안함
  if (CURRENT_VARIANT === 'b') {
    // 이미 열려있으면 먼저 닫기
    if (bottomSheet) {
      bottomSheet.hide();
    }

    // 바텀시트 표시 (기존 데이터 포함)
    if (!bottomSheet) {
      bottomSheet = new BottomSheet(
        (data) => handleBottomSheetSave(todoId, data),
        (originalText) => handleBottomSheetCancel(todoId, originalText),
        (newCategory) => handleCategoryChange(todoId, newCategory),
        (text) => handleTextChange(todoId, text),
        (startTime) => handleTimeChange(todoId, startTime),
        (duration) => handleDurationChange(todoId, duration)
      );
    } else {
      bottomSheet.updateCallbacks(
        (data) => handleBottomSheetSave(todoId, data),
        (originalText) => handleBottomSheetCancel(todoId, originalText),
        (newCategory) => handleCategoryChange(todoId, newCategory),
        (text) => handleTextChange(todoId, text),
        (startTime) => handleTimeChange(todoId, startTime),
        (duration) => handleDurationChange(todoId, duration)
      );
    }

    // 기존 데이터를 바텀시트에 전달
    const existingData = {
      text: todo.text,
      status: todo.status,
      category: todo.subjectId,
      startTime: reverseFormatTime(todo.time),
      duration: reverseDuration(todo.duration),
    };

      // 점멸 시작을 위해 renderContent 호출
    renderContent();
    bottomSheet.show(todo.subjectId, existingData, 'edit');
    return;
  }

  // A타입은 기존 인라인 편집 방식 유지
  // 렌더링
  renderContent();

  // 입력 필드에 포커스 및 스크롤
  setTimeout(() => {
    const input = document.querySelector(`input[data-todo-id="${todoId}"]`);
    if (input) {
      input.removeAttribute('readonly');
      input.focus();

      // 바텀시트 위쪽에 보이도록 스크롤
      const todoItem = input.closest('.todo-item');
      if (todoItem) {
        const rect = todoItem.getBoundingClientRect();
        const offset = window.innerHeight * 0.25; // 상단 25% 위치
        const contentEl = document.getElementById('content');
        contentEl.scrollBy({
          top: rect.top - offset,
          behavior: 'smooth'
        });
      }
    }
  }, 10);

  // 바텀시트 표시 (기존 데이터 포함)
  if (!bottomSheet) {
    bottomSheet = new BottomSheet(
      (data) => handleBottomSheetSave(todoId, data),
      (originalText) => handleBottomSheetCancel(todoId, originalText),
      (newCategory) => handleCategoryChange(todoId, newCategory),
      (text) => handleTextChange(todoId, text),
      (startTime) => handleTimeChange(todoId, startTime),
      (duration) => handleDurationChange(todoId, duration)
    );
  } else {
    bottomSheet.updateCallbacks(
      (data) => handleBottomSheetSave(todoId, data),
      (originalText) => handleBottomSheetCancel(todoId, originalText),
      (newCategory) => handleCategoryChange(todoId, newCategory),
      (text) => handleTextChange(todoId, text),
      (startTime) => handleTimeChange(todoId, startTime),
      (duration) => handleDurationChange(todoId, duration)
    );
  }

  // 기존 데이터를 바텀시트에 전달
  const existingData = {
    text: todo.text,
    status: todo.status,
    category: todo.subjectId,
    startTime: reverseFormatTime(todo.time),
    duration: reverseDuration(todo.duration),
  };

  bottomSheet.show(todo.subjectId, existingData, 'edit');
}

function openStatusBottomSheet(todoId) {
  const todo = findTodoById(todoId);
  if (!todo) return;

  // 바텀시트 표시 (상태만 변경)
  if (!bottomSheet) {
    bottomSheet = new BottomSheet(
      (data) => handleBottomSheetSave(todoId, data),
      (originalData) => {
        // 취소 시에는 삭제하지 않음 (상태 변경만)
            editingTodoId = null;
        renderContent();
      },
      (newCategory) => handleCategoryChange(todoId, newCategory),
      null, // status-only mode doesn't need text change callback
      (startTime) => handleTimeChange(todoId, startTime),
      (duration) => handleDurationChange(todoId, duration)
    );
  } else {
    bottomSheet.updateCallbacks(
      (data) => handleBottomSheetSave(todoId, data),
      (originalData) => {
        // 취소 시에는 삭제하지 않음 (상태 변경만)
            editingTodoId = null;
        renderContent();
      },
      (newCategory) => handleCategoryChange(todoId, newCategory),
      null, // status-only mode doesn't need text change callback
      (startTime) => handleTimeChange(todoId, startTime),
      (duration) => handleDurationChange(todoId, duration)
    );
  }

  // 기존 데이터를 바텀시트에 전달
  const existingData = {
    text: todo.text,
    status: todo.status,
    category: todo.subjectId,
    startTime: reverseFormatTime(todo.time),
    duration: reverseDuration(todo.duration),
  };

  bottomSheet.show(todo.subjectId, existingData, 'status-only');
}

function cycleStatus(todoId) {
  const todo = findTodoById(todoId);
  if (!todo) return;

  const cycle = ['empty', 'progress', 'done', 'skip', 'cancel'];
  const idx = cycle.indexOf(todo.status);
  todo.status = cycle[(idx + 1) % cycle.length];

  renderWeekDayBar();
  renderContent();
}

function findTodoById(id) {
  const list = todos[selectedDate] || [];
  return list.find(t => t.id === id);
}

function formatTime(timeStr) {
  // "14:30" -> "오후 2:30"
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? '오후' : '오전';
  const hour = h > 12 ? h - 12 : (h === 0 ? 12 : h);
  return `${period} ${hour}:${String(m).padStart(2, '0')}`;
}

function reverseFormatTime(displayTime) {
  // "오후 2:30" -> "14:30" or null
  if (!displayTime) return null;

  const match = displayTime.match(/(오전|오후)\s*(\d+):(\d+)/);
  if (!match) return null;

  const [, period, hour, minute] = match;
  let h = parseInt(hour);
  const m = parseInt(minute);

  if (period === '오후' && h !== 12) {
    h += 12;
  } else if (period === '오전' && h === 12) {
    h = 0;
  }

  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes}분`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
}

function reverseDuration(displayDuration) {
  // "1시간 30분" -> 90 or null
  if (!displayDuration) return null;

  let totalMinutes = 0;

  const hourMatch = displayDuration.match(/(\d+)시간/);
  if (hourMatch) {
    totalMinutes += parseInt(hourMatch[1]) * 60;
  }

  const minuteMatch = displayDuration.match(/(\d+)분/);
  if (minuteMatch) {
    totalMinutes += parseInt(minuteMatch[1]);
  }

  return totalMinutes > 0 ? totalMinutes : null;
}

// ========================================
// Navigation
// ========================================

function selectDate(dateStr) {
  // 생성 중인 빈 할일 삭제
  if (editingTodoId !== null) {
    const editingTodo = findTodoById(editingTodoId);
    if (editingTodo && !editingTodo.text.trim()) {
      const list = todos[selectedDate];
      if (list) {
        const index = list.findIndex(t => t.id === editingTodoId);
        if (index !== -1) {
          list.splice(index, 1);
        }
      }
    }
  }

  // 바텀시트가 열려있으면 닫기
  if (bottomSheet) {
    bottomSheet.hide();
  }
  editingTodoId = null;

  selectedDate = dateStr;
  baseDate = new Date(dateStr + 'T00:00:00');
  updateToolbarDate();
  renderWeekDayBar();
  renderContent();
}

function goToday() {
  // 생성 중인 빈 할일 삭제
  if (editingTodoId !== null) {
    const editingTodo = findTodoById(editingTodoId);
    if (editingTodo && !editingTodo.text.trim()) {
      const list = todos[selectedDate];
      if (list) {
        const index = list.findIndex(t => t.id === editingTodoId);
        if (index !== -1) {
          list.splice(index, 1);
        }
      }
    }
  }

  // 바텀시트가 열려있으면 닫기
  if (bottomSheet) {
    bottomSheet.hide();
  }
  editingTodoId = null;

  baseDate = new Date();
  selectedDate = formatDate(new Date());
  updateToolbarDate();
  renderWeekDayBar();
  renderContent();
}

// ========================================
// Event Delegation
// ========================================

function setupEventDelegation() {
  document.addEventListener('click', (e) => {
    // 바텀시트가 열려있으면 바텀시트 외부 클릭은 닫기만 수행
    if (bottomSheet && bottomSheet.sheet.classList.contains('visible')) {
      const clickedInsideSheet = bottomSheet.sheet.contains(e.target);
      const clickedOverlay = bottomSheet.overlay.contains(e.target);

      if (!clickedInsideSheet && !clickedOverlay) {
        // 바텀시트 외부 클릭 - 바텀시트만 닫고 다른 동작 방지
        bottomSheet.hide();
        if (bottomSheet.onCancel) {
          bottomSheet.onCancel({
            text: bottomSheet.originalText,
            category: bottomSheet.originalCategory,
            duration: bottomSheet.originalDuration,
            startTime: bottomSheet.originalStartTime,
            status: bottomSheet.originalStatus
          });
        }
        e.stopPropagation();
        return;
      }
    }

    const target = e.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;

    if (action === 'select-date') {
      selectDate(target.dataset.date);
    } else if (action === 'go-today') {
      goToday();
    } else if (action === 'add-todo') {
      addTodoWithBottomSheet(target.dataset.subject);
    } else if (action === 'cycle-status') {
      e.stopPropagation(); // 부모 요소로 이벤트 전파 방지
      e.preventDefault(); // 기본 동작 방지

      // 모든 포커스 제거 및 선택 해제
      if (document.activeElement) {
        document.activeElement.blur();
      }
      window.getSelection().removeAllRanges();

      // 체크박스 영역의 모든 input 요소 찾아서 포커스 방지
      const todoItem = target.closest('.todo-item');
      if (todoItem) {
        const inputs = todoItem.querySelectorAll('input');
        inputs.forEach(input => {
          input.blur();
          input.setAttribute('readonly', 'true');
        });
      }

      openStatusBottomSheet(parseInt(target.dataset.todoId));
    } else if (action === 'edit-todo') {
      // Input은 이제 클릭 가능
      editTodo(parseInt(target.dataset.todoId));
    } else if (action === 'add-main') {
      // 메인 추가 버튼 (랜덤 과목 선택)
      const randomSubject = subjects[Math.floor(Math.random() * subjects.length)].id;
      addTodoWithBottomSheet(randomSubject);
    }
  });

  // Todo 제목 입력 (A타입만)
  document.addEventListener('input', (e) => {
    if (e.target.classList.contains('todo-title') && CURRENT_VARIANT !== 'b') {
      const todoId = parseInt(e.target.dataset.todoId);
      const todo = findTodoById(todoId);
      if (todo) {
        todo.text = e.target.value;
      }
    }
  });
}

// ========================================
// Sample Data
// ========================================

function loadSampleData() {
  const today = new Date();
  const fmt = d => formatDate(d);
  const offset = n => { const x = new Date(today); x.setDate(today.getDate() + n); return x; };

  todos[fmt(today)] = [
    { id: nextId++, subjectId: 'science', text: '지구과학 1-3단원 요점 암기', status: 'empty', time: '오후 2:00', duration: '45분', overdue: false },
    { id: nextId++, subjectId: 'science', text: '생물 2단원 오답노트 정리', status: 'empty', time: null, duration: null, overdue: false },
    { id: nextId++, subjectId: 'math', text: '미적분 1단원 문제 풀이', status: 'empty', time: '오후 2:00', duration: '1시간 30분', overdue: false },
    { id: nextId++, subjectId: 'math', text: '기하 3단원 심화 학습', status: 'done', time: '오후 2:00', duration: '1시간 15분', overdue: false },
    { id: nextId++, subjectId: 'english', text: '영단어 암기', status: 'progress', time: null, duration: null, overdue: false },
  ];

  todos[fmt(offset(1))] = [
    { id: nextId++, subjectId: 'math', text: '수학 복습', status: 'empty', time: null, duration: null, overdue: false },
    { id: nextId++, subjectId: 'history', text: '역사 시험 준비', status: 'empty', time: null, duration: null, overdue: false },
  ];
}

// ========================================
// Init
// ========================================

function init() {
  // Inject header
  const appDiv = document.getElementById('app');
  appDiv.innerHTML = renderHeader();

  // Create content and tabbar
  const contentDiv = document.createElement('div');
  contentDiv.className = 'content';
  contentDiv.id = 'content';
  appDiv.appendChild(contentDiv);

  const tabbarDiv = document.createElement('div');
  tabbarDiv.className = 'tabbar';
  tabbarDiv.innerHTML = `
    <div class="tabbar-gradient"></div>
    <div class="tabbar-inner">
      <div class="tabbar-group">
        <div class="tabbar-group-bg"></div>
        <button class="tab-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          </svg>
          <span class="tab-btn-label">홈</span>
        </button>
        <button class="tab-btn active">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 5a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 3a1 1 0 000 2h4a1 1 0 100-2H7zm0 4a1 1 0 100 2h8a1 1 0 100-2H7zm0 4a1 1 0 100 2h6a1 1 0 100-2H7z"/>
          </svg>
          <span class="tab-btn-label">할일</span>
        </button>
        <button class="tab-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span class="tab-btn-label">캘린더</span>
        </button>
        <button class="tab-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87"/>
            <path d="M16 3.13a4 4 0 010 7.75"/>
          </svg>
          <span class="tab-btn-label">그룹</span>
        </button>
      </div>
      <button class="tabbar-add" data-action="add-main">
        <div class="tabbar-add-bg"></div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </div>
    <div class="tabbar-indicator">
      <div class="tabbar-indicator-bar"></div>
    </div>
  `;
  appDiv.appendChild(tabbarDiv);

  // Load sample data
  loadSampleData();

  // Setup event delegation
  setupEventDelegation();

  // Initial render
  updateToolbarDate();
  renderWeekDayBar();
  renderContent();

  // Setup go today button
  document.getElementById('btnGoToday').addEventListener('click', goToday);

  // Swipe to navigate
  setupSwipeNavigation();
}

function setupSwipeNavigation() {
  let touchStartX = 0;
  const contentEl = document.getElementById('content');

  contentEl.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  contentEl.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 80) {
      const d = new Date(selectedDate + 'T00:00:00');
      d.setDate(d.getDate() + (dx < 0 ? 1 : -1));
      selectDate(formatDate(d));
    }
  }, { passive: true });
}

// Start app
init();
