export function getTodoCount(todos, dateStr) {
  const list = todos[dateStr] || [];
  return list.filter(t => t.status === 'empty' || t.status === 'progress').length;
}

export function hasCheckIcon(todos, dateStr) {
  const list = todos[dateStr] || [];
  return list.length > 0 &&
         list.every(t => t.status === 'done' || t.status === 'skip' || t.status === 'cancel');
}

export function findTodoById(todos, id) {
  for (const dateStr in todos) {
    const found = todos[dateStr].find(t => t.id === id);
    if (found) return { todo: found, dateStr };
  }
  return null;
}

export function groupBySubject(todos, subjects) {
  return subjects.reduce((acc, subj) => {
    acc[subj.id] = todos.filter(t => t.subjectId === subj.id);
    return acc;
  }, {});
}

export function cycleStatus(currentStatus) {
  const cycle = ['empty', 'progress', 'done'];
  const idx = cycle.indexOf(currentStatus);
  return cycle[(idx + 1) % cycle.length];
}
