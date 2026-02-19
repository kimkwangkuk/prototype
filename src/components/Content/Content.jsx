import useTodoStore from '../../store/useTodoStore';
import { subjects } from '../../config';
import SubjectSection from './SubjectSection';
import WeeklyContent from './WeeklyContent';
import MonthlyContent from './MonthlyContent';

export default function Content() {
  const todos = useTodoStore(state => state.todos);
  const selectedDate = useTodoStore(state => state.selectedDate);
  const currentView = useTodoStore(state => state.currentView);

  if (currentView === 'week') {
    return <WeeklyContent />;
  }

  if (currentView === 'month') {
    return <MonthlyContent />;
  }

  const list = todos[selectedDate] || [];

  // Subject별 그룹핑
  const grouped = subjects.reduce((acc, subj) => {
    acc[subj.id] = list.filter(t => t.subjectId === subj.id);
    return acc;
  }, {});

  return (
    <div className="content" id="content">
      {subjects.map(subj => (
        <SubjectSection
          key={subj.id}
          subject={subj}
          todos={grouped[subj.id]}
        />
      ))}
    </div>
  );
}
