import { create } from 'zustand';
import { formatDate } from '../utils/dateUtils';
import { findTodoById } from '../utils/todoUtils';

const useTodoStore = create((set, get) => ({
  // ===== State =====
  todos: {},
  nextId: 1,
  baseDate: new Date(),
  selectedDate: formatDate(new Date()),
  editingTodoId: null,
  currentVariant: 'b', // 'a' or 'b'
  currentView: 'day', // 'day' | 'week'

  bottomSheetVisible: false,
  bottomSheetMode: 'full',
  bottomSheetData: {
    todoId: null,
    category: null,
    status: 'empty',
    text: '',
    time: '',
    duration: null,
  },
  // 취소 시 복원용 원본 데이터
  originalBottomSheetData: null,

  // ===== Date Actions =====
  selectDate: (dateStr) => set({ selectedDate: dateStr }),

  goToday: () => {
    const today = new Date();
    set({
      baseDate: today,
      selectedDate: formatDate(today),
    });
  },

  nextWeek: () => {
    const base = get().baseDate;
    const next = new Date(base);
    next.setDate(base.getDate() + 7);
    set({ baseDate: next });
  },

  prevWeek: () => {
    const base = get().baseDate;
    const prev = new Date(base);
    prev.setDate(base.getDate() - 7);
    set({ baseDate: prev });
  },

  // ===== Todo Actions =====
  addTodo: (subjectId) => {
    const { selectedDate, nextId, editingTodoId, todos } = get();

    // 기존 편집 중인 항목 처리
    if (editingTodoId !== null) {
      const result = findTodoById(todos, editingTodoId);
      if (result) {
        const { todo } = result;
        // 같은 과목이면 무시
        if (todo.subjectId === subjectId) return;
        // 다른 과목이면 삭제
        get().deleteTodo(editingTodoId);
      }
    }

    const newTodo = {
      id: nextId,
      subjectId,
      text: '',
      status: 'empty',
      time: null,
      duration: null,
      overdue: false,
    };

    const bottomSheetData = {
      todoId: nextId,
      category: subjectId,
      status: 'empty',
      text: '',
      time: '',
      duration: null,
    };

    set({
      todos: {
        ...todos,
        [selectedDate]: [...(todos[selectedDate] || []), newTodo],
      },
      nextId: nextId + 1,
      editingTodoId: nextId,
      bottomSheetVisible: true,
      bottomSheetMode: 'full',
      bottomSheetData: bottomSheetData,
      // 취소 시 복원용 (새 항목은 빈 텍스트이므로 취소 시 삭제됨)
      originalBottomSheetData: { ...bottomSheetData },
    });
  },

  updateTodo: (id, changes) => {
    const { todos } = get();
    const result = findTodoById(todos, id);

    if (!result) return;

    const { todo, dateStr } = result;
    const list = todos[dateStr] || [];
    const index = list.findIndex(t => t.id === id);

    if (index === -1) return;

    const updated = [...list];
    updated[index] = { ...updated[index], ...changes };

    set({
      todos: {
        ...todos,
        [dateStr]: updated,
      },
    });
  },

  deleteTodo: (id) => {
    const { todos } = get();
    const result = findTodoById(todos, id);

    if (!result) return;

    const { dateStr } = result;
    const list = todos[dateStr] || [];

    set({
      todos: {
        ...todos,
        [dateStr]: list.filter(t => t.id !== id),
      },
      editingTodoId: null,
    });
  },

  // ===== BottomSheet Actions =====
  openBottomSheet: (mode, data) => {
    // 원본 데이터 저장 (취소 시 복원용)
    set({
      bottomSheetVisible: true,
      bottomSheetMode: mode,
      bottomSheetData: data,
      originalBottomSheetData: { ...data },
      editingTodoId: data.todoId,
    });
  },

  closeBottomSheet: () => {
    const { editingTodoId, originalBottomSheetData } = get();

    // 취소: 원본 데이터로 복원
    if (editingTodoId !== null && originalBottomSheetData) {
      // 빈 텍스트면 삭제
      if (!originalBottomSheetData.text.trim()) {
        get().deleteTodo(editingTodoId);
      } else {
        // 원본 데이터로 복원
        get().updateTodo(editingTodoId, {
          text: originalBottomSheetData.text,
          subjectId: originalBottomSheetData.category,
          status: originalBottomSheetData.status,
          time: originalBottomSheetData.time === 'none' ? null : originalBottomSheetData.time,
          duration: originalBottomSheetData.duration,
        });
      }
    }

    set({
      bottomSheetVisible: false,
      editingTodoId: null,
      originalBottomSheetData: null,
    });
  },

  updateBottomSheetField: (field, value) => {
    const { bottomSheetData, editingTodoId } = get();

    // Store 업데이트
    set({
      bottomSheetData: {
        ...bottomSheetData,
        [field]: value,
      },
    });

    // 실시간 Todo 업데이트
    if (editingTodoId !== null) {
      const updateData = {};
      if (field === 'category') updateData.subjectId = value;
      else if (field === 'time') updateData.time = value === 'none' ? null : value;
      else updateData[field] = value;

      get().updateTodo(editingTodoId, updateData);
    }
  },

  saveBottomSheet: () => {
    const { bottomSheetData, editingTodoId } = get();

    if (editingTodoId !== null) {
      get().updateTodo(editingTodoId, {
        text: bottomSheetData.text,
        subjectId: bottomSheetData.category,
        status: bottomSheetData.status,
        time: bottomSheetData.time === 'none' ? null : bottomSheetData.time,
        duration: bottomSheetData.duration,
      });
    }

    set({
      bottomSheetVisible: false,
      editingTodoId: null,
      originalBottomSheetData: null,
    });
  },

  setVariant: (variant) => set({ currentVariant: variant }),
  setView: (view) => set({ currentView: view }),
  setBaseDate: (date) => set({ baseDate: date }),
}));

export default useTodoStore;
