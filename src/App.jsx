import { useEffect } from 'react';
import './styles.css';
import Header from './components/Header/Header';
import Content from './components/Content/Content';
import BottomSheet from './components/BottomSheet/BottomSheet';
import Tabbar from './components/Tabbar/Tabbar';
import useTodoStore from './store/useTodoStore';
import { formatDate } from './utils/dateUtils';
import { formatTime, formatDuration } from './utils/timeUtils';

export default function App() {
  const todos = useTodoStore(state => state.todos);
  const nextId = useTodoStore(state => state.nextId);

  // 샘플 데이터 로드 (최초 1회)
  useEffect(() => {
    if (Object.keys(todos).length === 0) {
      const today = new Date();
      const fmt = (d) => formatDate(d);
      const offset = (days) => {
        const d = new Date(today);
        d.setDate(today.getDate() + days);
        return d;
      };

      let id = nextId;

      useTodoStore.setState({
        todos: {
          [fmt(today)]: [
            { id: id++, subjectId: 'math', text: '수학 과제 풀기', status: 'done', time: formatTime('14:00'), duration: formatDuration(60), overdue: false },
            { id: id++, subjectId: 'english', text: '영단어 암기', status: 'progress', time: null, duration: null, overdue: false },
          ],
          [fmt(offset(1))]: [
            { id: id++, subjectId: 'math', text: '수학 복습', status: 'empty', time: null, duration: null, overdue: false },
            { id: id++, subjectId: 'history', text: '역사 시험 준비', status: 'empty', time: null, duration: null, overdue: false },
          ],
        },
        nextId: id,
      });
    }
  }, []);

  return (
    <>
      <Header />
      <Content />
      <Tabbar />
      <BottomSheet />
    </>
  );
}
