import useTodoStore from '../../store/useTodoStore';
import { subjects } from '../../config';
import SubjectSection from './SubjectSection';

export default function Content() {
  const todos = useTodoStore(state => state.todos);
  const selectedDate = useTodoStore(state => state.selectedDate);

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
