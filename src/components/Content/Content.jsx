import useTodoStore from '../../store/useTodoStore';
import WeeklyContent from './WeeklyContent';
import MonthlyContent from './MonthlyContent';
import DayView from './DayView';

export default function Content() {
  const currentView = useTodoStore(state => state.currentView);

  if (currentView === 'week')  return <WeeklyContent />;
  if (currentView === 'month') return <MonthlyContent />;

  return <DayView />;
}
